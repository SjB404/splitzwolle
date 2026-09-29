/* the part of zwolle this site covers: the binnenstad and the noorder eiland — every route lives here, and the interactive map is not allowed to wander off */

import type { LatLng, PointOfInterest } from "../types.ts";

/* a box around the binnenstad and the noorder eiland, wide enough for the singel and the station side of it and no wider */
export const AREA_BOUNDS = {
  north: 52.5235,
  south: 52.5045,
  west: 6.081,
  east: 6.107,
};

/** the box as two corners, which is the shape the maps api wants for a restriction */
export const AREA_CORNERS: { southWest: LatLng; northEast: LatLng } = {
  southWest: { lat: AREA_BOUNDS.south, lng: AREA_BOUNDS.west },
  northEast: { lat: AREA_BOUNDS.north, lng: AREA_BOUNDS.east },
};

export const AREA_NAME = "de binnenstad en het Noorder Eiland";

/** the middle of the box, which is where a map starts before it has anything to frame */
export const AREA_CENTER: LatLng = {
  lat: (AREA_BOUNDS.south + AREA_BOUNDS.north) / 2,
  lng: (AREA_BOUNDS.west + AREA_BOUNDS.east) / 2,
};

/** true when a place is inside the covered area, which is what makes it a candidate for a route */
export function isInArea(point: LatLng): boolean {
  return (
    point.lat >= AREA_BOUNDS.south &&
    point.lat <= AREA_BOUNDS.north &&
    point.lng >= AREA_BOUNDS.west &&
    point.lng <= AREA_BOUNDS.east
  );
}

/* the places a route may use: the ones inside the area. every place in the data is inside it today, and this filter is the guard that keeps it that way */
export function pointsInArea(points: PointOfInterest[]): PointOfInterest[] {
  return points.filter((point) => isInArea(point.coordinates));
}
