/*
  The e2e specs read the app's own data and the app's own filter functions, so the suite grows with the
  content instead of being pinned to today's numbers: no route id, place name or "how many are there"
  is written down twice. Adding a route or a place adds coverage; changing a filter bucket changes the
  expectation with it.
*/

import { ROUTES } from "../../src/data/routes.ts";
import {
  HOME_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
} from "../../src/data/navigation.ts";

export {
  ROUTES,
  ROUTE_THEMES,
  ROUTE_DIFFICULTIES,
  ROUTE_PAGE_SIZE,
  ROUTE_REVIEWS,
  INITIAL_ROUTE_FILTERS,
  filterRoutes,
  getRelatedRoutes,
  routePoints,
} from "../../src/data/routes.ts";

export {
  POINTS_OF_INTEREST,
  INITIAL_POI_FILTERS,
  CATEGORIES,
  filterPointsOfInterest,
} from "../../src/data/pointsOfInterest.ts";

export { pointsInArea, AREA_NAME } from "../../src/data/area.ts";
export { PACE_KM_PER_HOUR } from "../../src/data/routeGeometry.ts";
export {
  formatDistance,
  formatDuration,
  formatRating,
} from "../../src/format.ts";

export {
  HOME_PATH,
  ROUTES_PATH,
  PLANNING_PATH,
  POI_PATH,
  LOGIN_PATH,
  NAV_LINKS,
  FOOTER_COLUMNS,
  CONTACT_DETAILS,
  isActiveLink,
} from "../../src/data/navigation.ts";

export type {
  Route,
  PointOfInterest,
  RouteFilterState,
  PoiFilterState,
} from "../../src/types.ts";

/* a url nothing serves, so the catch-all page has something to answer */
export const UNKNOWN_PATH = "/dit-bestaat-niet";

interface Page {
  path: string;
  /* what PageTitle writes into the tab */
  title: string;
  heading: string | RegExp;
}

/* the pages whose wording is written into the page itself */
export const STATIC_PAGES: Page[] = [
  {
    path: HOME_PATH,
    title: "Ontdek Zwolle toen en nu · Zwolle Routes",
    heading: /Ontdek Zwolle/,
  },
  {
    path: ROUTES_PATH,
    title: "Stel je route samen · Zwolle Routes",
    heading: /Stel je route samen/,
  },
  {
    path: PLANNING_PATH,
    title: "Stel je route samen · Zwolle Routes",
    heading: /Stel je route samen/,
  },
  {
    path: POI_PATH,
    title: "Bezienswaardigheden in Zwolle · Zwolle Routes",
    heading: /Bezienswaardigheden in Zwolle/,
  },
  {
    path: UNKNOWN_PATH,
    title: "Deze pagina bestaat niet · Zwolle Routes",
    heading: /Deze pagina bestaat niet/,
  },
];

/* one page per route, derived from the content */
export const ROUTE_PAGES: Page[] = ROUTES.map((route) => ({
  path: `${ROUTES_PATH}/${route.id}`,
  title: `${route.title} · Zwolle Routes`,
  heading: route.title,
}));

export const PAGES: Page[] = [...STATIC_PAGES, ...ROUTE_PAGES];

/* every url the site serves: a new route or page is overflow-checked and audited without a test edit */
export const ALL_PATHS = PAGES.map((page) => page.path);

/* the pages that draw the shared map, which falls back to its own panel without an api key */
export const MAP_PATHS = [
  ROUTES_PATH,
  POI_PATH,
  PLANNING_PATH,
  `${ROUTES_PATH}/${ROUTES[0].id}`,
];
