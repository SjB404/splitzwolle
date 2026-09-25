/* the places the home page previews and the overview lists — positions are in 0-100 space and were placed by hand, so they are approximate until there is real geodata; distanceKm is the walk from the Grote Markt, which the overview sorts on */
/* placeholder content for the collaborator's api, same as the routes */

import type {
  PoiCategory,
  PoiCategoryName,
  PoiFilterState,
  PoiSort,
  PointOfInterest,
  SelectOption,
} from "../types.ts";

export const POI_CATEGORIES: PoiCategory[] = [
  { id: "Monumenten", icon: "account_balance" },
  { id: "Musea", icon: "museum" },
  { id: "Parken", icon: "park" },
  { id: "Culinair", icon: "restaurant" },
];

/** the glyph for a category, used by chips and cards. falls back to a pin. */
export function poiCategoryIcon(category: PoiCategoryName): string {
  return POI_CATEGORIES.find((item) => item.id === category)?.icon ?? "place";
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

export const POINTS_OF_INTEREST: PointOfInterest[] = [
  {
    id: "peperbus",
    name: "Peperbus",
    category: "Monumenten",
    area: "Binnenstad",
    description:
      "De 75 meter hoge toren van de basiliek, al eeuwen het herkenningspunt van de stad.",
    rating: 4.8,
    reviews: 312,
    distanceKm: 1.2,
    position: [62.5, 50.5],
  },
  {
    id: "sassenpoort",
    name: "Sassenpoort",
    category: "Monumenten",
    area: "Binnenstad",
    description:
      "De middeleeuwse stadspoort uit 1409, het best bewaarde stukje stadsmuur van Zwolle.",
    rating: 4.9,
    reviews: 487,
    distanceKm: 0.9,
    position: [55.1, 25.3],
  },
  {
    id: "grote-of-sint-michaelskerk",
    name: "Grote of Sint-Michaëlskerk",
    category: "Monumenten",
    area: "Binnenstad",
    description:
      "De gotische kerk aan de Grote Markt, met het beroemde orgel waarop Mozart speelde.",
    rating: 4.7,
    reviews: 254,
    distanceKm: 1.4,
    position: [61, 55.5],
  },
  {
    id: "museum-de-fundatie",
    name: "Museum de Fundatie",
    category: "Musea",
    area: "Binnenstad",
    description:
      "Beeldende kunst in een paleis met een opvallende ei-vormige aanbouw op het dak.",
    rating: 4.6,
    reviews: 398,
    distanceKm: 1.8,
    position: [71.6, 49.1],
  },
  {
    id: "stedelijk-museum-zwolle",
    name: "Stedelijk Museum Zwolle",
    category: "Musea",
    area: "Binnenstad",
    description:
      "De geschiedenis van Zwolle in één gebouw: van de Hanze tot het heden.",
    rating: 4.5,
    reviews: 176,
    distanceKm: 1.1,
    position: [57.5, 43],
  },
  {
    id: "bonami-spelcomputer-museum",
    name: "Bonami SpelComputer Museum",
    category: "Musea",
    area: "Assendorp",
    description:
      "Duizenden computerspellen en consoles, van de eerste Pong tot nu — en je mag alles spelen.",
    rating: 4.4,
    reviews: 231,
    distanceKm: 4.2,
    position: [72, 72],
  },
  {
    id: "het-engelse-werk",
    name: "Het Engelse Werk",
    category: "Parken",
    area: "Westenholte",
    description:
      "Een negentiende-eeuws landschapspark aan de IJssel, met oude lanen en een theekoepel.",
    rating: 4.7,
    reviews: 145,
    distanceKm: 2.6,
    position: [16, 70],
  },
  {
    id: "park-de-wezenlanden",
    name: "Park de Wezenlanden",
    category: "Parken",
    area: "Wezenlanden",
    description:
      "Het grote stadspark met de vijver, de speeltuin en het beste hardlooprondje van de stad.",
    rating: 4.6,
    reviews: 208,
    distanceKm: 1.9,
    position: [44, 78],
  },
  {
    id: "rijsterborgherpark",
    name: "Rijsterborgherpark",
    category: "Parken",
    area: "Centrum",
    description:
      "Het oudste park van Zwolle, een rustige groene long vlak bij het station.",
    rating: 4.5,
    reviews: 96,
    distanceKm: 1.3,
    position: [30, 20],
  },
  {
    id: "restaurant-de-librije",
    name: "Restaurant De Librije",
    category: "Culinair",
    area: "Binnenstad",
    description:
      "Het beroemdste restaurant van de stad, gevestigd in een oude gevangenis aan de Spinhuisplein.",
    rating: 4.9,
    reviews: 512,
    distanceKm: 1.6,
    position: [25.4, 43],
  },
  {
    id: "ijsselkade",
    name: "IJsselkade",
    category: "Culinair",
    area: "Binnenstad",
    description:
      "Langs het water eet je hier met uitzicht op de schepen en de IJsselbrug.",
    rating: 4.6,
    reviews: 187,
    distanceKm: 2.1,
    position: [40, 58],
  },
  {
    id: "melkmarkt",
    name: "Melkmarkt",
    category: "Culinair",
    area: "Binnenstad",
    description:
      "Het gezelligste plein van de binnenstad, vol terrassen en kleine lunchzaken.",
    rating: 4.4,
    reviews: 264,
    distanceKm: 1,
    position: [56.5, 47],
  },
];

/** the overview's filter + sort logic, next to the data it works on */
export function filterPointsOfInterest(
  filters: PoiFilterState,
): PointOfInterest[] {
  const needle = filters.query.trim().toLowerCase();

  const matches = POINTS_OF_INTEREST.filter((point) => {
    if (filters.category !== "all" && point.category !== filters.category)
      return false;
    if (
      needle &&
      !`${point.name} ${point.area} ${point.category}`
        .toLowerCase()
        .includes(needle)
    ) {
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
