export const LOGIN_PATH = "/login";
export const HOME_PATH = "/";
export const ROUTES_PATH = "/routes";
/* kept so old /planning links still land somewhere; the planner was folded into the builder */
export const PLANNING_PATH = "/planning";
export const POI_PATH = "/points-of-interest";
/* register lives as a hash on the login page; there is no /inloggen route */
export const REGISTER_PATH = `${LOGIN_PATH}#registreren`;
export const CONTACT_PATH = "/contact"

export function isActiveLink(pathname: string, to: string): boolean {
  const path = to.split("#")[0];

  if (path === HOME_PATH) return pathname === HOME_PATH;
  return pathname === path || pathname.startsWith(`${path}/`);
}

/* the two urls the routes page answers */
export const CUSTOM_ROUTE_PATH = `${ROUTES_PATH}/custom`;
export const PUBLIC_ROUTE_PATH = `${ROUTES_PATH}/public`;

/* /routes/custom/<ids joined by ,> */
export function builderPath(placeIds: string[]): string {
  if (placeIds.length === 0) return ROUTES_PATH;

  return `${CUSTOM_ROUTE_PATH}/${placeIds.map((id) => encodeURIComponent(id)).join(",")}`;
}

export function publicRoutePath(routeId: string): string {
  return `${PUBLIC_ROUTE_PATH}/${encodeURIComponent(routeId)}`;
}

/* a hash, not a path: the page is the same page; ids are ascii slugs, so no escaping needed */
const POI_ANCHOR_PREFIX = "poi-";

export function pointOfInterestAnchor(poiId: string): string {
  return `${POI_ANCHOR_PREFIX}${poiId}`;
}

export function pointOfInterestPath(poiId: string): string {
  return `${POI_PATH}#${pointOfInterestAnchor(poiId)}`;
}

/* the place a url's hash names; whether it exists is the page's business */
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

  /* the same place twice in a url is still one stop */
  return [...new Set(ids)];
}
