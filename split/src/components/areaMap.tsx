/* the interactive map every page shares — the places as dots, the picked ones numbered, the route between them, and a preview of whatever the pointer is over */
/* the map is built once, outside react, and lives in a host element react never touches again: this component is what reads that instance and paints it */

import { useEffect, useMemo, useRef, useState } from "react";
import Icon from "./icon.tsx";
import RouteShape from "./routeShape.tsx";
import {
  hasGoogleMapsKey,
  loadGoogleMaps,
  mapColorScheme,
  mapOptions,
  onGoogleMapsAuthFailure,
  routeLineColors,
} from "../data/googleMaps.ts";
import { poiCategoryIcon } from "../data/pointsOfInterest.ts";
import { formatDistance, formatRating } from "../format.ts";
import type {
  LatLng,
  PoiEra,
  PointOfInterest,
  RouteGeometry,
} from "../types.ts";

/* the line's two weights, the same recipe the cards use: a white casing under the brand line */
const LINE_STYLE = { casing: 10, line: 5, zIndex: 1 };

/* how far apart two dots have to sit before they stop covering each other, in pixels */
const DOT_GAP = 24;

/* the most a dot is pushed off its own position: past this the nudge would be a lie about where a place is */
const MAX_SHIFT = 14;

interface AreaMapProps {
  /* the places to pin */
  points: PointOfInterest[];
  /* the route through the picked places, when there is one */
  line?: RouteGeometry | null;
  /* the visit order per place id, so the map and the list beside it agree */
  order?: Map<string, number>;
  /* the one place the page is about, drawn with a ring */
  highlightId?: string | null;
  /* a click on a dot; the page decides whether that picks, toggles or only selects */
  onClickPoint?: (id: string) => void;
  /* what the preview says a click does, which differs per page */
  clickHint?: string;
  /* what the corner chip says */
  label: string;
  /* what the map shows, for readers who cannot use it */
  description: string;
  /* how tall the map stands; the builder asks for a taller one, because there the map is the work surface */
  heightClassName?: string;
  className?: string;
}

