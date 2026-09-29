/* the pictures a map is built on plus the layer the app draws over them — points arrive in 0-100 space and are scaled here, so the same route draws the same way on the hero, a card and the planner */
/* preserveAspectRatio="slice" on the svg and object-cover on the img centre crop the same source, which is what keeps the drawn line on the map when a frame crops it */
/* the route is a white casing under an orange line: one orange line disappears into the red roofs and dark water of a photo */
/* the overlays take no pointer events and are aria-hidden: picking a route happens in the cards, and the picture's own alt carries what the map means */
/* the historic/current cross fade is not here: the caller stacks the two pictures and fades the top one with the inherited --historic-opacity */

import { memo } from "react";
import type { ReactNode } from "react";
import { MAP_SIZE } from "../../data/maps.ts";
import type { MapPicture, MapPosition, PointOfInterest } from "../../types.ts";

/* the scale from 0-100 space onto the picture's own size, the unit both the img and the svg are measured in */
const MAP_SCALE = { x: MAP_SIZE.width / 100, y: MAP_SIZE.height / 100 };

/* every measure the overlays draw with, in picture units, one set for every surface: the hero shows the picture at ~640px and a card crops it into a 380px frame, and those ratios put the same line at a similar optical weight */
const OVERLAY_STYLE = {
  route: 9,
  casing: 16,
  dash: "20 18",
  stop: 11,
  glow: 24,
  halo: 5,
};

/* how much of the picture a round place thumbnail shows, in picture units */
const THUMB_ZOOM = 190;

/** how many picture units one unit of 0-100 space is worth */
interface MapScale {
  x: number;
  y: number;
}

/** 0-100 space → the picture's own units */
function scalePoints(points: MapPosition[], scale: MapScale): MapPosition[] {
  return points.map(([x, y]): MapPosition => [x * scale.x, y * scale.y]);
}

/* a polyline wants "x,y x,y …", which is the one place the pairs get flattened instead of drawn separately */
function toPolyline(points: MapPosition[]): string {
  return points.map(([x, y]) => `${x},${y}`).join(" ");
}

interface MapImageProps {
  image: MapPicture;
  /* sizing. the default lets the picture decide its own height */
  className?: string;
  /* true for the one image that is part of the first screen (the hero's) */
  priority?: boolean;
  /* true when the text around it already describes the map */
  decorative?: boolean;
  /* overrides the picture's own description, for a map that shows something specific */
  alt?: string;
}

/* width and height are declared so the page cannot reflow while a multi-megabyte png arrives; priority marks the one image on the first screen (the hero's), the rest load lazily */
export const MapImage = memo(function MapImage({
  image,
  className = "h-auto w-full",
  priority = false,
  decorative = false,
  alt,
}: MapImageProps) {
  return (
    <img
      src={image.src}
      alt={decorative ? "" : (alt ?? image.alt)}
      aria-hidden={decorative ? "true" : undefined}
      width={MAP_SIZE.width}
      height={MAP_SIZE.height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`block ${className}`}
    />
  );
});

/* the shared shell for every overlay: full bleed over the picture, cropped the same way object-cover crops it, and out of the accessibility tree */
function MapOverlay({ children }: { children: ReactNode }) {
  return (
    <svg
      viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
      preserveAspectRatio="xMidYMid slice"
      className="pointer-events-none absolute inset-0 h-full w-full"
      aria-hidden="true"
    >
      {children}
    </svg>
  );
}

/* a stop: a soft glow, then the dot with a white halo, so it reads on the engraving and the photo alike */
function RouteStop({ cx, cy }: { cx: number; cy: number }) {
  return (
    <g>
      <circle
        cx={cx}
        cy={cy}
        r={OVERLAY_STYLE.glow}
        className="fill-orange-500"
        opacity="0.22"
      />
      <circle
        cx={cx}
        cy={cy}
        r={OVERLAY_STYLE.stop}
        className="fill-orange-500 stroke-white"
        strokeWidth={OVERLAY_STYLE.halo}
      />
    </g>
  );
}

/* one route over any picture: the casing, the accent line, and its stops */
export const RouteOverlay = memo(function RouteOverlay({
  path,
}: {
  path: MapPosition[];
}) {
  const points = scalePoints(path, MAP_SCALE);
  const polyline = toPolyline(points);

  return (
    <MapOverlay>
      <polyline
        points={polyline}
        fill="none"
        className="stroke-white"
        strokeWidth={OVERLAY_STYLE.casing}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={polyline}
        fill="none"
        className="stroke-orange-500"
        strokeWidth={OVERLAY_STYLE.route}
        strokeDasharray={OVERLAY_STYLE.dash}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      {points.map(([x, y]) => (
        <RouteStop key={`${x}-${y}`} cx={x} cy={y} />
      ))}
    </MapOverlay>
  );
});

