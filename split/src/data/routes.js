/*
route content — the data behind the home page, the route overview, the detail page and
the planner.

path points live in 0-100 space and get scaled onto the map's own viewBox by
components/mapArtwork.jsx, so a route keeps one coordinate system wherever it is drawn.
distances are kilometres and durations are minutes, stored as numbers so the overview
can filter and the planner can add them up, and turned into labels by src/format.js.

this is still placeholder content, standing in for the collaborator's api: the
frontend is not wired to a backend yet.
*/

export const ROUTE_THEMES = [
  "Historisch",
  "Wandel",
  "Kunst",
  "Fiets",
  "Natuur",
  "Culinair",
];

export const ROUTE_DIFFICULTIES = ["Makkelijk", "Gemiddeld", "Uitdagend"];

/* one glyph per theme, so a card, a filter and a detail panel describe a route type the
   same way. every name is in the material symbols subset in index.html. */
export const ROUTE_THEME_ICONS = {
  Historisch: "account_balance",
  Wandel: "directions_walk",
  Kunst: "museum",
  Fiets: "directions_bike",
  Natuur: "park",
  Culinair: "restaurant",
};

/* How many cards the home page previews, and how many the overview shows before
   "Toon meer routes". */
export const ROUTE_PREVIEW_COUNT = 3;
export const ROUTE_PAGE_SIZE = 9;

