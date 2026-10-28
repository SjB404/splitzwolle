// the map itself is made outside react, this component only reads it and draws on it

import { useEffect, useLayoutEffect, useMemo, useRef, useState } from "react";
import { Link } from "react-router-dom";
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
import { builderPath } from "../data/navigation.ts";
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

// preview card size, keep in sync with the card (w-56), the height fits the open card with its button
const PREVIEW_WIDTH = 224;
const PREVIEW_HEIGHT = 320;
const PREVIEW_GAP = 12;

// min gap between dots in px, MAX_SHIFT handles whatever still overlaps
const DOT_GAP = 32;

const MAX_SHIFT = 14;

// where a preview card goes, in px inside the map's wrapper
interface Preview {
  id: string;
  x: number;
  y: number;
  below: boolean;
}

interface AreaMapProps {
  points: PointOfInterest[];
  line?: RouteGeometry | null;
  order?: Map<string, number>;
  // the highlighted dot is bigger and its card stays open until onDeselect
  highlightId?: string | null;
  onClickPoint?: (id: string) => void;
  // closes the open card: its close button, escape, or a click on an empty bit of map
  onDeselect?: () => void;
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
  onDeselect,
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
  // api listeners live outside react, so callbacks are read via refs
  const clickRef = useRef(onClickPoint);
  const deselectRef = useRef(onDeselect);
  const spreadRef = useRef<() => void>(() => {});
  const pinRef = useRef<() => void>(() => {});
  // bumped when a map is created so the effects re-run
  const [mapGeneration, setMapGeneration] = useState(0);
  const [colorScheme, setColorScheme] = useState(mapColorScheme());
  // no key: the api never loads, so start in the failed state
  const [failed, setFailed] = useState(!hasGoogleMapsKey);
  // hover is the dot under the mouse, pinned is the highlighted dot's card that stays open
  const [hover, setHover] = useState<Preview | null>(null);
  const [pinned, setPinned] = useState<Preview | null>(null);