export default function AreaMap({
  points,
  line = null,
  order,
  highlightId = null,
  onClickPoint,
  clickHint = "Klik om deze plek te kiezen",
  label,
  description,
  heightClassName = "h-[clamp(20rem,50vh,34rem)]",
  className = "",
}: AreaMapProps) {
  const hostRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const linesRef = useRef<google.maps.Polyline[]>([]);
  const dotsRef = useRef(
    new Map<
      string,
      { marker: google.maps.marker.AdvancedMarkerElement; element: HTMLElement }
    >(),
  );
  /* the api's listeners live outside react, so they read the current callbacks through refs rather than stale closures */
  const clickRef = useRef(onClickPoint);
  const spreadRef = useRef<() => void>(() => {});
  /* the map is built outside react: a number that goes up every time one exists is what tells the effects below there is something to draw on */
  const [mapGeneration, setMapGeneration] = useState(0);
  const [colorScheme, setColorScheme] = useState(mapColorScheme());
  /* a checkout without a key never loads the api at all, so the map starts out failed rather than being sent there by an effect */
  const [failed, setFailed] = useState(!hasGoogleMapsKey);
  /* which dot the pointer is over, and where to put its card */
  const [preview, setPreview] = useState<{
    id: string;
    x: number;
    y: number;
  } | null>(null);

  useEffect(() => {
    clickRef.current = onClickPoint;
  }, [onClickPoint]);

  /* where the pointer is, in the wrapper's own coordinates */
  function showPreview(id: string, element: HTMLElement) {
    const wrapper = element.closest(".relative");
    if (!wrapper) return;

    const dot = element.getBoundingClientRect();
    const box = wrapper.getBoundingClientRect();

    setPreview({
      id,
      x: dot.left - box.left + dot.width / 2,
      y: dot.top - box.top,
    });
  }

  /* push apart the dots that would sit on top of each other, so every place keeps a spot of its own to be clicked; the map calls it through a ref, which is set below on every render, so it always sees the current places and zoom */
  function spreadDots() {
    const map = mapRef.current;
    const zoom = map?.getZoom();
    if (!map || zoom === undefined) return;

    const placed: { x: number; y: number }[] = [];

    for (const point of points) {
      const dot = dotsRef.current.get(point.id);
      if (!dot || !isCoordinate(point.coordinates)) continue;

      const world = worldPixels(point.coordinates, zoom);
      let x = world.x;
      let y = world.y;

      for (const other of placed) {
        const dx = x - other.x;
        const dy = y - other.y;
        const distance = Math.max(Math.hypot(dx, dy), 0.001);

        if (distance >= DOT_GAP) continue;

        const push = (DOT_GAP - distance) / 2 + 1;
        x += (dx / distance) * push;
        y += (dy / distance) * push;
      }

      placed.push({ x, y });

      dot.element.style.setProperty(
        "--dot-shift",
        `${clamp(x - world.x)}px ${clamp(y - world.y)}px`,
      );
    }
  }

  useEffect(() => {
    spreadRef.current = spreadDots;
  });

  /* the api reads colorScheme when the map is made and ignores setOptions afterwards (measured), so the theme is state: changing it replaces the map */
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setColorScheme(mapColorScheme()),
    );
    observer.observe(document.body, { attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    /* the api's own bookkeeping, captured once: a ref read inside a cleanup is a value that cannot be promised still to be the same one */
    const dots = dotsRef.current;
    const lines = linesRef.current;
    if (!host) return;

    let alive = true;

    loadGoogleMaps()
      .then(() => {
        if (!alive) return;

        const map = new google.maps.Map(host, {
          ...mapOptions(),
          colorScheme,
        });

        mapRef.current = map;
        /* the dots are spread again whenever the map settles, because how much they overlap depends on the zoom */
        map.addListener("idle", () => spreadRef.current());
        setMapGeneration((current) => current + 1);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
      /* the host element is react's, but what is inside it belongs to the api: emptying it is what lets a second map take the first one's place (and what makes a strict-mode remount start clean) */
      host.replaceChildren();
      lines.length = 0;
      dots.clear();
    };
  }, [colorScheme]);

  /* mounted twice, subscribed twice, unsubscribed twice — the api hands the same failure to every listener */
  useEffect(() => onGoogleMapsAuthFailure(() => setFailed(true)), []);

  /* the dots belong to the api, so a changed set of places is reconciled by id rather than re-rendered */
  useEffect(() => {
    const map = mapRef.current;
    const seen = new Set<string>();

    if (mapGeneration > 0 && map) {
      for (const point of points) {
        seen.add(point.id);
        if (dotsRef.current.has(point.id)) continue;

        const element = document.createElement("div");
        paintDot(element, { era: point.era, order: null, highlighted: false });

        const marker = new google.maps.marker.AdvancedMarkerElement({
          map,
          position: point.coordinates,
          title: point.name,
          gmpClickable: true,
          content: element,
          zIndex: 3,
        });

        marker.addEventListener("gmp-click", () =>
          clickRef.current?.(point.id),
        );
        /* the preview follows the pointer, and the keyboard gets it through focus */
        element.addEventListener("mouseenter", () =>
          showPreview(point.id, element),
        );
        element.addEventListener("mouseleave", () => setPreview(null));
        element.addEventListener("focus", () => showPreview(point.id, element));
        element.addEventListener("blur", () => setPreview(null));

        dotsRef.current.set(point.id, { marker, element });
      }
    }

    dotsRef.current.forEach(({ marker }, id) => {
      if (seen.has(id)) return;
      marker.setMap(null);
      dotsRef.current.delete(id);
    });
  }, [mapGeneration, points]);

  /* what each dot looks like: its era's fill, its number once it has joined the route, a ring while the page is about it */
  useEffect(() => {
    dotsRef.current.forEach(({ element }, id) => {
      const point = points.find((candidate) => candidate.id === id);
      if (!point) return;

      paintDot(element, {
        era: point.era,
        order: order?.get(id) ?? null,
        highlighted: id === highlightId,
      });
    });

    spreadRef.current();
  }, [mapGeneration, points, order, highlightId]);

  /* the frame the map opens on: every place it has, with room for the dots' own size */
  useEffect(() => {
    const map = mapRef.current;
    if (mapGeneration === 0 || !map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point.coordinates));

    if (!bounds.isEmpty()) map.fitBounds(bounds, 56);
  }, [mapGeneration, points]);

  /* the line through the picked places: two polylines, and the api's road-following path when it had one */
  /* the path is filtered down to real coordinates first: a line is a drawing, and a drawing must never be able to blank the page it is on */
  const linePath = useMemo(
    () =>
      (line?.path ?? [])
        .filter(isCoordinate)
        .map(({ lat, lng }) => ({ lat, lng })),
    [line?.path],
  );

  useEffect(() => {
    linesRef.current.forEach((drawn) => drawn.setMap(null));
    linesRef.current = [];

    const map = mapRef.current;
    if (mapGeneration === 0 || !map || linePath.length < 2) return;

    const colors = routeLineColors();
    const path = linePath;

    linesRef.current = [
      new google.maps.Polyline({
        path,
        map,
        strokeColor: colors.casing,
        strokeWeight: LINE_STYLE.casing,
        clickable: false,
        zIndex: LINE_STYLE.zIndex,
      }),
      new google.maps.Polyline({
        path,
        map,
        strokeColor: colors.line,
        strokeWeight: LINE_STYLE.line,
        clickable: false,
        zIndex: LINE_STYLE.zIndex + 1,
      }),
    ];
  }, [mapGeneration, linePath, colorScheme]);

  const previewPoint = preview
    ? (points.find((point) => point.id === preview.id) ?? null)
    : null;

  if (failed)
    return (
      <MapUnavailable
        {...{ label, description, line, heightClassName, className }}
      />
    );

  return (
    <div className={`relative ${className}`}>
      <div className="surface relative overflow-hidden rounded-box border-2 border-line">
        <div ref={hostRef} className={`${heightClassName} w-full`} />

        {mapGeneration === 0 && (
          <p className="absolute inset-0 grid place-items-center text-sm text-ink-muted">
            Kaart wordt geladen…
          </p>
        )}

        {previewPoint && preview && (
          <PreviewCard
            point={previewPoint}
            hint={clickHint}
            x={preview.x}
            y={preview.y}
          />
        )}
      </div>

      <MapChip label={label} className="absolute left-4 top-4 z-10" />
      <p className="sr-only">{description}</p>
    </div>
  );
}

