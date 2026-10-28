/* the map instance is built outside react; this component only reads and draws it */

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import "./areaMap.css";
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
import { PLACE_IMAGES } from "../data/placeImages.ts";
import { formatDistance, formatRating } from "../format.ts";
import type {
  LatLng,
  PoiEra,
  PointOfInterest,
  RouteGeometry,
} from "../types.ts";

const LINE_STYLE = { casing: 10, line: 5, zIndex: 1 };

/* preview card size; keep in sync with the card (w-56) */
const PREVIEW_WIDTH = 224;
const PREVIEW_HEIGHT = 296;
const PREVIEW_GAP = 12;

/* min gap between dots, px; MAX_SHIFT handles what still overlaps */
const DOT_GAP = 32;

const MAX_SHIFT = 14;

interface AreaMapProps {
  points: PointOfInterest[];
  line?: RouteGeometry | null;
  order?: Map<string, number>;
  highlightId?: string | null;
  onClickPoint?: (id: string) => void;
  clickHint?: string;
  label: string;
  description: string;
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
  const frameRef = useRef<HTMLDivElement | null>(null);
  const mapRef = useRef<google.maps.Map | null>(null);
  const linesRef = useRef<google.maps.Polyline[]>([]);
  const dotsRef = useRef(
    new Map<
      string,
      { marker: google.maps.marker.AdvancedMarkerElement; element: HTMLElement }
    >(),
  );
  /* api listeners live outside react, so callbacks are read via refs */
  const clickRef = useRef(onClickPoint);
  const spreadRef = useRef<() => void>(() => {});
  /* bumped when a map is created so the effects re-run */
  const [mapGeneration, setMapGeneration] = useState(0);
  const [colorScheme, setColorScheme] = useState(mapColorScheme());
  /* no key: the api never loads, so start in the failed state */
  const [failed, setFailed] = useState(!hasGoogleMapsKey);
  const [preview, setPreview] = useState<{
    id: string;
    x: number;
    y: number;
    below: boolean;
  } | null>(null);

  // google maps redraws the whole map on every size change, which made resizing the window lag.
  // the map gets a fixed px size that only catches up with its frame once resizing stops
  useLayoutEffect(() => {
    const frame = frameRef.current;
    const host = hostRef.current;
    if (!frame || !host) return;

    function matchFrame() {
      host!.style.width = `${frame!.clientWidth}px`;
      host!.style.height = `${frame!.clientHeight}px`;
    }

    matchFrame();

    let timer: number | undefined;
    const observer = new ResizeObserver(() => {
      window.clearTimeout(timer);
      timer = window.setTimeout(matchFrame, 150);
    });
    observer.observe(frame);

    return () => {
      observer.disconnect();
      window.clearTimeout(timer);
    };
  }, []);

  useEffect(() => {
    clickRef.current = onClickPoint;
  }, [onClickPoint]);

  function showPreview(id: string, element: HTMLElement) {
    const wrapper = element.closest(".relative");
    if (!wrapper) return;

    const dot = element.getBoundingClientRect();
    const box = wrapper.getBoundingClientRect();
    const half = PREVIEW_WIDTH / 2;
    const centre = dot.left - box.left + dot.width / 2;
    const top = dot.top - box.top;
    const bottom = dot.bottom - box.top;
    /* flip the card below the dot when there's no room above */
    const below =
      top < PREVIEW_HEIGHT + PREVIEW_GAP &&
      box.height - bottom >= PREVIEW_HEIGHT + PREVIEW_GAP;

    setPreview({
      id,
      x: Math.max(half + 8, Math.min(centre, box.width - half - 8)),
      y: below ? bottom : top,
      below,
    });
  }

  /* called via a ref so it always sees the current points and zoom */
  function spreadDots() {
    const map = mapRef.current;
    const zoom = map?.getZoom();
    if (!map || zoom === undefined) return;

    const placed: { x: number; y: number }[] = [];

    // numbered stops go first and never move, so the route line always meets them;
    // only the plain dots get pushed out of the way
    const stopsFirst = [...points].sort(
      (a, b) => Number(order?.has(b.id)) - Number(order?.has(a.id)),
    );

    for (const point of stopsFirst) {
      const dot = dotsRef.current.get(point.id);
      if (!dot || !isCoordinate(point.coordinates)) continue;

      const world = worldPixels(point.coordinates, zoom);
      let x = world.x;
      let y = world.y;

      for (const other of order?.has(point.id) ? [] : placed) {
        const dx = x - other.x;
        const dy = y - other.y;
        const distance = Math.max(Math.hypot(dx, dy), 0.001);

        if (distance >= DOT_GAP) continue;

        const push = (DOT_GAP - distance) / 2 + 1;
        x += (dx / distance) * push;
        y += (dy / distance) * push;
      }

      placed.push({ x, y });

      dot.element.style.setProperty("--dot-x", `${clamp(x - world.x)}px`);
      dot.element.style.setProperty("--dot-y", `${clamp(y - world.y)}px`);
    }
  }

  useEffect(() => {
    spreadRef.current = spreadDots;
  });

