import { getPointOfInterest } from "./pointsOfInterest.ts";
import type {
  LatLng,
  PointOfInterest,
  Route,
  RouteDifficulty,
  RouteFilterState,
  RouteReview,
  RouteTheme,
  StarBucket,
} from "../types.ts";

export const ROUTE_THEMES: RouteTheme[] = [
  "Historisch",
  "Wandel",
  "Kunst",
  "Fiets",
  "Culinair",
];

export const ROUTE_DIFFICULTIES: RouteDifficulty[] = ["Makkelijk", "Gemiddeld"];

export const ROUTE_PREVIEW_COUNT = 3;
export const ROUTE_PAGE_SIZE = 6;

export const ROUTES: Route[] = [
  {
    id: "binnenstad-highlights",
    title: "Binnenstad Highlights",
    area: "Binnenstad",
    theme: "Historisch",
    difficulty: "Makkelijk",
    distanceKm: 1.1,
    durationMinutes: 20,
    rating: 4.9,
    reviews: 203,
    popular: true,
    description:
      "De klassiekers op een rij: van de Sassenpoort via de Grote Kerk en de Peperbus naar het Vrouwenhuis.",
    poiIds: ["sassenpoort", "grote-kerk", "peperbus", "vrouwenhuis"],
  },
  {
    id: "hanzekwartier-peperbus",
    title: "Hanzekwartier & Peperbus",
    area: "Binnenstad",
    theme: "Wandel",
    difficulty: "Makkelijk",
    distanceKm: 1.4,
    durationMinutes: 25,
    rating: 4.8,
    reviews: 128,
    popular: true,
    description:
      "Langs de oude pakhuizen van het Hanzekwartier en de Thorbeckegracht, via het Vrouwenhuis naar de Peperbus.",
    poiIds: ["thorbeckegracht", "vrouwenhuis", "peperbus"],
  },
  {
    id: "musea-in-het-centrum",
    title: "Musea in het centrum",
    area: "Binnenstad",
    theme: "Kunst",
    difficulty: "Makkelijk",
    distanceKm: 1,
    durationMinutes: 20,
    rating: 4.6,
    reviews: 76,
    popular: false,
    description:
      "Drie musea op een steenworp afstand: de Fundatie aan het Blijmarkt, het ANNO Stadsmuseum en het Vrouwenhuis aan de Voorstraat.",
    poiIds: ["museum-de-fundatie", "anno-stadsmuseum", "vrouwenhuis"],
  },
  {
    id: "culinair-centrum",
    title: "Culinair centrum",
    area: "Binnenstad",
    theme: "Culinair",
    difficulty: "Makkelijk",
    distanceKm: 1.3,
    durationMinutes: 30,
    rating: 4.7,
    reviews: 119,
    popular: true,
    description:
      "Van de Zwolse balletjes op het Grote Kerkplein naar de terrassen aan de Thorbeckegracht: eten en drinken in de binnenstad.",
    poiIds: ["balletjeshuis", "thorbeckegracht"],
  },
  {
    id: "park-en-gracht",
    title: "Fundatie & gracht",
    area: "Buitensingel",
    theme: "Kunst",
    difficulty: "Makkelijk",
    distanceKm: 1.8,
    durationMinutes: 30,
    rating: 4.6,
    reviews: 88,
    popular: false,
    description:
      "Van Museum de Fundatie naar de Thorbeckegracht: kunst binnen en het water buiten.",
    poiIds: ["museum-de-fundatie", "thorbeckegracht"],
  },
  {
    id: "rondje-stadsgracht",
    title: "Rondje Stadsgracht",
    area: "Buitensingel",
    theme: "Wandel",
    difficulty: "Gemiddeld",
    distanceKm: 2.6,
    durationMinutes: 45,
    rating: 4.7,
    reviews: 94,
    popular: false,
    description:
      "Een ronde over de wallen die Zwolle ooit verdedigden: de Sassenpoort, de Thorbeckegracht en de Fundatie.",
    poiIds: [
      "sassenpoort",
      "thorbeckegracht",
      "museum-de-fundatie",
    ],
  },
  {
    id: "grachten-fietsroute",
    title: "Grachten & singel",
    area: "Buitensingel",
    theme: "Fiets",
    difficulty: "Gemiddeld",
    distanceKm: 2.4,
    durationMinutes: 25,
    rating: 4.5,
    reviews: 42,
    popular: false,
    description:
      "De hele binnenstad op de fiets: over de singel langs de Grote Kerk, de Peperbus en de Thorbeckegracht.",
    poiIds: [
      "sassenpoort",
      "grote-kerk",
      "peperbus",
      "thorbeckegracht",
      "museum-de-fundatie",
    ],
  },
  {
    id: "historische-singel-route",
    title: "Historische Singel-route",
    area: "Binnenstad",
    theme: "Historisch",
    difficulty: "Gemiddeld",
    distanceKm: 1.6,
    durationMinutes: 30,
    rating: 4.8,
    reviews: 123,
    popular: true,
    description:
      "Langs de oude stadsmuur en de singel: de Grote Kerk, de Sassenpoort en de Thorbeckegracht. De historische kaartlaag laat zien waar de grachten liepen.",
    poiIds: ["grote-kerk", "sassenpoort", "thorbeckegracht"],
  },
];

