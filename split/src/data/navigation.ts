/* the paths, the bar's links and the footer's groups — one module, so renaming a path re-points every link at once */

import type { ContactDetails, FooterColumn, NavLink } from "../types.ts";

export const HOME_PATH = "/";
export const ROUTES_PATH = "/routes";
/* the planner was folded into the builder: this path only exists so an old link still lands somewhere */
export const PLANNING_PATH = "/planning";
export const POI_PATH = "/points-of-interest";
export const LOGIN_PATH = "/inloggen";
/** the login page opens its registration form when the url carries this hash */
export const REGISTER_PATH = "/inloggen#registreren";

/* Contact is not a page: it points at the footer band, the contact block on every page (shared/layout/footer.tsx) */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: HOME_PATH },
  { label: "Routes", to: ROUTES_PATH },
  { label: "Points of Interest", to: POI_PATH },
  { label: "Contact", to: `${HOME_PATH}#contact` },
];

/* whether a nav link is the page you are on — the hash is ignored, and a sub page keeps its parent link active */
export function isActiveLink(pathname: string, to: string): boolean {
  const path = to.split("#")[0];

  if (path === HOME_PATH) return pathname === HOME_PATH;
  return pathname === path || pathname.startsWith(`${path}/`);
}

/* the two urls the routes page answers: a built route is its places in visit order, a ready-made one is its id */
export const CUSTOM_ROUTE_PATH = `${ROUTES_PATH}/custom`;
export const PUBLIC_ROUTE_PATH = `${ROUTES_PATH}/public`;

/* the builder, pre-loaded with these places: /routes/custom/peperbus,melkmarkt — the shortest thing that can be shared */
export function builderPath(placeIds: string[]): string {
  if (placeIds.length === 0) return ROUTES_PATH;

  return `${CUSTOM_ROUTE_PATH}/${placeIds.map((id) => encodeURIComponent(id)).join(",")}`;
}

/* a ready-made route's own page: /routes/public/binnenstad-highlights */
export function publicRoutePath(routeId: string): string {
  return `${PUBLIC_ROUTE_PATH}/${encodeURIComponent(routeId)}`;
}

/* the places out of a custom segment; whether they exist is the page's business, not the url's */
export function parsePlaceIds(segment: string | undefined): string[] {
  if (!segment) return [];

  return segment
    .split(",")
    .map((id) => decodeURIComponent(id.trim()))
    .filter((id) => id.length > 0);
}
/* the footer's link groups; contact details are placeholders until the collaborator's api is wired up (DESIGN.md §15) */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Navigatie",
    links: [
      { label: "Home", to: HOME_PATH },
      { label: "Routes", to: ROUTES_PATH },
      { label: "Points of Interest", to: POI_PATH },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Inloggen", to: LOGIN_PATH },
      { label: "Registreren", to: REGISTER_PATH },
    ],
  },
];

export const CONTACT_DETAILS: ContactDetails = {
  email: "info@zwolleroutes.nl",
  phone: "+31 38 123 45 67",
  phoneHref: "+31381234567",
  address: "Grote Markt 1, 8011 PK Zwolle",
};
