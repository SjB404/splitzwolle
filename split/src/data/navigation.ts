export const LOGIN_PATH = "/login";
export const HOME_PATH = "/";
export const ROUTES_PATH = "/routes";
// the search box on the routes page, the navbar search icon links to it
export const ROUTE_SEARCH_ID = "route-search";
// kept so old /planning links still work
export const PLANNING_PATH = "/planning";
export const POI_PATH = "/points-of-interest";
// register is a hash on the login page, there's no /inloggen route
export const REGISTER_PATH = `${LOGIN_PATH}#registreren`;
export const CONTACT_PATH = "/contact"

export function isActiveLink(pathname: string, to: string): boolean {
  const path = to.split("#")[0];

  if (path === HOME_PATH) return pathname === HOME_PATH;
  return pathname === path || pathname.startsWith(`${path}/`);
}

// the two urls the routes page answers
export const CUSTOM_ROUTE_PATH = `${ROUTES_PATH}/custom`;
export const PUBLIC_ROUTE_PATH = `${ROUTES_PATH}/public`;

// /routes/custom/<ids joined by ,>
export function builderPath(placeIds: string[]): string {
  if (placeIds.length === 0) return ROUTES_PATH;

  return `${CUSTOM_ROUTE_PATH}/${placeIds.map((id) => encodeURIComponent(id)).join(",")}`;
}

export function publicRoutePath(routeId: string): string {
  return `${PUBLIC_ROUTE_PATH}/${encodeURIComponent(routeId)}`;
}

// a hash not a path, ids are plain ascii slugs so nothing needs escaping
const POI_ANCHOR_PREFIX = "poi-";

export function pointOfInterestAnchor(poiId: string): string {
  return `${POI_ANCHOR_PREFIX}${poiId}`;
}

export function pointOfInterestPath(poiId: string): string {
  return `${POI_PATH}#${pointOfInterestAnchor(poiId)}`;
}

// gets the place id out of a url hash, the page checks if it actually exists
export function parsePointOfInterestAnchor(hash: string): string | null {
  const anchor = hash.replace(/^#/, "");

  return anchor.startsWith(POI_ANCHOR_PREFIX)
    ? anchor.slice(POI_ANCHOR_PREFIX.length)
    : null;
}

export function parsePlaceIds(segment: string | undefined): string[] {
  if (!segment) return [];

  const ids = segment
    .split(",")
    .map((id) => decodeURIComponent(id.trim()))
    .filter((id) => id.length > 0);

  // the same place twice in a url is still one stop
  return [...new Set(ids)];
}