export const ROUTES = [
  {
    id: "hanzekwartier-peperbus",
    title: "Hanzekwartier & Peperbus",
    area: "Binnenstad",
    theme: "Historisch",
    difficulty: "Makkelijk",
    distanceKm: 3.2,
    durationMinutes: 45,
    elevation: 8,
    rating: 4.9,
    reviews: 128,
    popular: true,
    startPoint: "Grote Markt",
    description:
      "Langs de oude pakhuizen van het Hanzekwartier naar de Peperbus, met onderweg de Grote Markt en de Thorbeckegracht.",
    stops: ["Grote Markt", "Peperbus", "Thorbeckegracht", "Melkmarkt"],
    path: [
      [24, 56],
      [44, 36],
      [62, 50],
      [74, 32],
    ],
  },
  {
    id: "rondje-stadsgracht",
    title: "Rondje Stadsgracht",
    area: "Stadsgracht",
    theme: "Wandel",
    difficulty: "Gemiddeld",
    distanceKm: 6.8,
    durationMinutes: 90,
    elevation: 14,
    rating: 4.7,
    reviews: 94,
    popular: false,
    startPoint: "Sassenpoort",
    description:
      "Een volledige ronde over de wallen die Zwolle ooit verdedigden, met de singel als groene rand.",
    stops: ["Sassenpoort", "Willemskade", "Park de Wezenlanden", "Diezerpoort"],
    path: [
      [22, 30],
      [40, 58],
      [60, 40],
      [76, 62],
    ],
  },
  {
    id: "assendorp-art-route",
    title: "Assendorp Art Route",
    area: "Assendorp",
    theme: "Kunst",
    difficulty: "Makkelijk",
    distanceKm: 4.1,
    durationMinutes: 55,
    elevation: 6,
    rating: 4.8,
    reviews: 76,
    popular: true,
    startPoint: "Museum de Fundatie",
    description:
      "Langs muurschilderingen, ateliers en galeries in de wijk waar de Zwolse kunstenaars werken.",
    stops: ["Museum de Fundatie", "Hofvlietstraat", "Ateliers Assendorp", "Vondelkwartier"],
    path: [
      [22, 62],
      [46, 44],
      [56, 62],
      [74, 38],
    ],
  },
  {
    id: "ijssel-spoolderbos",
    title: "IJssel & Spoolderbos",
    area: "Spoolderbos",
    theme: "Fiets",
    difficulty: "Uitdagend",
    distanceKm: 8.4,
    durationMinutes: 125,
    elevation: 21,
    rating: 4.6,
    reviews: 61,
    popular: false,
    startPoint: "IJsselbrug",
    description:
      "Het langste rondje van de set: langs de IJssel het bos in, met de beste uitzichten van de stad.",
    stops: ["IJsselbrug", "Katerveer", "Spoolderbos", "Nieuwe Wetering"],
    path: [
      [20, 42],
      [38, 26],
      [56, 50],
      [74, 58],
    ],
  },
  {
    id: "binnenstad-highlights",
    title: "Binnenstad Highlights",
    area: "Centrum",
    theme: "Historisch",
    difficulty: "Makkelijk",
    distanceKm: 2.6,
    durationMinutes: 35,
    elevation: 5,
    rating: 4.9,
    reviews: 203,
    popular: true,
    startPoint: "Grote Markt",
    description:
      "De kortste route langs alle hoogtepunten van de binnenstad: ideaal voor een eerste bezoek aan Zwolle.",
    stops: ["Grote Markt", "Peperbus", "Sassenpoort", "Grote of Sint-Michaëlskerk"],
    path: [
      [26, 62],
      [42, 40],
      [62, 30],
      [74, 52],
    ],
  },
  {
    id: "berkum-buiten",
    title: "Berkum Buiten",
    area: "Berkum",
    theme: "Natuur",
    difficulty: "Gemiddeld",
    distanceKm: 5.5,
    durationMinutes: 75,
    elevation: 11,
    rating: 4.5,
    reviews: 48,
    popular: false,
    startPoint: "Berkum",
    description:
      "Van de stad naar het buitengebied: bos, weilanden en de Agnietenberg op een steenworp afstand.",
    stops: ["Berkum", "Agnietenberg", "Landgoed De Werkeren", "Berkumerenk"],
    path: [
      [22, 34],
      [46, 50],
      [60, 28],
      [76, 46],
    ],
  },
  {
    id: "historische-singel-route",
    title: "Historische Singel-route",
    area: "Binnenstad",
    theme: "Historisch",
    difficulty: "Gemiddeld",
    distanceKm: 5.2,
    durationMinutes: 75,
    elevation: 12,
    rating: 4.8,
    reviews: 123,
    popular: true,
    startPoint: "Grote Markt",
    description:
      "De klassieke ronde door de binnenstad en langs de singel, met de stadsmuur, de Peperbus en de Sassenpoort. De historische kaartlaag laat zien waar de oude grachten liepen.",
    stops: [
      "Grote Markt",
      "Peperbus",
      "Sassenpoort",
      "Museum de Fundatie",
      "Thorbeckegracht",
    ],
    path: [
      [20, 28],
      [34, 52],
      [54, 38],
      [70, 58],
      [78, 42],
    ],
  },
  {
    id: "diezerpoort-katerveer",
    title: "Diezerpoort & Katerveer",
    area: "Diezerpoort",
    theme: "Historisch",
    difficulty: "Makkelijk",
    distanceKm: 4.8,
    durationMinutes: 65,
    elevation: 9,
    rating: 4.4,
    reviews: 37,
    popular: false,
    startPoint: "Diezerpoort",
    description:
      "Van de oude stadspoort naar de IJsselkade, langs de plek waar de Hanzeschepen aanlegden.",
    stops: ["Diezerpoort", "Katerveer", "IJsselkade", "Buiten de Dieze"],
    path: [
      [30, 22],
      [52, 38],
      [68, 28],
      [78, 50],
    ],
  },
  {
    id: "wezenlanden-wandeling",
    title: "Wezenlanden wandeling",
    area: "Wezenlanden",
    theme: "Natuur",
    difficulty: "Makkelijk",
    distanceKm: 3.6,
    durationMinutes: 50,
    elevation: 7,
    rating: 4.6,
    reviews: 88,
    popular: true,
    startPoint: "Park de Wezenlanden",
    description:
      "Een groen half uur door het stadspark, met de vijver en de oude bomen als middelpunt.",
    stops: ["Park de Wezenlanden", "Vijver Wezenlanden", "Weteringpark", "Assendorperdijk"],
    path: [
      [20, 48],
      [36, 34],
      [52, 56],
      [72, 44],
    ],
  },
  {
    id: "molenroute-langs-de-ijssel",
    title: "Molenroute langs de IJssel",
    area: "Westenholte",
    theme: "Fiets",
    difficulty: "Gemiddeld",
    distanceKm: 7.1,
    durationMinutes: 95,
    elevation: 15,
    rating: 4.5,
    reviews: 42,
    popular: false,
    startPoint: "Molen De Passiebloem",
    description:
      "Langs de molens en de uiterwaarden van de IJssel, met een stop bij de Westenholter plas.",
    stops: ["Molen De Passiebloem", "Westenholter plas", "IJsseldijk", "Voorst"],
    path: [
      [22, 58],
      [40, 30],
      [62, 46],
      [78, 34],
    ],
  },
  {
    id: "katerveer-culinair",
    title: "Katerveer Culinair",
    area: "Katerveer",
    theme: "Culinair",
    difficulty: "Makkelijk",
    distanceKm: 2.9,
    durationMinutes: 60,
    elevation: 4,
    rating: 4.7,
    reviews: 119,
    popular: true,
    startPoint: "Grote Markt",
    description:
      "Een korte route langs de keukens van Zwolle: van de Grote Markt naar de IJsselkade en terug.",
    stops: ["Grote Markt", "Melkmarkt", "IJsselkade", "Thorbeckegracht"],
    path: [
      [28, 44],
      [46, 60],
      [62, 44],
      [76, 56],
    ],
  },
  {
    id: "groene-singel-rond-zwolle",
    title: "Groene singel rond Zwolle",
    area: "Zwolle-Zuid",
    theme: "Fiets",
    difficulty: "Uitdagend",
    distanceKm: 9.3,
    durationMinutes: 155,
    elevation: 24,
    rating: 4.3,
    reviews: 29,
    popular: false,
    startPoint: "Sassenpoort",
    description:
      "De hele singel rond: van de Sassenpoort tot Zwolle-Zuid en via de oostkant weer terug.",
    stops: ["Sassenpoort", "Wezenlanden", "Zwolle-Zuid", "Oosterenk", "Diezerpoort"],
    path: [
      [20, 38],
      [32, 56],
      [52, 32],
      [70, 54],
      [78, 40],
    ],
  },
];

