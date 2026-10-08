/* real-world coordinate */
export interface LatLng {
  lat: number;
  lng: number;
}

export interface MapPicture {
  src: string;
  alt: string;
}

export type MapImageId = "historic" | "satellite";

export type RouteTheme =
  | "Historisch"
  | "Wandel"
  | "Kunst"
  | "Fiets"
  | "Culinair";

export type RouteDifficulty = "Makkelijk" | "Gemiddeld";

/* "Toen" sits on the historic map layer, "Nu" is present-day */
export type PoiEra = "Toen" | "Nu";

/* sent to the directions api verbatim */
export type TravelMode = "walking" | "bicycling";

export interface RouteGeometry {
  path: LatLng[];
  distanceKm: number;
  durationMinutes: number;
  followsStreets: boolean;
}

export interface Route {
  id: string;
  title: string;
  area: string;
  theme: RouteTheme;
  difficulty: RouteDifficulty;
  distanceKm: number;
  durationMinutes: number;
  rating: number;
  reviews: number;
  popular: boolean;
  description: string;
  poiIds: string[];
}

export type PoiCategoryName = "Monumenten" | "Musea" | "Culinair";

export interface PoiCategory {
  id: PoiCategoryName;
  icon: string;
}

export interface PointOfInterest {
  id: string;
  name: string;
  category: PoiCategoryName;
  era: PoiEra;
  area: string;
  description: string;
  rating: number;
  reviews: number;
  distanceKm: number;
  placeId: string;
  address: string;
  coordinates: LatLng;
  image?: string;
}

export interface RouteReview {
  id: string;
  author: string;
  initials: string;
  date: string;
  rating: number;
  text: string;
}

export interface StarBucket {
  stars: number;
  count: number;
}

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
  phoneHref: string;
  address: string;
}

export type SearchKind = "route" | "poi";

export interface SearchRecord {
  id: string;
  title: string;
  meta: string;
}

export interface SearchIndex {
  routes: SearchRecord[];
  pointsOfInterest: SearchRecord[];
}

/* the value is a union, so a typo is a compile error and not an empty list */
export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

export type RoutePopularityFilter = "all" | "popular";
export type RouteDistanceFilter = "all" | "short" | "medium" | "long";
export type RouteThemeFilter = "all" | RouteTheme;
export type RouteDifficultyFilter = "all" | RouteDifficulty;

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