  /* colorScheme only applies at creation; setOptions ignores it */
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setColorScheme(mapColorScheme()),
    );
    observer.observe(document.body, { attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    /* copy refs for the cleanup, they may have changed by then */
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
        map.addListener("idle", () => spreadRef.current());
        setMapGeneration((current) => current + 1);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
      /* clear google's leftover dom so a remount starts clean */
      host.replaceChildren();
      lines.length = 0;
      dots.clear();
    };
  }, [colorScheme]);

  useEffect(() => onGoogleMapsAuthFailure(() => setFailed(true)), []);

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

  useEffect(() => {
    const map = mapRef.current;
    if (mapGeneration === 0 || !map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point.coordinates));

    if (!bounds.isEmpty()) map.fitBounds(bounds, 56);
  }, [mapGeneration, points]);

  /* skip invalid coordinates so a bad path can't blank the map */
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
      <div
        ref={frameRef}
        className={`surface relative overflow-hidden [contain:layout_paint] rounded-box border-2 border-line ${heightClassName}`}
      >
        {/* rounded-none: the frame clips its own corner. the size is set in px by the effect above */}
        <div ref={hostRef} className="absolute left-0 top-0 rounded-none" />

        {mapGeneration === 0 && (
          <p className="absolute inset-0 grid place-items-center text-sm text-ink-muted">
            Kaart wordt geladen…
          </p>
        )}
      </div>

      {/* outside the clipping frame, so an edge dot still gets a whole card */}
      {previewPoint && preview && (
        <PreviewCard
          point={previewPoint}
          hint={clickHint}
          x={preview.x}
          y={preview.y}
          below={preview.below}
        />
      )}

      <MapChip label={label} className="absolute left-4 top-4 z-10" />
      {mapGeneration > 0 && (
        <ZoomControls
          onZoom={(step) => {
            const map = mapRef.current;
            map?.setZoom((map.getZoom() ?? 14) + step);
          }}
        />
      )}
      <p className="sr-only">{description}</p>
    </div>
  );
}

// + and - as one vertical pill, in the site's own style instead of google's square buttons
function ZoomControls({ onZoom }: { onZoom: (step: number) => void }) {
  return (
    <div className="surface-container-lowest absolute right-4 top-4 z-10 flex flex-col overflow-hidden rounded-full border-2 border-line">
      <button
        type="button"
        aria-label="Inzoomen"
        onClick={() => onZoom(1)}
        className="circle transparent ripple rounded-none text-ink"
      >
        <Icon name="add" />
      </button>
      <span className="mx-2 h-0.5 rounded-none bg-(--outline-variant)" />
      <button
        type="button"
        aria-label="Uitzoomen"
        onClick={() => onZoom(-1)}
        className="circle transparent ripple rounded-none text-ink"
      >
        <Icon name="remove" />
      </button>
    </div>
  );
}

/* pointer-events-none so the card can never steal hover from its dot */
function PreviewCard({
  point,
  hint,
  x,
  y,
  below,
}: {
  point: PointOfInterest;
  hint: string;
  x: number;
  y: number;
  below: boolean;
}) {
  const image = point.image ?? PLACE_IMAGES[point.id];

  return (
    <div
      className={`surface-container-lowest pointer-events-none absolute z-20 w-56 -translate-x-1/2 overflow-hidden rounded-box border-2 border-line ${
        below ? "translate-y-3" : "-translate-y-[calc(100%+0.75rem)]"
      }`}
      style={{ left: x, top: y }}
    >
      {/* rounded-none: the card clips its corner, so children stay square */}
      {image ? (
        <img
          src={image}
          alt=""
          aria-hidden="true"
          className="h-28 w-full rounded-none object-cover"
          loading="lazy"
        />
      ) : (
        <div className="surface-container flex h-28 w-full items-center justify-center rounded-none">
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
          className={`flex ${heightClassName} w-full flex-col items-center justify-center gap-4 rounded-none p-6 text-center`}
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

/* fixed orange to match the route line */
function MapChip({
  label,
  className = "",
}: {
  label: string;
  className?: string;
}) {
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
    /* markers are anchored at their bottom centre; +50% puts the dot's centre on the spot */
    "[translate:var(--dot-x,0px)_calc(var(--dot-y,0px)_+_50%)]",
    /* before:-inset-3.5 gives a 48px touch area */
    "before:absolute before:-inset-3.5 before:content-['']",
    current
      ? "border-white bg-orange-500 text-white"
      : "border-white bg-blue-500 text-white",
    order === null ? "h-6 w-6 text-[12px]" : "h-8 w-8 text-[14px]",
    order !== null || highlighted ? "scale-125" : "",
  ].join(" ");

  element.textContent = order === null ? "" : String(order);
}

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

function clamp(shift: number): number {
  return Math.max(-MAX_SHIFT, Math.min(MAX_SHIFT, Math.round(shift)));
}

function isCoordinate(point: LatLng | undefined): point is LatLng {
  return (
    point !== undefined &&
    Number.isFinite(point.lat) &&
    Number.isFinite(point.lng)
  );
}
