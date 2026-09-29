/* the places the site knows about — every one of them is inside the area it covers (data/area.ts), and every coordinate, address and place id comes from google's places api rather than from anyone's memory */
/* how the list was resolved, and how to resolve it again after adding a place, is written down in docs/DESIGN.md §8; the ratings, review counts and descriptions are still placeholder content for the collaborator's api */
/* `image` is where a picture of a place goes once there is one; the preview card and the home strip show a plain card without it */

import { haversineKm, STREET_FACTOR } from "./routeGeometry.ts";
import type {
  LatLng,
  PoiCategory,
  PoiCategoryName,
  PoiFilterState,
  PoiSort,
  PointOfInterest,
  SelectOption,
} from "../types.ts";

export const CATEGORIES: PoiCategory[] = [
  { id: "Monumenten", icon: "account_balance" },
  { id: "Musea", icon: "museum" },
  { id: "Parken", icon: "park" },
  { id: "Culinair", icon: "restaurant" },
];

/** the glyph for a category, used by chips and cards. falls back to a pin. */
export function poiCategoryIcon(category: PoiCategoryName): string {
  return CATEGORIES.find((item) => item.id === category)?.icon ?? "place";
}

/* cheapest sort first: rating, name, distance */
export const POI_SORTS: SelectOption<PoiSort>[] = [
  { value: "rating", label: "Beoordeling" },
  { value: "name", label: "Naam" },
  { value: "distance", label: "Afstand" },
];

export const INITIAL_POI_FILTERS: PoiFilterState = {
  query: "",
  category: "all",
  sort: "rating",
};

/* true when a filter has left its resting value, which is what shows "Filters wissen"; the comparison reads INITIAL_POI_FILTERS, so a new filter cannot be left behind */
export function hasActivePoiFilters(filters: PoiFilterState): boolean {
  const restingKeys = Object.keys(
    INITIAL_POI_FILTERS,
  ) as (keyof PoiFilterState)[];

  return restingKeys.some((key) => filters[key] !== INITIAL_POI_FILTERS[key]);
}

/* the square every distance on this site is measured from, resolved through the places api like the rest of them */
const GROTE_MARKT: LatLng = { lat: 52.5122429, lng: 6.0927568 };