/* the place the pointer is over: its picture when there is one, and who it is and what a click does otherwise. it takes no pointer events, so it can never steal the hover from the dot it belongs to */
function PreviewCard({
  point,
  hint,
  x,
  y,
}: {
  point: PointOfInterest;
  hint: string;
  x: number;
  y: number;
}) {
  return (
    <div
      className="surface-container-lowest pointer-events-none absolute z-20 w-56 -translate-x-1/2 -translate-y-[calc(100%+0.75rem)] overflow-hidden rounded-xl border-2 border-line"
      style={{ left: x, top: y }}
    >
      {point.image ? (
        <img
          src={point.image}
          alt=""
          className="h-28 w-full object-cover"
          loading="lazy"
        />
      ) : (
        <div className="surface-container flex h-28 w-full items-center justify-center">
          <Icon
            name={poiCategoryIcon(point.category)}
            className="text-3xl text-ink-muted"
          />
        </div>
      )}

      <div className="p-3">
        <p className="text-sm font-bold text-ink">{point.name}</p>
        <p className="mt-0.5 text-xs text-ink-muted">
          {point.category} · {point.era} · {formatDistance(point.distanceKm)}{" "}
          vanaf de Grote Markt
        </p>

        {point.address && (
          <p className="mt-1 text-xs text-ink-muted">{point.address}</p>
        )}

        <p className="mt-2 flex items-center gap-1 text-xs font-semibold text-accent">
          <Icon name="star" className="fill text-base" />
          {formatRating(point.rating)} · {hint}
        </p>
      </div>
    </div>
  );
}

/* what a page shows when the api cannot be reached: the route's own shape and a sentence, and no invented map */
function MapUnavailable({
  label,
  description,
  line,
  heightClassName,
  className,
}: {
  label: string;
  description: string;
  line: RouteGeometry | null;
  heightClassName: string;
  className: string;
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="surface relative overflow-hidden rounded-box border-2 border-line">
        <div
          className={`flex ${heightClassName} w-full flex-col items-center justify-center gap-4 p-6 text-center`}
        >
          {line && line.path.length > 1 ? (
            <RouteShape points={line.path} className="h-40 w-full max-w-md" />
          ) : (
            <Icon name="place" className="text-3xl text-ink-muted" />
          )}
          <p className="max-w-md text-sm text-ink-muted">
            De kaart kon niet geladen worden. {description} Probeer het later
            opnieuw.
          </p>
        </div>
      </div>

      <MapChip label={label} className="absolute left-4 top-4 z-10" />
    </div>
  );
}

/* the small label that names what a map shows; the dot keeps the artwork's fixed orange because it must match the route line (DESIGN.md §8) */
function MapChip({ label, className = "" }: { label: string; className?: string }) {
  return (
    <span
      className={`chip surface-container-lowest text-xs font-semibold ${className}`}
    >
      <span
        className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500"
        aria-hidden="true"
      />
      {label}
    </span>
  );
}

/* one place's whole appearance, in one function: today's places wear the brand orange, the ones van toen the brand blue — the same two colours the whole site is built from — and a place that is on the route carries its number */
function paintDot(
  element: HTMLElement,
  {
    era,
    order,
    highlighted,
  }: { era: PoiEra; order: number | null; highlighted: boolean },
): void {
  const current = era === "Nu";

  element.className = [
    "flex items-center justify-center rounded-full border-2 font-bold leading-none transition-transform",
    /* the shift the map works out for overlapping dots arrives as a custom property */
    "[translate:var(--dot-shift,0_0)]",
    current
      ? "border-white bg-orange-500 text-white"
      : "border-white bg-blue-500 text-white",
    order === null ? "h-4 w-4 text-[11px]" : "h-6 w-6 text-[13px]",
    order !== null || highlighted ? "scale-125" : "",
  ].join(" ");

  element.textContent = order === null ? "" : String(order);
}

/* web mercator pixels at this zoom — the map's own maths, and enough to tell which dots would cover each other */
function worldPixels(
  { lat, lng }: LatLng,
  zoom: number,
): { x: number; y: number } {
  const scale = 256 * 2 ** zoom;
  const sinLatitude = Math.sin((lat * Math.PI) / 180);

  return {
    x: ((lng + 180) / 360) * scale,
    y:
      (0.5 - Math.log((1 + sinLatitude) / (1 - sinLatitude)) / (4 * Math.PI)) *
      scale,
  };
}

/* the nudge is capped, so a dot never claims to be somewhere it is not */
function clamp(shift: number): number {
  return Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, Math.round(shift)));
}

/* whatever is not a real coordinate, wherever it came from, is not something this map draws */
function isCoordinate(point: LatLng | undefined): point is LatLng {
  return (
    point !== undefined &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  );
}
