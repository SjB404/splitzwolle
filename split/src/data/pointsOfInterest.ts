/* coordinates, addresses and place ids come from google's places api, never typed by hand */

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
  { id: "Culinair", icon: "restaurant" },
];

export function poiCategoryIcon(category: PoiCategoryName): string {
  return CATEGORIES.find((item) => item.id === category)?.icon ?? "place";
}

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

export function hasActivePoiFilters(filters: PoiFilterState): boolean {
  const restingKeys = Object.keys(
    INITIAL_POI_FILTERS,
  ) as (keyof PoiFilterState)[];

  return restingKeys.some((key) => filters[key] !== INITIAL_POI_FILTERS[key]);
}

/* every distance on the site is measured from here */
const GROTE_MARKT: LatLng = { lat: 52.5122429, lng: 6.0927568 };

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
    name: "Academiehuis de Grote Kerk",
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
    id: "balletjeshuis",
    name: "Het Zwolse Balletjeshuis",
    category: "Culinair",
    era: "Nu",
    area: "Binnenstad",
    description:
      "De snoepwinkel aan het Grote Kerkplein waar de Zwolse balletjes nog altijd worden gemaakt.",
    rating: 4.4,
    reviews: 146,
    placeId: "ChIJq4LGCy_fx0cRSVfXheD08ic",
    address: "Grote Kerkplein 13, 8011 PK Zwolle",
    coordinates: { lat: 52.511179, lng: 6.0922176 },
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
    id: "thorbeckegracht",
    name: "Thorbeckegracht & Stadsmuren",
    category: "Culinair",
    era: "Nu",
    area: "Binnenstad",
    description:
      "De gracht met de terrassen én de oude stadsmuur: aan het water eten met de boten en de pakhuizen op de achtergrond.",
    rating: 4.6,
    reviews: 187,
    placeId: "ChIJ5UcPBjDfx0cRIOYsWSZBdac",
    address: "Thorbeckegracht, 8011 Zwolle",
    coordinates: { lat: 52.5147059, lng: 6.0950191 },
  },
  {
    id: "vrouwenhuis",
    name: "Het Vrouwenhuis",
    category: "Musea",
    era: "Toen",
    area: "Binnenstad",
    description:
      "Het zeventiende-eeuwse vrouwenhofje aan de Voorstraat, met een interieur dat al eeuwen intact is.",
    rating: 4.1,
    reviews: 31,
    placeId: "ChIJ6b4TQC7fx0cRYdBotZ6rUsc",
    address: "Voorstraat 46, 8011 ML Zwolle",
    coordinates: { lat: 52.5129419, lng: 6.0896251 },
  },
  {
    id: "van-der-velde-in-de-broeren",
    name: "Van der Velde in de Broeren",
    category: "Monumenten",
    era: "Nu",
    area: "Binnenstad",
    description:
      "De boekhandel in de Broerenkerk, met de boeken tussen de hoge gewelven van de oude kerk.",
    rating: 4.6,
    reviews: 6359,
    placeId: "ChIJ3fBwNSXfx0cRngG_gUnrhtU",
    address: "Achter de Broeren 1-3, 8011 VA Zwolle",
    coordinates: { lat: 52.5137755, lng: 6.0954399 },
  },
];

export const POINTS_OF_INTEREST: PointOfInterest[] = RESOLVED_PLACES.map(
  (place) => ({
    ...place,
    distanceKm: haversineKm(place.coordinates, GROTE_MARKT) * STREET_FACTOR,
  }),
);

export function getPointOfInterest(id: string): PointOfInterest | undefined {
  return POINTS_OF_INTEREST.find((point) => point.id === id);
}

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
