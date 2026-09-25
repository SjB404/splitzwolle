/* domain types — the vocabulary every other file shares; the data modules are the only place these values are produced, and writing the shape down once turns a renamed field into a compile error */

/* a point in the artwork's own 0-100 space, scaled onto a picture by shared/map/mapArtwork.tsx; routes, stops and pins all speak it */
export type MapPosition = [number, number];

/* a map picture; not called MapImage because that name belongs to the component that draws one, and two things with one name is how a file imports the wrong one */
export interface MapPicture {
  src: string;
  alt: string;
}

/* the names the src/assets/maps exports are known by; data/maps.ts is where a name becomes a file */
export type MapImageId =
  | "historic"
  | "satellite"
  | "places"
  | "terrain"
  | "roads";

/* the kinds of route the app offers; the filter, the card and the detail page all compare these strings */
export type RouteTheme =
  | "Historisch"
  | "Wandel"
  | "Kunst"
  | "Fiets"
  | "Natuur"
  | "Culinair";

export type RouteDifficulty = "Makkelijk" | "Gemiddeld" | "Uitdagend";

export interface Route {
  id: string;
  title: string;
  area: string;
  theme: RouteTheme;
  difficulty: RouteDifficulty;
  /** kilometres, so the overview can filter and the planner can add up */
  distanceKm: number;
  /** minutes, for the same reason */
  durationMinutes: number;
  /** metres of climb */
  elevation: number;
  rating: number;
  /** how many ratings the score above is built from */
  reviews: number;
  popular: boolean;
  startPoint: string;
  description: string;
  stops: string[];
  /** the line drawn over the map, in 0-100 space */
  path: MapPosition[];
}

/* the four kinds of place, each with the glyph that stands for it, so a chip and a card cannot disagree */
export type PoiCategoryName = "Monumenten" | "Musea" | "Parken" | "Culinair";

export interface PoiCategory {
  id: PoiCategoryName;
  icon: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: PoiCategoryName;
  area: string;
  description: string;
  rating: number;
  reviews: number;
  /** walking distance from the Grote Markt, which is what the overview sorts on */
  distanceKm: number;
  /** where the pin goes, in 0-100 space */
  position: MapPosition;
}

export interface RouteReview {
  id: string;
  author: string;
  /** the two letters in the round avatar */
  initials: string;
  /** already written out in Dutch: the data is a sample, not a date to format */
  date: string;
  rating: number;
  text: string;
}

/** one bar of a rating breakdown: how many of the reviews gave this score */
export interface StarBucket {
  stars: number;
  count: number;
}

/* the paths and the links the bar, the footer and the router all read */
export interface NavLink {
  label: string;
  to: string;
}

export interface FooterColumn {
  title: string;
  links: NavLink[];
}

export interface ContactDetails {
  email: string;
  phone: string;
  /** the same number without spaces, for the tel: link */
  phoneHref: string;
  address: string;
}

/* the search index behind the home page's section bars — one record per searchable thing, with the id the caller resolves against its own content; data/searchIndex.json holds the records and data/search.ts matches on them */
export type SearchKind = "route" | "poi";

export interface SearchRecord {
  id: string;
  /** the words a reader is most likely to type */
  title: string;
  /** the rest of the words that should find it: area, theme, a synonym */
  meta: string;
}

export interface SearchIndex {
  routes: SearchRecord[];
  pointsOfInterest: SearchRecord[];
}

/* a choice in a BeerCSS select; the value is a union, so a typo is a compile error and not an empty list */
export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

/* the filter state of the two overviews — every list rests on "all", which is why an untouched panel filters nothing out; named …State because RouteFilters and PoiFilters are the components */
export type RoutePopularityFilter = "all" | "popular";
export type RouteDistanceFilter = "all" | "short" | "medium" | "long";
export type RouteThemeFilter = "all" | RouteTheme;
export type RouteDifficultyFilter = "all" | RouteDifficulty;

export interface RouteFilterState {
  query: string;
  popularity: RoutePopularityFilter;
  distance: RouteDistanceFilter;
  theme: RouteThemeFilter;
  difficulty: RouteDifficultyFilter;
}

export type PoiCategoryFilter = "all" | PoiCategoryName;
export type PoiSort = "rating" | "name" | "distance";

export interface PoiFilterState {
  query: string;
  category: PoiCategoryFilter;
  sort: PoiSort;
}
