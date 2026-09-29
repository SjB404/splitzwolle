/* the shape of a planned route, measured two ways: the directions api's answer when it has one, and our own straight-line estimate when it does not */
/* the estimate is deliberately generous (×1.25) because a straight line between two places is always shorter than the walk along the streets */

import type { LatLng, RouteGeometry, TravelMode } from "../types.ts";

/* average speeds for the two ways this site travels, and the one place either number is written down (the planner reads the walking one) */
export const PACE_KM_PER_HOUR: Record<TravelMode, number> = {
  walking: 4.5,
  bicycling: 15,
};

/* how much longer the walk is than the crow flies, on average, in a city like this; the place data measures its own distances with it too */
export const STREET_FACTOR = 1.25;

const EARTH_RADIUS_KM = 6371;

/** the distance over the ground between two points, in kilometres */
export function haversineKm(from: LatLng, to: LatLng): number {
  const toRadians = (degrees: number) => (degrees * Math.PI) / 180;
  const deltaLat = toRadians(to.lat - from.lat);
  const deltaLng = toRadians(to.lng - from.lng);
  const meanLat = toRadians((from.lat + to.lat) / 2);
  const a =
    Math.sin(deltaLat / 2) ** 2 +
    Math.cos(meanLat) * Math.cos(meanLat) * Math.sin(deltaLng / 2) ** 2;

  return 2 * EARTH_RADIUS_KM * Math.asin(Math.min(1, Math.sqrt(a)));
}

/** how long a route of this length takes at the pace of this way of travelling */
export function minutesFor(distanceKm: number, mode: TravelMode): number {
  return Math.max(1, Math.round((distanceKm / PACE_KM_PER_HOUR[mode]) * 60));
}

/* the connector: one straight line through the places in visit order, with the length and the duration an estimate. it is what the reader sees while the api is still answering, and what stays if it never does */
export function straightRoute(
  points: LatLng[],
  mode: TravelMode,
): RouteGeometry {
  const distanceKm =
    points
      .slice(1)
      .reduce(
        (sum, point, index) => sum + haversineKm(points[index], point),
        0,
      ) * STREET_FACTOR;

  return {
    path: points,
    distanceKm,
    durationMinutes: minutesFor(distanceKm, mode),
    followsStreets: false,
  };
}