export function routePoints(route: Route): PointOfInterest[] {
  return route.poiIds
    .map((id) => getPointOfInterest(id))
    .filter((point): point is PointOfInterest => point !== undefined);
}

export function routeCoordinates(route: Route): LatLng[] {
  return routePoints(route).map((point) => point.coordinates);
}

export function getRelatedRoutes(route: Route, limit = 3): Route[] {
  return ROUTES.filter((candidate) => candidate.id !== route.id)
    .sort((a, b) => {
      const aSameTheme = a.theme === route.theme ? 0 : 1;
      const bSameTheme = b.theme === route.theme ? 0 : 1;
      return aSameTheme - bSameTheme || b.rating - a.rating;
    })
    .slice(0, limit);
}

export const INITIAL_ROUTE_FILTERS: RouteFilterState = {
  query: "",
  popularity: "all",
  distance: "all",
  theme: "all",
  difficulty: "all",
  ownership: "all",
};

export function hasActiveRouteFilters(filters: RouteFilterState): boolean {
  const restingKeys = Object.keys(
    INITIAL_ROUTE_FILTERS,
  ) as (keyof RouteFilterState)[];

  return restingKeys.some((key) => filters[key] !== INITIAL_ROUTE_FILTERS[key]);
}

export function filterRoutes(
  filters: RouteFilterState,
  savedIds: string[] = [],
): Route[] {
  const needle = filters.query.trim().toLowerCase();

  return ROUTES.filter((route) => {
    if (needle) {
      /* place names count as searchable text too */
      const haystack = [
        route.title,
        route.area,
        route.theme,
        ...routePoints(route).map((point) => point.name),
      ]
        .join(" ")
        .toLowerCase();

      if (!haystack.includes(needle)) return false;
    }
    if (filters.popularity === "popular" && !route.popular) return false;
    if (filters.ownership === "saved" && !savedIds.includes(route.id))
      return false;
    if (filters.ownership === "community" && savedIds.includes(route.id))
      return false;
    /* in the centre: short < 1.5 km, long > 2.5 km */
    if (filters.distance === "short" && route.distanceKm >= 1.5) return false;
    if (
      filters.distance === "medium" &&
      (route.distanceKm < 1.5 || route.distanceKm > 2.5)
    )
      return false;
    if (filters.distance === "long" && route.distanceKm <= 2.5) return false;
    if (filters.theme !== "all" && route.theme !== filters.theme) return false;
    if (filters.difficulty !== "all" && route.difficulty !== filters.difficulty)
      return false;

    return true;
  });
}

/* no reviews api yet: the sample histogram is built from each route's own review total */
const REVIEW_DISTRIBUTION = [0.71, 0.19, 0.06, 0.03, 0.01];

export function buildReviewBreakdown(totalReviews: number): StarBucket[] {
  let assigned = 0;

  return REVIEW_DISTRIBUTION.map((share, index) => {
    const isLast = index === REVIEW_DISTRIBUTION.length - 1;
    const count = isLast
      ? Math.max(totalReviews - assigned, 0)
      : Math.round(totalReviews * share);
    assigned += count;

    return { stars: 5 - index, count };
  });
}

export const ROUTE_REVIEWS: RouteReview[] = [
  {
    id: "jan-de-vries",
    author: "Jan de Vries",
    initials: "JD",
    date: "3 september 2026",
    rating: 4.5,
    text: "Prachtige route langs de oude grachten. Met de historische kaartlaag zie je precies waar de stadsmuur heeft gestaan.",
  },
  {
    id: "pieter-drost",
    author: "Pieter Drost",
    initials: "PD",
    date: "21 augustus 2026",
    rating: 4,
    text: "Goed te lopen, ook met kinderen. Alleen bij de Sassenpoort is het even druk met auto's.",
  },
  {
    id: "sanne-bakker",
    author: "Sanne Bakker",
    initials: "SB",
    date: "9 augustus 2026",
    rating: 5,
    text: "Mijn favoriete rondje van de stad. De koffiestop halverwege is een aanrader.",
  },
  {
    id: "maaike-vos",
    author: "Maaike Vos",
    initials: "MV",
    date: "28 juli 2026",
    rating: 4.5,
    text: "Mooie afwisseling tussen de binnenstad en het groen bij de singel. De route is duidelijk aangegeven.",
  },
  {
    id: "tom-reinink",
    author: "Tom Reinink",
    initials: "TR",
    date: "14 juli 2026",
    rating: 3.5,
    text: "Leuke route, maar een paar stukken gaan over drukke fietspaden.",
  },
];
