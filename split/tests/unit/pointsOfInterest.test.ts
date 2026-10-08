import {
  CATEGORIES,
  INITIAL_POI_FILTERS,
  POINTS_OF_INTEREST,
  POI_SORTS,
  filterPointsOfInterest,
  getPointOfInterest,
  hasActivePoiFilters,
  poiCategoryIcon,
} from "../../src/data/pointsOfInterest.ts";
import { haversineKm, STREET_FACTOR } from "../../src/data/routeGeometry.ts";
import { isInArea } from "../../src/data/area.ts";
import type {
  PoiCategoryName,
  PoiFilterState,
  PointOfInterest,
} from "../../src/types.ts";

const GROTE_MARKT = { lat: 52.5122429, lng: 6.0927568 };

function filters(patch: Partial<PoiFilterState> = {}): PoiFilterState {
  return { ...INITIAL_POI_FILTERS, ...patch };
}

const haystack = (point: PointOfInterest) =>
  `${point.name} ${point.area} ${point.category}`.toLowerCase();

const cases = POINTS_OF_INTEREST.map((point) => [point.id, point] as const);
const idOf = (point: PointOfInterest) => point.id;
const dataIds = (predicate: (point: PointOfInterest) => boolean) =>
  POINTS_OF_INTEREST.filter(predicate).map(idOf).sort();

describe("the place data", () => {
  /* this count has to be updated by hand when the dataset changes */
  it("holds the dataset this suite was written against", () => {
    expect(POINTS_OF_INTEREST).toHaveLength(9);
  });

  it("has unique ids", () => {
    expect(new Set(POINTS_OF_INTEREST.map(idOf)).size).toBe(
      POINTS_OF_INTEREST.length,
    );
  });

  it.each(cases)("keeps %s inside the covered area", (_id, point) => {
    expect(isInArea(point.coordinates)).toBe(true);
  });

  it.each(cases)("gives %s the details a card prints", (_id, point) => {
    expect.soft(point.name.length).toBeGreaterThan(0);
    expect.soft(point.description.length).toBeGreaterThan(0);
    expect.soft(point.address.length).toBeGreaterThan(0);
    expect.soft(point.placeId.startsWith("ChIJ")).toBe(true);
    expect.soft(point.rating).toBeGreaterThan(0);
    expect.soft(point.rating).toBeLessThanOrEqual(5);
    expect.soft(point.distanceKm).toBeGreaterThan(0);
    expect.soft(["Toen", "Nu"]).toContain(point.era);
    expect
      .soft(CATEGORIES.map((category) => category.id))
      .toContain(point.category);
  });

  it("spreads the places over every declared category", () => {
    for (const category of CATEGORIES) {
      expect
        .soft(
          POINTS_OF_INTEREST.some((point) => point.category === category.id),
        )
        .toBe(true);
    }
  });

  it("has places on both sides of toen en nu, and no other side", () => {
    const eras = new Set(POINTS_OF_INTEREST.map((point) => point.era));

    expect([...eras].sort()).toEqual(["Nu", "Toen"]);
  });

  it("measures every distance from the Grote Markt, through the street factor", () => {
    for (const point of POINTS_OF_INTEREST) {
      expect
        .soft(point.distanceKm)
        .toBeCloseTo(
          haversineKm(point.coordinates, GROTE_MARKT) * STREET_FACTOR,
          10,
        );
    }
  });
});

describe("poiCategoryIcon", () => {
  it("answers the category's own glyph", () => {
    for (const category of CATEGORIES) {
      expect.soft(poiCategoryIcon(category.id)).toBe(category.icon);
    }
  });

  it("falls back to a pin for a category it does not know", () => {
    expect(poiCategoryIcon("Onbekend" as PoiCategoryName)).toBe("place");
  });
});

describe("getPointOfInterest", () => {
  it("finds every place by its id", () => {
    for (const point of POINTS_OF_INTEREST) {
      expect.soft(getPointOfInterest(point.id)).toBe(point);
    }
  });

  it("answers undefined for an id that is not there", () => {
    expect(getPointOfInterest("kayakverhuur")).toBeUndefined();
  });
});

describe("filterPointsOfInterest", () => {
  it("filters nothing out at rest, sorted by rating", () => {
    const results = filterPointsOfInterest(filters());

    expect(results).toHaveLength(POINTS_OF_INTEREST.length);

    for (let index = 1; index < results.length; index += 1) {
      expect
        .soft(results[index - 1].rating)
        .toBeGreaterThanOrEqual(results[index].rating);
    }
  });

  it("matches the name, the area and the category", () => {
    const example = POINTS_OF_INTEREST[0];

    for (const needle of [example.name, example.area, example.category]) {
      const results = filterPointsOfInterest(filters({ query: needle }));

      expect.soft(results.map(idOf)).toContain(example.id);

      for (const point of POINTS_OF_INTEREST) {
        expect
          .soft(results.includes(point))
          .toBe(haystack(point).includes(needle.toLowerCase()));
      }
    }
  });

  it("ignores case and surrounding spaces", () => {
    const needle = POINTS_OF_INTEREST[0].name.toUpperCase();

    expect(
      filterPointsOfInterest(filters({ query: `  ${needle}  ` }))
        .map(idOf)
        .sort(),
    ).toEqual(
      filterPointsOfInterest(filters({ query: needle }))
        .map(idOf)
        .sort(),
    );
  });

  it("answers nothing for a query that matches nothing", () => {
    expect(filterPointsOfInterest(filters({ query: "kayakverhuur" }))).toEqual(
      [],
    );
  });

  it("narrows to one category", () => {
    for (const category of CATEGORIES) {
      expect
        .soft(
          filterPointsOfInterest(filters({ category: category.id }))
            .map(idOf)
            .sort(),
        )
        .toEqual(dataIds((point) => point.category === category.id));
    }
  });

  it("combines a query with a category", () => {
    const example = POINTS_OF_INTEREST[0];
    const results = filterPointsOfInterest(
      filters({ query: example.name, category: example.category }),
    );

    expect(results.map(idOf)).toEqual([example.id]);
  });

  it("sorts by name with the Dutch collation", () => {
    const results = filterPointsOfInterest(filters({ sort: "name" }));
    const expected = [...POINTS_OF_INTEREST].sort((a, b) =>
      a.name.localeCompare(b.name, "nl"),
    );

    expect(results.map(idOf)).toEqual(expected.map(idOf));
  });

  it("sorts by distance, nearest first", () => {
    const results = filterPointsOfInterest(filters({ sort: "distance" }));

    for (let index = 1; index < results.length; index += 1) {
      expect
        .soft(results[index - 1].distanceKm)
        .toBeLessThanOrEqual(results[index].distanceKm);
    }

    expect(results[0].distanceKm).toBe(
      Math.min(...POINTS_OF_INTEREST.map((point) => point.distanceKm)),
    );
  });

  it("offers the three sorts the select can show", () => {
    expect(POI_SORTS.map((option) => option.value)).toEqual([
      "rating",
      "name",
      "distance",
    ]);
  });
});

describe("hasActivePoiFilters", () => {
  it("is false at rest", () => {
    expect(hasActivePoiFilters(INITIAL_POI_FILTERS)).toBe(false);
  });

  it.each([
    ["query", { query: "kerk" }],
    ["category", { category: "Musea" }],
    ["sort", { sort: "name" }],
  ] as [string, Partial<PoiFilterState>][])(
    "is true when %s leaves its resting value",
    (_name, patch) => {
      expect(hasActivePoiFilters(filters(patch))).toBe(true);
    },
  );
});