  // google maps redraws the whole map on every size change, which made resizing the window lag
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
    deselectRef.current = onDeselect;
  }, [onClickPoint, onDeselect]);

  function previewAt(id: string, element: HTMLElement): Preview | null {
    const wrapper = element.closest(".relative");
    if (!wrapper) return null;

    const dot = element.getBoundingClientRect();
    const box = wrapper.getBoundingClientRect();
    const half = PREVIEW_WIDTH / 2;
    const centre = dot.left - box.left + dot.width / 2;
    const top = dot.top - box.top;
    const bottom = dot.bottom - box.top;
    // flip the card below the dot when there's no room above, sticking out the bottom
    // is fine but sticking out the top puts it under the sticky header
    const below = top < PREVIEW_HEIGHT + PREVIEW_GAP;

    return {
      id,
      x: Math.max(half + 8, Math.min(centre, box.width - half - 8)),
      y: below ? bottom : top,
      below,
    };
  }

  // keeps the open card on its dot, runs every time the map moves
  // the card hides while its dot is panned out of view so it never points at nothing
  function placePinned() {
    const dot = highlightId ? dotsRef.current.get(highlightId) : undefined;
    const frame = frameRef.current?.getBoundingClientRect();

    if (!highlightId || !dot || !frame) {
      setPinned(null);
      return;
    }

    const box = dot.element.getBoundingClientRect();
    const x = box.left + box.width / 2;
    const y = box.top + box.height / 2;
    const visible =
      box.width > 0 &&
      x >= frame.left &&
      x <= frame.right &&
      y >= frame.top &&
      y <= frame.bottom;

    setPinned(visible ? previewAt(highlightId, dot.element) : null);
  }

  // called via a ref so it always sees the current points and zoom
  function spreadDots() {
    const map = mapRef.current;
    const zoom = map?.getZoom();
    if (!map || zoom === undefined) return;

    const placed: { x: number; y: number }[] = [];

    // numbered stops go first and never move, so the route line always meets them
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
    pinRef.current = placePinned;
  });

  // colorScheme only works when the map is created, setOptions ignores it
  useEffect(() => {
    const observer = new MutationObserver(() =>
      setColorScheme(mapColorScheme()),
    );
    observer.observe(document.body, { attributeFilter: ["class"] });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    const host = hostRef.current;
    // copy refs for the cleanup, they may have changed by then
    const dots = dotsRef.current;
    const lines = linesRef.current;
    if (!host) return;

    let alive = true;
    let frame = 0;

    loadGoogleMaps()
      .then(() => {
        if (!alive) return;

        const map = new google.maps.Map(host, {
          ...mapOptions(),
          colorScheme,
        });

        mapRef.current = map;
        map.addListener("idle", () => {
          spreadRef.current();
          pinRef.current();
        });
        // the open card follows its dot while the map is dragged or zoomed, at most once a frame
        map.addListener("bounds_changed", () => {
          cancelAnimationFrame(frame);
          frame = requestAnimationFrame(() => pinRef.current());
        });
        // a click on empty map closes the open card, clicks on a dot are the dot's business
        map.addListener("click", (event: google.maps.MapMouseEvent) => {
          const target = event.domEvent?.target;
          const onDot =
            target instanceof Node &&
            [...dots.values()].some(({ element }) => element.contains(target));

          if (!onDot) deselectRef.current?.();
        });
        setMapGeneration((current) => current + 1);
      })
      .catch(() => {
        if (alive) setFailed(true);
      });

    return () => {
      alive = false;
      cancelAnimationFrame(frame);
      // clear google's leftover dom so a remount starts clean
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
          setHover(previewAt(point.id, element)),
        );
        element.addEventListener("mouseleave", () => setHover(null));
        element.addEventListener("focus", () =>
          setHover(previewAt(point.id, element)),
        );
        element.addEventListener("blur", () => setHover(null));

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
    pinRef.current();
  }, [mapGeneration, points, order, highlightId]);

  // google puts the markers on the page a moment after the map is ready, so on a fresh load
  // the open card waits until its dot actually has a size
  useEffect(() => {
    const dot = highlightId ? dotsRef.current.get(highlightId) : undefined;
    if (!dot) return;

    const observer = new ResizeObserver(() => pinRef.current());
    observer.observe(dot.element);

    return () => observer.disconnect();
  }, [mapGeneration, points, highlightId]);

  const highlightSpot = points.find(
    (point) => point.id === highlightId,
  )?.coordinates;

  // only pans when the picked place is off screen, so picking a visible one doesn't move the map
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !isCoordinate(highlightSpot)) return;

    const bounds = map.getBounds();
    if (bounds && !bounds.contains(highlightSpot)) map.panTo(highlightSpot);
  }, [mapGeneration, highlightSpot]);

  useEffect(() => {
    if (!highlightId || !onDeselect) return;

    function closeOnEscape(event: KeyboardEvent) {
      if (event.key === "Escape") onDeselect?.();
    }

    document.addEventListener("keydown", closeOnEscape);
    return () => document.removeEventListener("keydown", closeOnEscape);
  }, [highlightId, onDeselect]);

  useEffect(() => {
    const map = mapRef.current;
    if (mapGeneration === 0 || !map || points.length === 0) return;

    const bounds = new google.maps.LatLngBounds();
    points.forEach((point) => bounds.extend(point.coordinates));

    if (!bounds.isEmpty()) map.fitBounds(bounds, 56);
  }, [mapGeneration, points]);

  // skip invalid coordinates so a bad path can't blank the map
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

  // a hovered dot shows its own card for a moment, otherwise the open card shows
  const shown = hover ?? pinned;
  const shownPoint = shown
    ? (points.find((point) => point.id === shown.id) ?? null)
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
        {/* rounded-none because the frame already clips the corner, the size is set in px by the effect above */}
        <div ref={hostRef} className="absolute left-0 top-0 rounded-none" />

        {mapGeneration === 0 && (
          <p className="absolute inset-0 grid place-items-center text-sm text-ink-muted">
            Kaart wordt geladen…
          </p>
        )}
      </div>

      {/* outside the clipping frame, so an edge dot still gets a whole card */}
      {shownPoint && shown && (
        <PreviewCard
          point={shownPoint}
          hint={clickHint}
          x={shown.x}
          y={shown.y}
          below={shown.below}
          onClose={shown.id === highlightId ? onDeselect : undefined}
        />
      )}

      <MapChip label={label} className="absolute left-4 top-4 z-10" />
      {mapGeneration > 0 && (
        <ZoomControls
          onZoom={(step) => {
            const map = mapRef.current;
            map?.setZoom((map.getZoom() ?? 14) + step);
            // with a place picked, zoom in on that place instead of the middle of the map
            if (map && isCoordinate(highlightSpot)) map.panTo(highlightSpot);
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

// a hover card is pointer-events-none so it can never steal hover from its dot
// the open card (with onClose) is clickable and gets the same orange edge as the picked list card
function PreviewCard({
  point,
  hint,
  x,
  y,
  below,
  onClose,
}: {
  point: PointOfInterest;
  hint: string;
  x: number;
  y: number;
  below: boolean;
  onClose?: () => void;
}) {
  const image = point.image ?? PLACE_IMAGES[point.id];
  const open = onClose !== undefined;

  return (
    <div
      className={`surface-container-lowest absolute z-20 w-56 -translate-x-1/2 overflow-hidden rounded-box border-2 ${
        open ? "border-selected" : "pointer-events-none border-line"
      } ${below ? "translate-y-3" : "-translate-y-[calc(100%+0.75rem)]"}`}
      style={{ left: x, top: y }}
    >
      {open && (
        // needs a wrapper because .tap-target's own position: relative wins over absolute
        <div className="absolute right-2 top-2 z-10">
          <button
            type="button"
            aria-label={`${point.name} sluiten`}
            onClick={onClose}
            className="button circle ripple tap-target surface-container-lowest border text-ink"
          >
            <Icon name="close" />
          </button>
        </div>
      )}

      {/* rounded-none since the card already clips the corner */}
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
          {formatRating(point.rating)}
          {!open && ` · ${hint}`}
        </p>

        {open && (
          <Link
            to={builderPath([point.id])}
            className="button border text-ink ripple tap-target mt-3 w-full"
          >
            <Icon name="route" className="mr-1 text-base" />
            In een route
          </Link>
        )}
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

// fixed orange to match the route line
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
    // markers are anchored at their bottom centre so +50% puts the middle of the dot on the spot
    "[translate:var(--dot-x,0px)_calc(var(--dot-y,0px)_+_50%)]",
    // before:-inset-3.5 gives a 48px touch area
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
