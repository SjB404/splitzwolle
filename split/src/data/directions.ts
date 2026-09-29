/* the link out to google maps for the places of a route — a url and not the api: the interactive map itself is shared/map/googleMaps.ts */

import type { LatLng, TravelMode } from "../types.ts";

/* the api's url format wants the coordinates and the pipe literally, not percent-encoded, so the query is built by hand */
export function directionsUrl(points: LatLng[], mode: TravelMode): string {
  const coordinates = points.map(({ lat, lng }) => `${lat},${lng}`);
  const query = [
    "api=1",
    `origin=${coordinates[0]}`,
    `destination=${coordinates[coordinates.length - 1]}`,
    `travelmode=${mode}`,
  ];

  /* everything between the two ends is a waypoint; the api takes 9, and the longest route here has 5 places */
  if (coordinates.length > 2) {
    query.push(`waypoints=${coordinates.slice(1, -1).join("|")}`);
  }

  return `https://www.google.com/maps/dir/?${query.join("&")}`;
}
