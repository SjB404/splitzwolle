/* a route's own shape, drawn from its coordinates — what a preview shows when the static map service is not switched on, and light enough to draw a screenful of them */
/* the projection is flat on purpose: the longitude is squeezed by the latitude so the shape is not stretched, and over two kilometres of city the difference from a real mercator projection is under a pixel */

import { useMemo } from "react";
import type { LatLng } from "../types.ts";

/* the drawing box; 320 x 200 is the cards' own 16:10 ratio at half resolution, and the css just scales it */
const VIEW = { width: 320, height: 200 };

/* how much of the box stays empty around the shape */
const PADDING = 26;

interface RouteShapeProps {
  points: LatLng[];
  className?: string;
}

export default function RouteShape({
  points,
  className = "",
}: RouteShapeProps) {
  const shape = useMemo(() => project(points), [points]);

  if (shape.dots.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    >
      {/* the same recipe the maps use: a white casing under the brand line, so the route reads on any surface */}
      <polyline
        points={shape.polyline}
        fill="none"
        className="stroke-white"
        strokeWidth={9}
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <polyline
        points={shape.polyline}
        fill="none"
        className="stroke-orange-500"
        strokeWidth={4.5}
        strokeLinecap="round"
        strokeLinejoin="round"
      />

      {/* the ends are bigger than the places in between, so the direction of travel is readable at card size */}
      {shape.dots.map((dot, index) => (
        <circle
          key={`${dot.x}-${dot.y}`}
          cx={dot.x}
          cy={dot.y}
          r={index === 0 || index === shape.dots.length - 1 ? 6 : 4.5}
          className="fill-orange-500 stroke-white"
          strokeWidth={3}
        />
      ))}
    </svg>
  );
}

/* the places onto the box: one scale for both axes, so the shape keeps its proportions and a route that runs north-south sits in the middle of the frame */
function project(points: LatLng[]): {
  polyline: string;
  dots: { x: number; y: number }[];
} {
  /* whatever is not a real coordinate is dropped instead of drawn: a preview must never be able to break the page it is on, and a path can arrive from the api as well as from our own data */
  const clean = points.filter(
    (point) =>
      point && Number.isFinite(point.lat) && Number.isFinite(point.lng),
  );
  /* the routes api repeats a point where a route doubles back, and two identical points are one dot (and one svg key) */
  const distinct = clean.filter(
    (point, index) =>
      index === 0 ||
      point.lat !== clean[index - 1].lat ||
      point.lng !== clean[index - 1].lng,
  );

  if (distinct.length === 0) return { polyline: "", dots: [] };

  const meanLatitude =
    distinct.reduce((sum, point) => sum + point.lat, 0) / distinct.length;
  const squeeze = Math.cos((meanLatitude * Math.PI) / 180);
  const flat = distinct.map((point) => ({
    x: point.lng * squeeze,
    y: -point.lat,
  }));

  const xs = flat.map((point) => point.x);
  const ys = flat.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  /* a single place has no span to scale against, and a zero would divide */
  const spanX = Math.max(Math.max(...xs) - minX, 1e-6);
  const spanY = Math.max(Math.max(...ys) - minY, 1e-6);

  /* one scale for both axes, so the shape keeps its proportions — stretching each axis to the frame turned a route with one far stop into an unreadable spike (measured on the east-west routes) */
  const scale = Math.min(
    (VIEW.width - 2 * PADDING) / spanX,
    (VIEW.height - 2 * PADDING) / spanY,
  );
  const offsetX = (VIEW.width - spanX * scale) / 2;
  const offsetY = (VIEW.height - spanY * scale) / 2;

  const dots = flat.map((point) => ({
    x: offsetX + (point.x - minX) * scale,
    y: offsetY + (point.y - minY) * scale,
  }));

  return {
    polyline: dots
      .map((dot) => `${dot.x.toFixed(1)},${dot.y.toFixed(1)}`)
      .join(" "),
    dots,
  };
}