/*
the routes closest to route: same theme first, then the rest by rating. always returns
something for the detail page to suggest, and never route itself.
*/
export function getRelatedRoutes(route, limit = 3) {
  return ROUTES.filter((candidate) => candidate.id !== route.id)
    .sort((a, b) => {
      const aSameTheme = a.theme === route.theme ? 0 : 1;
      const bSameTheme = b.theme === route.theme ? 0 : 1;
      return aSameTheme - bSameTheme || b.rating - a.rating;
    })
    .slice(0, limit);
}

/* the value of each filter is what the beerCSS select holds. "all" is the resting state,
   so an untouched panel filters nothing. */
export const INITIAL_ROUTE_FILTERS = {
  query: "",
  popularity: "all",
  distance: "all",
  theme: "all",
  difficulty: "all",
};

/** true when at least one filter is doing something, which is what shows the "Filters wissen" action */
export function hasActiveRouteFilters(filters) {
  return Object.entries(INITIAL_ROUTE_FILTERS).some(
    ([key, value]) => filters[key] !== value,
  );
}

/** the overview's filter logic, kept next to the data it filters instead of in the page */
export function filterRoutes(filters) {
  const needle = filters.query.trim().toLowerCase();

  return ROUTES.filter((route) => {
    if (
      needle &&
      !`${route.title} ${route.area} ${route.theme} ${route.startPoint}`
        .toLowerCase()
        .includes(needle)
    ) {
      return false;
    }
    if (filters.popularity === "popular" && !route.popular) return false;
    if (filters.distance === "short" && route.distanceKm >= 4) return false;
    if (filters.distance === "medium" && (route.distanceKm < 4 || route.distanceKm > 7))
      return false;
    if (filters.distance === "long" && route.distanceKm <= 7) return false;
    if (filters.theme !== "all" && route.theme !== filters.theme) return false;
    if (filters.difficulty !== "all" && route.difficulty !== filters.difficulty)
      return false;

    return true;
  });
}

/*
reviews.

there is no api yet, so the written reviews are a fixed sample and the star histogram is
calculated from each route's own reviews total. that keeps the bars adding up to the
number the header prints, instead of inventing a second number that disagrees with it.
*/

/* how the review total is spread over 5 to 1 stars */
const REVIEW_DISTRIBUTION = [0.71, 0.19, 0.06, 0.03, 0.01];

export function buildReviewBreakdown(totalReviews) {
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

export const ROUTE_REVIEWS = [
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
