/* flat projection on purpose: over 2km of city the error vs mercator is under a pixel */

import { useMemo } from "react";
import type { LatLng } from "../types.ts";

/* 320x200 is the cards' 16:10 ratio at half resolution; css scales it */
const VIEW = { width: 320, height: 200 };

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

function project(points: LatLng[]): {
  polyline: string;
  dots: { x: number; y: number }[];
} {
  /* drop non-finite coordinates: paths can arrive from the api too */
  const clean = points.filter(
    (point) =>
      point && Number.isFinite(point.lat) && Number.isFinite(point.lng),
  );
  /* the routes api repeats points where a route doubles back; duplicate svg keys otherwise */
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
  /* a single place has no span to scale against; 1e-6 avoids dividing by zero */
  const spanX = Math.max(Math.max(...xs) - minX, 1e-6);
  const spanY = Math.max(Math.max(...ys) - minY, 1e-6);

  /* one scale for both axes; fitting each axis separately spiked east-west routes (measured) */
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
