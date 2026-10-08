import type { LatLng, RouteGeometry, TravelMode } from "../types.ts";

export const PACE_KM_PER_HOUR: Record<TravelMode, number> = {
  walking: 4.5,
  bicycling: 15,
};

/* walking distance ≈ straight line × 1.25; poi distances use the same factor */
export const STREET_FACTOR = 1.25;

const EARTH_RADIUS_KM = 6371;

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

export function minutesFor(distanceKm: number, mode: TravelMode): number {
  return Math.max(1, Math.round((distanceKm / PACE_KM_PER_HOUR[mode]) * 60));
}

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