/* the planner's plan: one line per selected route, a filled start dot on the first point and a hollow ring on the last, so three routes still read as one journey; it takes paths and not routes, because what it draws is geometry */
export const PlanningOverlay = memo(function PlanningOverlay({
  paths,
}: {
  paths: MapPosition[][];
}) {
  const lines = paths.map((path) => scalePoints(path, MAP_SCALE));
  const first = lines[0]?.[0];
  const last = lines.at(-1)?.at(-1);

  return (
    <MapOverlay>
      {lines.map((points) => (
        <g key={points[0].join("-")}>
          <polyline
            points={toPolyline(points)}
            fill="none"
            className="stroke-white"
            strokeWidth={OVERLAY_STYLE.casing}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <polyline
            points={toPolyline(points)}
            fill="none"
            className="stroke-orange-500"
            strokeWidth={OVERLAY_STYLE.route}
            strokeDasharray={OVERLAY_STYLE.dash}
            strokeLinecap="round"
            strokeLinejoin="round"
          />
        </g>
      ))}

      {first && <RouteStop cx={first[0]} cy={first[1]} />}
      {last && (
        <circle
          cx={last[0]}
          cy={last[1]}
          r={OVERLAY_STYLE.stop}
          className="fill-white stroke-orange-500"
          strokeWidth={OVERLAY_STYLE.halo}
        />
      )}
    </MapOverlay>
  );
});

interface PoiOverlayProps {
  /* it takes the whole place and not just its position, because the selected one is drawn larger */
  points: PointOfInterest[];
  /* the highlighted place, or null while nothing is selected */
  selectedId: string | null;
}

/* the places map: one pin per place, with the selected one drawn larger and ringed */
export const PoiOverlay = memo(function PoiOverlay({
  points,
  selectedId,
}: PoiOverlayProps) {
  return (
    <MapOverlay>
      {points.map((place) => {
        const [cx, cy] = scalePoints([place.position], MAP_SCALE)[0];
        const isSelected = place.id === selectedId;

        return (
          <g key={place.id}>
            <circle
              cx={cx}
              cy={cy}
              r={isSelected ? OVERLAY_STYLE.glow * 1.6 : OVERLAY_STYLE.glow}
              className="fill-orange-500"
              opacity="0.22"
            />
            <circle
              cx={cx}
              cy={cy}
              r={
                isSelected
                  ? OVERLAY_STYLE.stop * 1.5
                  : OVERLAY_STYLE.stop * 0.85
              }
              className="fill-orange-500 stroke-white"
              strokeWidth={
                isSelected ? OVERLAY_STYLE.halo : OVERLAY_STYLE.halo * 0.75
              }
            />
          </g>
        );
      })}
    </MapOverlay>
  );
});

interface PoiCropProps {
  /* the place to centre on, in 0-100 space */
  position: MapPosition;
  image: MapPicture;
}

/* a round crop of the picture centred on one place, for the home page's thumbnails: the crop window is the svg's viewBox, a THUMB_ZOOM square around the place, so nothing needs positioning or a css transform */
export const PoiCrop = memo(function PoiCrop({
  position,
  image,
}: PoiCropProps) {
  const [cx, cy] = scalePoints([position], MAP_SCALE)[0];
  const half = THUMB_ZOOM / 2;

  return (
    <svg
      viewBox={`${cx - half} ${cy - half} ${THUMB_ZOOM} ${THUMB_ZOOM}`}
      className="h-full w-full"
      aria-hidden="true"
    >
      <image
        href={image.src}
        x="0"
        y="0"
        width={MAP_SIZE.width}
        height={MAP_SIZE.height}
        preserveAspectRatio="none"
      />
      <circle
        cx={cx}
        cy={cy}
        r={THUMB_ZOOM * 0.14}
        className="fill-orange-500"
        opacity="0.22"
      />
      <circle
        cx={cx}
        cy={cy}
        r={THUMB_ZOOM * 0.055}
        className="fill-orange-500 stroke-white"
        strokeWidth={THUMB_ZOOM * 0.03}
      />
    </svg>
  );
});
