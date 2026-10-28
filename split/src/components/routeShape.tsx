/* flat projection is fine at city scale */

import { useMemo } from "react";
import type { LatLng } from "../types.ts";

/* the cards' 16:10 ratio; css scales it */
const VIEW = { width: 320, height: 200 };

const PADDING = 26;

interface RouteShapeProps {
  points: LatLng[];
  // the street route to draw instead of straight lines between the stops (when we have it)
  path?: LatLng[];
  className?: string;
}

export default function RouteShape({
  points,
  path,
  className = "",
}: RouteShapeProps) {
  const shape = useMemo(() => project(points, path), [points, path]);

  if (shape.dots.length === 0) return null;

  return (
    <svg
      viewBox={`0 0 ${VIEW.width} ${VIEW.height}`}
      preserveAspectRatio="xMidYMid meet"
      className={`h-full w-full ${className}`}
      aria-hidden="true"
    >
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

      {shape.dots.map((dot, index) => (
        <circle
          key={`${index}-${dot.x}-${dot.y}`}
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

function project(
  points: LatLng[],
  path: LatLng[] = points,
): {
  polyline: string;
  dots: { x: number; y: number }[];
} {
  const stops = cleanPoints(points);
  const line = cleanPoints(path);

  if (stops.length === 0) return { polyline: "", dots: [] };

  // the line and the stops share one frame, fitted around both
  const all = [...stops, ...line];
  const meanLatitude =
    all.reduce((sum, point) => sum + point.lat, 0) / all.length;
  const squeeze = Math.cos((meanLatitude * Math.PI) / 180);
  const flatten = (point: LatLng) => ({
    x: point.lng * squeeze,
    y: -point.lat,
  });

  const flat = all.map(flatten);
  const xs = flat.map((point) => point.x);
  const ys = flat.map((point) => point.y);
  const minX = Math.min(...xs);
  const minY = Math.min(...ys);
  /* a single place has no span to scale against; 1e-6 avoids dividing by zero */
  const spanX = Math.max(Math.max(...xs) - minX, 1e-6);
  const spanY = Math.max(Math.max(...ys) - minY, 1e-6);

  /* same scale on both axes so routes aren't distorted */
  const scale = Math.min(
    (VIEW.width - 2 * PADDING) / spanX,
    (VIEW.height - 2 * PADDING) / spanY,
  );
  const offsetX = (VIEW.width - spanX * scale) / 2;
  const offsetY = (VIEW.height - spanY * scale) / 2;

  const toView = (point: LatLng) => {
    const { x, y } = flatten(point);
    return { x: offsetX + (x - minX) * scale, y: offsetY + (y - minY) * scale };
  };

  return {
    polyline: line
      .map(toView)
      .map((dot) => `${dot.x.toFixed(1)},${dot.y.toFixed(1)}`)
      .join(" "),
    dots: stops.map(toView),
  };
}

// drops broken coordinates and repeated points (routes that double back)
function cleanPoints(points: LatLng[]): LatLng[] {
  const clean = points.filter(
    (point) =>
      point && Number.isFinite(point.lat) && Number.isFinite(point.lng),
  );

  return clean.filter(
    (point, index) =>
      index === 0 ||
      point.lat !== clean[index - 1].lat ||
      point.lng !== clean[index - 1].lng,
  );
}
