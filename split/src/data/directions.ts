import type { LatLng, TravelMode } from "../types.ts";
import { formatLatLng } from "./googleMaps.ts";

/* coordinates and the | must stay literal, not percent-encoded */
export function directionsUrl(points: LatLng[], mode: TravelMode): string {
  const coordinates = points.map(formatLatLng);
  const query = [
    "api=1",
    `origin=${coordinates[0]}`,
    `destination=${coordinates[coordinates.length - 1]}`,
    `travelmode=${mode}`,
  ];

  /* the api takes at most 9 waypoints */
  if (coordinates.length > 2) {
    query.push(`waypoints=${coordinates.slice(1, -1).join("|")}`);
  }

  return `https://www.google.com/maps/dir/?${query.join("&")}`;
}
