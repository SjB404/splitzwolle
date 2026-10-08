import { ROUTES } from "../../src/data/routes.ts";
import { POINTS_OF_INTEREST } from "../../src/data/pointsOfInterest.ts";
import { pointsInArea } from "../../src/data/area.ts";
import {
  CONTACT_PATH,
  HOME_PATH,
  POI_PATH,
  ROUTES_PATH,
  builderPath,
  pointOfInterestPath,
  publicRoutePath,
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
  CONTACT_PATH,
  LOGIN_PATH,
  CUSTOM_ROUTE_PATH,
  PUBLIC_ROUTE_PATH,
  isActiveLink,
  builderPath,
  publicRoutePath,
  pointOfInterestPath,
  parsePlaceIds,
} from "../../src/data/navigation.ts";

export { NAV_LINKS } from "../../src/components/navbar.tsx";
export {
  FOOTER_COLUMNS,
  CONTACT_DETAILS,
} from "../../src/components/footer.tsx";

export type {
  Route,
  PointOfInterest,
  RouteFilterState,
  PoiFilterState,
} from "../../src/types.ts";

export const UNKNOWN_PATH = "/dit-bestaat-niet";

interface Page {
  path: string;
  /* what PageTitle writes into the tab */
  title: string;
  heading: string | RegExp;
}

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
    path: POI_PATH,
    title: "Bezienswaardigheden in Zwolle · Zwolle Routes",
    heading: /Bezienswaardigheden in Zwolle/,
  },
  {
    path: CONTACT_PATH,
    title: "Neem contact met ons op · Zwolle Routes",
    heading: "Neem contact met ons op",
  },
  {
    path: UNKNOWN_PATH,
    title: "Deze pagina bestaat niet · Zwolle Routes",
    heading: /Deze pagina bestaat niet/,
  },
];

export const ROUTE_PAGES: Page[] = ROUTES.map((route) => ({
  path: publicRoutePath(route.id),
  title: `${route.title} · Zwolle Routes`,
  heading: route.title,
}));

/* the densest builder state, used for the overflow checks */
export const BUILT_ROUTE_PATH = builderPath(
  pointsInArea(POINTS_OF_INTEREST)
    .slice(0, 2)
    .map((point) => point.id),
);

export const PAGES: Page[] = [
  ...STATIC_PAGES,
  ...ROUTE_PAGES,
  {
    path: pointOfInterestPath(POINTS_OF_INTEREST[0].id),
    title: "Bezienswaardigheden in Zwolle · Zwolle Routes",
    heading: /Bezienswaardigheden in Zwolle/,
  },
  {
    path: BUILT_ROUTE_PATH,
    title: "Stel je route samen · Zwolle Routes",
    heading: /Stel je route samen/,
  },
];

export const ALL_PATHS = PAGES.map((page) => page.path);

export const MAP_PATHS = [
  ROUTES_PATH,
  POI_PATH,
  publicRoutePath(ROUTES[0].id),
  BUILT_ROUTE_PATH,
];
