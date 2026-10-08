/* the paths the router, the bar and the footer all share — one module, so renaming a path re-points every link at once */
/* the links themselves live with the component that renders them: the bar's in components/navbar.tsx, the footer's in components/footer.tsx */

export const LOGIN_PATH = "/login";
export const HOME_PATH = "/";
export const ROUTES_PATH = "/routes";
/* the planner was folded into the builder: this path only exists so an old link still lands somewhere */
export const PLANNING_PATH = "/planning";
export const POI_PATH = "/points-of-interest";
export const REGISTER_PATH = "/inloggen#registreren";
export const CONTACT_PATH = "/contact"
/** the login page opens its registration form when the url carries this hash */

/* whether a nav link is the page you are on — the hash is ignored, and a sub page keeps its parent link active */
export function isActiveLink(pathname: string, to: string): boolean {
  const path = to.split("#")[0];

  if (path === HOME_PATH) return pathname === HOME_PATH;
  return pathname === path || pathname.startsWith(`${path}/`);
}

/* the two urls the routes page answers: a built route is its places in visit order, a ready-made one is its id */
export const CUSTOM_ROUTE_PATH = `${ROUTES_PATH}/custom`;
export const PUBLIC_ROUTE_PATH = `${ROUTES_PATH}/public`;

/* the builder, pre-loaded with these places: /routes/custom/peperbus,vrouwenhuis — the shortest thing that can be shared */
export function builderPath(placeIds: string[]): string {
  if (placeIds.length === 0) return ROUTES_PATH;

  return `${CUSTOM_ROUTE_PATH}/${placeIds.map((id) => encodeURIComponent(id)).join(",")}`;
}

/* a ready-made route's own page: /routes/public/binnenstad-highlights */
export function publicRoutePath(routeId: string): string {
  return `${PUBLIC_ROUTE_PATH}/${encodeURIComponent(routeId)}`;
}

/* a place on the places page: /points-of-interest#poi-sassenpoort — a **hash** and not a path, because the
   page is the same page: the fragment names the card, and `ScrollToTop` already knows how to follow a
   fragment (`#contact` lands from anywhere). The place ids are ascii slugs, so the fragment is the
   element's own id verbatim — no escaping on either side, which is what the lookup needs */
export const POI_ANCHOR_PREFIX = "poi-";

export function pointOfInterestAnchor(poiId: string): string {
  return `${POI_ANCHOR_PREFIX}${poiId}`;
}

export function pointOfInterestPath(poiId: string): string {
  return `${POI_PATH}#${pointOfInterestAnchor(poiId)}`;
}

/* the place a url's hash names; whether it exists is the page's business, not the url's */
export function parsePointOfInterestAnchor(hash: string): string | null {
  const anchor = hash.replace(/^#/, "");

  return anchor.startsWith(POI_ANCHOR_PREFIX)
    ? anchor.slice(POI_ANCHOR_PREFIX.length)
    : null;
}

/* the places out of a custom segment; whether they exist is the page's business, not the url's */
export function parsePlaceIds(segment: string | undefined): string[] {
  if (!segment) return [];

  return segment
    .split(",")
    .map((id) => decodeURIComponent(id.trim()))
    .filter((id) => id.length > 0);
}
