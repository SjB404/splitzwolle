/* the map instance is built outside react; this component only reads and draws it */

import { useEffect, useMemo, useRef, useState } from "react";
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

/* keep in sync with the preview card: w-56 = 224px, 296px measured tallest */
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
  /* map is built outside react; this counter tells the effects a map now exists */
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
    /* the frame clips: flip the card below the dot when there is no room above */
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

  /* the map calls this via a ref set every render, so it always sees current points and zoom */
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

  /* the api reads colorScheme at map creation and ignores setOptions afterwards (measured) */
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setColorScheme(mapColorScheme()),
    );
    observer.observe(document.body, { attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    /* refs captured once: a ref read inside a cleanup may no longer hold the same value */
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
      /* react owns the host element, the api owns its contents: clear it so a remount starts clean */
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

  /* filtered to real coordinates: an invalid path must never blank the map */
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
        {/* rounded-none: the frame clips its own corner; google's dom is squared in areaMap.css */}
        <div ref={hostRef} className={`${heightClassName} w-full rounded-none`} />

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
      <p className="sr-only">{description}</p>
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
      className={`surface-container-lowest pointer-events-none absolute z-20 w-56 -translate-x-1/2 overflow-hidden rounded-xl border-2 border-line ${
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

/* the dot keeps the fixed orange: it must match the route line colour */
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
    "[translate:var(--dot-shift,0_0)]",
    /* before:-inset-3.5 = 48px touch area (measured: -inset-3 gave 44px); tap-target won't fit */
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
