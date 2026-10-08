import type { LatLng, PointOfInterest } from "../types.ts";

export const AREA_BOUNDS = {
  north: 52.5235,
  south: 52.5045,
  west: 6.081,
  east: 6.107,
};

/* the two-corner shape the maps api wants for a restriction */
export const AREA_CORNERS: { southWest: LatLng; northEast: LatLng } = {
  southWest: { lat: AREA_BOUNDS.south, lng: AREA_BOUNDS.west },
  northEast: { lat: AREA_BOUNDS.north, lng: AREA_BOUNDS.east },
};

export const AREA_NAME = "de binnenstad en het Noorder Eiland";

export const AREA_CENTER: LatLng = {
  lat: (AREA_BOUNDS.south + AREA_BOUNDS.north) / 2,
  lng: (AREA_BOUNDS.west + AREA_BOUNDS.east) / 2,
};

export function isInArea(point: LatLng): boolean {
  return (
    point.lat >= AREA_BOUNDS.south &&
    point.lat <= AREA_BOUNDS.north &&
    point.lng >= AREA_BOUNDS.west &&
    point.lng <= AREA_BOUNDS.east
  );
}

export function pointsInArea(points: PointOfInterest[]): PointOfInterest[] {
  return points.filter((point) => isInArea(point.coordinates));
}
