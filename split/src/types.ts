/* domain types — the vocabulary every other file shares; the data modules are the only place these values are produced, and writing the shape down once turns a renamed field into a compile error */

/* a point in the artwork's own 0-100 space — the hero's pictures are the only thing that still speaks it */
export type MapPosition = [number, number];

/* a real-world coordinate for the interactive maps — deliberately a second type, because the 0-100 space above is placed by hand on one export and must never be confused with a latitude */
export interface LatLng {
  lat: number;
  lng: number;
}

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

export type RouteDifficulty = "Makkelijk" | "Gemiddeld";

/* which half of "toen en nu" a place belongs to: a place van toen is a monument that is on the historic map, a place van nu is what the city is today (a museum, a park, a restaurant) */
export type PoiEra = "Toen" | "Nu";

/* the two ways this site travels the city, spelled the way the directions api spells them */
export type TravelMode = "walking" | "bicycling";

/* what a planned route turned out to be — the api's answer when it had one, and our own estimate when it did not */
export interface RouteGeometry {
  path: LatLng[];
  distanceKm: number;
  durationMinutes: number;
  /* true when the line follows the streets, false when it is a straight connector with an estimated length */
  followsStreets: boolean;
}

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
  description: string;
  /** the places the route visits, in order — a route is a walk from point to point, and both of its lines (the map's and the artwork's) are derived from these */
  poiIds: string[];
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
  /* toen or nu — the axis that decides which map layer a place belongs to */
  era: PoiEra;
  area: string;
  description: string;
  rating: number;
  reviews: number;
  /** the walk from the Grote Markt, measured from the place's own coordinates when the data module loads */
  distanceKm: number;
  /* the id the places api answered with; a re-resolve of the list finds this same pin again, which is what keeps a place from moving */
  placeId: string;
  /* the address the places api gave back, shown to the reader and used to look the place up elsewhere */
  address: string;
  /** where the place really is — resolved from the places api, never typed by hand */
  coordinates: LatLng;
  /** a picture of the place, once the collaborator supplies one; the preview falls back to a plain card without it */
  image?: string;
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

/* whose route it is: one the reader saved in this browser, or one the community made */
export type RouteOwnershipFilter = "all" | "saved" | "community";

export interface RouteFilterState {
  query: string;
  popularity: RoutePopularityFilter;
  distance: RouteDistanceFilter;
  theme: RouteThemeFilter;
  difficulty: RouteDifficultyFilter;
  ownership: RouteOwnershipFilter;
}

export type PoiCategoryFilter = "all" | PoiCategoryName;
export type PoiSort = "rating" | "name" | "distance";

export interface PoiFilterState {
  query: string;
  category: PoiCategoryFilter;
  sort: PoiSort;
}