/* the list before its distances are worked out; the walk is measured from the coordinates, so it cannot fall out of step with the pin */
const RESOLVED_PLACES: Omit<PointOfInterest, "distanceKm">[] = [
  {
    id: "peperbus",
    name: "De Peperbus",
    category: "Monumenten",
    era: "Toen",
    area: "Binnenstad",
    description:
      "De 75 meter hoge toren van de basiliek, al eeuwen het herkenningspunt van de stad.",
    rating: 4.8,
    reviews: 312,
    placeId: "ChIJIS7KXC7fx0cRvWB4rIIhgMs",
    address: "Ossenmarkt 40, 8011 MS Zwolle",
    coordinates: { lat: 52.5121724, lng: 6.0898097 },
  },
  {
    id: "sassenpoort",
    name: "Sassenpoort",
    category: "Monumenten",
    era: "Toen",
    area: "Binnenstad",
    description:
      "De middeleeuwse stadspoort uit 1409, het best bewaarde stukje stadsmuur van Zwolle.",
    rating: 4.9,
    reviews: 487,
    placeId: "ChIJZ835lCXfx0cRnFqiEL3qY84",
    address: "Sassenstraat 53, 8011 PB Zwolle",
    coordinates: { lat: 52.5099842, lng: 6.0955212 },
  },
  {
    id: "grote-kerk",
    name: "Grote Kerk (Academiehuis)",
    category: "Monumenten",
    era: "Toen",
    area: "Binnenstad",
    description:
      "De gotische kerk aan de Grote Markt, met het beroemde orgel waarop Mozart speelde. Het gebouw is nu het Academiehuis.",
    rating: 4.7,
    reviews: 254,
    placeId: "ChIJqZQ6pC_fx0cRQUcrDmBkiho",
    address: "Grote Markt 18, 8011 LW Zwolle",
    coordinates: { lat: 52.5118557, lng: 6.0922375 },
  },
  {
    id: "museum-de-fundatie",
    name: "Museum de Fundatie",
    category: "Musea",
    era: "Nu",
    area: "Binnenstad",
    description:
      "Beeldende kunst in een paleis met een opvallende ei-vormige aanbouw op het dak.",
    rating: 4.6,
    reviews: 398,
    placeId: "ChIJsWzGGS_fx0cRktQ6qRlnZ0c",
    address: "Blijmarkt 20, 8011 NE Zwolle",
    coordinates: { lat: 52.5102639, lng: 6.0915627 },
  },
  {
    id: "anno-stadsmuseum",
    name: "ANNO Stadsmuseum Zwolle",
    category: "Musea",
    era: "Nu",
    area: "Binnenstad",
    description:
      "De geschiedenis van Zwolle in één gebouw: van de Hanze tot het heden. Voorheen het Stedelijk Museum.",
    rating: 4.5,
    reviews: 176,
    placeId: "ChIJZbvtYZzfx0cRdZR2UoXA4hk",
    address: "Melkmarkt 41, 8011 MB Zwolle",
    coordinates: { lat: 52.5129789, lng: 6.0905366 },
  },
  {
    id: "park-eekhout",
    name: "Park Eekhout",
    category: "Parken",
    era: "Nu",
    area: "Binnenstad",
    description:
      "Het oudste park van Zwolle, een rustige groene long tussen de singel en het station.",
    rating: 4.5,
    reviews: 96,
    placeId: "ChIJm7WGti7fx0cRRbF2N7FHpoI",
    address: "Burgemeester van Roijensingel 4, 8011 CH Zwolle",
    coordinates: { lat: 52.5091092, lng: 6.0889634 },
  },
  {
    id: "restaurant-de-librije",
    name: "De Librije",
    category: "Culinair",
    era: "Nu",
    area: "Noordereiland",
    description:
      "Het beroemdste restaurant van de stad, gevestigd in een oude gevangenis aan het Spinhuisplein.",
    rating: 4.8,
    reviews: 512,
    placeId: "ChIJZTzQ4y_fx0cR4m292pUWJyM",
    address: "Spinhuisplein 1, 8011 ZZ Zwolle",
    coordinates: { lat: 52.515378, lng: 6.0977888 },
  },
  {
    id: "thorbeckegracht",
    name: "Thorbeckegracht",
    category: "Culinair",
    era: "Nu",
    area: "Binnenstad",
    description:
      "De gracht met de terrassen: aan het water eten met de boten en de oude pakhuizen op de achtergrond.",
    rating: 4.6,
    reviews: 187,
    placeId: "ChIJ5UcPBjDfx0cRIOYsWSZBdac",
    address: "Thorbeckegracht, 8011 Zwolle",
    coordinates: { lat: 52.5147059, lng: 6.0950191 },
  },
  {
    id: "melkmarkt",
    name: "Melkmarkt",
    category: "Culinair",
    era: "Toen",
    area: "Binnenstad",
    description:
      "Het gezelligste plein van de binnenstad, vol terrassen en kleine lunchzaken.",
    rating: 4.4,
    reviews: 264,
    placeId: "ChIJ-S5tNS7fx0cRlm2tsYMtJc4",
    address: "Melkmarkt, 8011 MB Zwolle",
    coordinates: { lat: 52.5129579, lng: 6.0912076 },
  },
];

export const POINTS_OF_INTEREST: PointOfInterest[] = RESOLVED_PLACES.map(
  (place) => ({
    ...place,
    distanceKm: haversineKm(place.coordinates, GROTE_MARKT) * STREET_FACTOR,
  }),
);

/** one place by its id — a route stores ids, so this is the one lookup between a route and the places it visits */
export function getPointOfInterest(id: string): PointOfInterest | undefined {
  return POINTS_OF_INTEREST.find((point) => point.id === id);
}

/** the overview's filter + sort logic, next to the data it works on */
export function filterPointsOfInterest(
  filters: PoiFilterState,
): PointOfInterest[] {
  const needle = filters.query.trim().toLowerCase();

  const matches = POINTS_OF_INTEREST.filter((point) => {
    if (
      needle &&
      !`${point.name} ${point.area} ${point.category}`
        .toLowerCase()
        .includes(needle)
    ) {
      return false;
    }
    if (filters.category !== "all" && point.category !== filters.category) {
      return false;
    }

    return true;
  });

  return matches.sort((a, b) => {
    if (filters.sort === "name") return a.name.localeCompare(b.name, "nl");
    if (filters.sort === "distance") return a.distanceKm - b.distanceKm;

    return b.rating - a.rating;
  });
}
