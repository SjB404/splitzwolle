/*
domain types — the vocabulary every other file shares.

the data modules (data/routes.ts, data/pointsOfInterest.ts, data/maps.ts,
data/navigation.ts) are the only place these values are produced, and everything else
reads them. writing the shape down once is what lets a component say "give me a
Route" instead of repeating which fields it needs, and it turns a renamed field into
a compile error instead of a blank spot on the page.

nothing here runs. it is the vocabulary; the values live next to the data they
describe and the behaviour next to the data it works on.
*/

/* a point in the artwork's own 0-100 space, scaled onto a picture by
   components/mapArtwork.tsx. routes, stops and pins all speak it, which is why one
   drawing fits the hero, a card and the planner alike. */
export type MapPosition = [number, number];

/*
a map picture: where the file lives, and the sentence that describes it for a reader
who cannot see it.

it is not called MapImage because that name belongs to the component that draws one
(components/mapArtwork.tsx). two things with one name is how a file ends up importing
the wrong one.
*/
export interface MapPicture {
  src: string;
  alt: string;
}

/* the six exports in src/assets/maps are known by these names, and data/maps.ts is
   where a name becomes a file (see the readability note there). */
export type MapImageId = "historic" | "satellite" | "places" | "terrain" | "roads";

/* the kinds of route the app offers. a route's theme is one of these strings, so the
   filter, the card and the detail page all compare the same values. */
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

/* the four kinds of place, and a category together with the glyph that stands for it.
   the glyph lives beside the name so a chip and a card cannot disagree about it. */
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

/* the paths and the links the bar, the footer and the router all read from one place */
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

/* a choice in a BeerCSS select. the value is a union of the strings the filter logic
   compares against, so a typo is a compile error and not an empty list. */
export interface SelectOption<Value extends string = string> {
  value: Value;
  label: string;
}

/*
the filter state of the two overviews.

every list rests on "all", which is what makes an untouched panel filter nothing out.
the resting state itself is INITIAL_ROUTE_FILTERS / INITIAL_POI_FILTERS, declared next
to the logic that uses it.

they are named …State and not …Filters because the panel components are already called
RouteFilters and PoiFilters. one name for two things is how a file ends up importing
the wrong one.
*/
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
