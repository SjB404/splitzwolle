// the street route a card can draw, if this browser already has it cached (never makes a request).
// kept out of routes.ts because the e2e suite reads that file with plain node

import { cachedDirections } from "./googleMaps.ts";
import { routeCoordinates } from "./routes.ts";
import type { LatLng, Route } from "../types.ts";

export function cachedRoutePath(route: Route): LatLng[] | undefined {
  const mode = route.theme === "Fiets" ? "bicycling" : "walking";

  return cachedDirections(routeCoordinates(route), mode)?.path;
}
