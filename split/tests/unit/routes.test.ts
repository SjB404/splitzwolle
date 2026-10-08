import {
  INITIAL_ROUTE_FILTERS,
  ROUTES,
  ROUTE_DIFFICULTIES,
  ROUTE_PAGE_SIZE,
  ROUTE_PREVIEW_COUNT,
  ROUTE_REVIEWS,
  ROUTE_THEMES,
  buildReviewBreakdown,
  filterRoutes,
  getRelatedRoutes,
  hasActiveRouteFilters,
  routeCoordinates,
  routePoints,
} from "../../src/data/routes.ts";
import { AREA_BOUNDS } from "../../src/data/area.ts";
import { getPointOfInterest } from "../../src/data/pointsOfInterest.ts";
import type { Route, RouteFilterState } from "../../src/types.ts";

function filters(patch: Partial<RouteFilterState> = {}): RouteFilterState {
  return { ...INITIAL_ROUTE_FILTERS, ...patch };
}

const haystack = (route: Route) =>
  [
    route.title,
    route.area,
    route.theme,
    ...routePoints(route).map((point) => point.name),
  ]
    .join(" ")
    .toLowerCase();

const ids = (routes: Route[]) => routes.map((route) => route.id).sort();
const dataIds = (predicate: (route: Route) => boolean) =>
  ids(ROUTES.filter(predicate));
const cases = ROUTES.map((route) => [route.id, route] as const);

const withTwin = ROUTES.find((route) =>
  ROUTES.some((other) => other.id !== route.id && other.theme === route.theme),
);
const alone = ROUTES.find(
  (route) =>
    !ROUTES.some(
      (other) => other.id !== route.id && other.theme === route.theme,
    ),
);

describe("the route data", () => {
  /* this count has to be updated by hand when the dataset changes */
  it("holds the dataset this suite was written against", () => {
    expect(ROUTES).toHaveLength(8);
  });

  it("has unique ids", () => {
    expect(new Set(ROUTES.map((route) => route.id)).size).toBe(ROUTES.length);
  });

  it.each(cases)("builds %s out of places that all resolve", (_id, route) => {
    expect(route.poiIds.length).toBeGreaterThanOrEqual(2);
    expect(routePoints(route)).toHaveLength(route.poiIds.length);

    for (const point of routePoints(route)) {
      expect
        .soft(point.coordinates.lat)
        .toBeGreaterThanOrEqual(AREA_BOUNDS.south);
      expect.soft(point.coordinates.lat).toBeLessThanOrEqual(AREA_BOUNDS.north);
      expect
        .soft(point.coordinates.lng)
        .toBeGreaterThanOrEqual(AREA_BOUNDS.west);
      expect.soft(point.coordinates.lng).toBeLessThanOrEqual(AREA_BOUNDS.east);
    }
  });

  it.each(cases)(
    "gives %s a shape the cards and the filters can work with",
    (_id, route) => {
      expect.soft(route.title.length).toBeGreaterThan(0);
      expect.soft(route.description.length).toBeGreaterThan(0);
      expect.soft(ROUTE_THEMES).toContain(route.theme);
      expect.soft(ROUTE_DIFFICULTIES).toContain(route.difficulty);
      expect.soft(route.distanceKm).toBeGreaterThan(0);
      expect.soft(route.durationMinutes).toBeGreaterThan(0);
      expect.soft(route.rating).toBeGreaterThan(0);
      expect.soft(route.rating).toBeLessThanOrEqual(5);
      expect.soft(Number.isInteger(route.reviews)).toBe(true);
      expect.soft(typeof route.popular).toBe("boolean");
    },
  );

  it("uses every declared theme at least once, and no other one", () => {
    expect([...new Set(ROUTES.map((route) => route.theme))].sort()).toEqual(
      [...ROUTE_THEMES].sort(),
    );
  });

  it("keeps the preview shorter than a page of results", () => {
    expect(ROUTE_PAGE_SIZE).toBe(6);
    expect(ROUTE_PREVIEW_COUNT).toBeLessThan(ROUTE_PAGE_SIZE);
  });
});

describe("routePoints and routeCoordinates", () => {
  it("follows the visit order", () => {
    for (const route of ROUTES) {
      expect
        .soft(routePoints(route).map((point) => point.id))
        .toEqual(route.poiIds);
    }
  });

  it("drops an id that is not in the data instead of throwing", () => {
    const known = ROUTES[0].poiIds[0];
    const broken: Route = { ...ROUTES[0], poiIds: [known, "niet-bestaand"] };

    expect(routePoints(broken).map((point) => point.id)).toEqual([known]);
  });

  it("answers the coordinates of those same places", () => {
    for (const route of ROUTES) {
      expect
        .soft(routeCoordinates(route))
        .toEqual(routePoints(route).map((point) => point.coordinates));
    }
  });

  it("only points at places that exist", () => {
    for (const route of ROUTES) {
      for (const id of route.poiIds) {
        expect.soft(getPointOfInterest(id)).toBeDefined();
      }
    }
  });
});

describe("filterRoutes", () => {
  it("filters nothing out at rest", () => {
    expect(filterRoutes(filters())).toHaveLength(ROUTES.length);
  });

  it("counts the title, the area and the theme as searchable text", () => {
    const example = ROUTES[0];

    for (const needle of [example.title, example.area, example.theme]) {
      const results = filterRoutes(filters({ query: needle }));

      expect.soft(ids(results)).toContain(example.id);

      for (const route of ROUTES) {
        expect
          .soft(results.includes(route))
          .toBe(haystack(route).includes(needle.toLowerCase()));
      }
    }
  });

  it("counts a route's places as searchable text", () => {
    const place = routePoints(ROUTES[0])[0];
    const results = filterRoutes(filters({ query: place.name }));

    expect(ids(results)).toContain(ROUTES[0].id);

    for (const route of ROUTES) {
      expect
        .soft(results.includes(route))
        .toBe(haystack(route).includes(place.name.toLowerCase()));
    }
  });

  it("ignores case and surrounding spaces", () => {
    const needle = ROUTES[0].title.toUpperCase();

    expect(ids(filterRoutes(filters({ query: `  ${needle}  ` })))).toEqual(
      ids(filterRoutes(filters({ query: needle }))),
    );
  });

  it("answers nothing for a query that matches nothing", () => {
    expect(filterRoutes(filters({ query: "kayakverhuur" }))).toEqual([]);
  });

  it("narrows to the popular routes", () => {
    expect(ids(filterRoutes(filters({ popularity: "popular" })))).toEqual(
      dataIds((route) => route.popular),
    );
  });

  it("splits the distances into three buckets that partition the list", () => {
    const short = filterRoutes(filters({ distance: "short" }));
    const medium = filterRoutes(filters({ distance: "medium" }));
    const long = filterRoutes(filters({ distance: "long" }));

    /* the boundaries the buckets are documented with */
    expect(short.every((route) => route.distanceKm < 1.5)).toBe(true);
    expect(
      medium.every(
        (route) => route.distanceKm >= 1.5 && route.distanceKm <= 2.5,
      ),
    ).toBe(true);
    expect(long.every((route) => route.distanceKm > 2.5)).toBe(true);

    expect(short.length + medium.length + long.length).toBe(ROUTES.length);
    expect(ids([...short, ...medium, ...long])).toEqual(ids(ROUTES));
  });

  it("narrows per theme and per difficulty", () => {
    for (const theme of ROUTE_THEMES) {
      expect
        .soft(ids(filterRoutes(filters({ theme }))))
        .toEqual(dataIds((route) => route.theme === theme));
    }

    for (const difficulty of ROUTE_DIFFICULTIES) {
      expect
        .soft(ids(filterRoutes(filters({ difficulty }))))
        .toEqual(dataIds((route) => route.difficulty === difficulty));
    }
  });

  it("combines facets with and", () => {
    const example = ROUTES[0];

    expect(
      ids(
        filterRoutes(
          filters({ theme: example.theme, difficulty: example.difficulty }),
        ),
      ),
    ).toEqual(
      dataIds(
        (route) =>
          route.theme === example.theme &&
          route.difficulty === example.difficulty,
      ),
    );
    expect(
      ids(
        filterRoutes(filters({ theme: example.theme, popularity: "popular" })),
      ),
    ).toEqual(
      dataIds((route) => route.theme === example.theme && route.popular),
    );
  });

  it("narrows further with every facet that is added", () => {
    const example = ROUTES[0];
    const resting = filterRoutes(filters());
    const withTheme = filterRoutes(filters({ theme: example.theme }));
    const withBoth = filterRoutes(
      filters({ theme: example.theme, difficulty: example.difficulty }),
    );

    expect(withTheme.length).toBeLessThanOrEqual(resting.length);
    expect(withBoth.length).toBeLessThanOrEqual(withTheme.length);
    expect(ids(withBoth)).toEqual(
      dataIds(
        (route) =>
          route.theme === example.theme &&
          route.difficulty === example.difficulty,
      ),
    );
  });
});

describe("hasActiveRouteFilters", () => {
  it("is false at rest", () => {
    expect(hasActiveRouteFilters(INITIAL_ROUTE_FILTERS)).toBe(false);
  });

  it.each([
    ["query", { query: "singel" }],
    ["popularity", { popularity: "popular" }],
    ["distance", { distance: "short" }],
    ["theme", { theme: "Wandel" }],
    ["difficulty", { difficulty: "Makkelijk" }],
  ] as [string, Partial<RouteFilterState>][])(
    "is true when %s leaves its resting value",
    (_name, patch) => {
      expect(hasActiveRouteFilters(filters(patch))).toBe(true);
    },
  );
});

describe("getRelatedRoutes", () => {
  it("never lists the route itself, and never lists one twice", () => {
    for (const route of ROUTES) {
      const related = getRelatedRoutes(route);

      expect.soft(related).toHaveLength(Math.min(3, ROUTES.length - 1));
      expect.soft(ids(related)).not.toContain(route.id);
      expect.soft(new Set(ids(related)).size).toBe(related.length);
    }
  });

  it.skipIf(!withTwin)("puts the routes of the same theme first", () => {
    const related = getRelatedRoutes(withTwin!, ROUTES.length);
    const sameTheme = related.map(
      (candidate) => candidate.theme === withTwin!.theme,
    );

    expect(related[0].theme).toBe(withTwin!.theme);
    expect(sameTheme.indexOf(false)).toBeGreaterThan(
      sameTheme.lastIndexOf(true),
    );
  });

  it.skipIf(!alone)(
    "starts with the best rated route when no other route shares the theme",
    () => {
      const related = getRelatedRoutes(alone!, ROUTES.length);

      expect(related[0].theme).not.toBe(alone!.theme);
      expect(related[0].rating).toBeGreaterThanOrEqual(related[1].rating);
    },
  );

  it("orders the rest by rating", () => {
    const route = ROUTES[0];
    const rest = getRelatedRoutes(route, ROUTES.length).filter(
      (candidate) => candidate.theme !== route.theme,
    );

    for (let index = 1; index < rest.length; index += 1) {
      expect
        .soft(rest[index - 1].rating)
        .toBeGreaterThanOrEqual(rest[index].rating);
    }
  });
});

describe("buildReviewBreakdown", () => {
  it("answers five buckets, five stars down to one", () => {
    for (const total of [0, 1, 42, 203, 1000]) {
      expect
        .soft(buildReviewBreakdown(total).map((bucket) => bucket.stars))
        .toEqual([5, 4, 3, 2, 1]);
    }
  });

  it("makes the bars add up to the route's own review total", () => {
    for (const total of [0, 1, 2, 5, 13, 42, 76, 123, 203, 1000]) {
      const sum = buildReviewBreakdown(total).reduce(
        (count, bucket) => count + bucket.count,
        0,
      );
      expect.soft(sum).toBe(total);
    }
  });

  it("puts the biggest share on five stars, and never a negative bar", () => {
    for (const total of [1, 42, 123, 203, 1000]) {
      const buckets = buildReviewBreakdown(total);

      expect.soft(buckets[0].count).toBeGreaterThanOrEqual(buckets[1].count);
      expect.soft(buckets[0].count / total).toBeGreaterThan(0.5);
      expect.soft(buckets.every((bucket) => bucket.count >= 0)).toBe(true);
    }
  });

  it("spreads the total over the documented distribution", () => {
    const total = 203;
    const buckets = buildReviewBreakdown(total);

    expect(buckets[0].count).toBe(Math.round(total * 0.71));
    expect(buckets[1].count).toBe(Math.round(total * 0.19));
    expect(buckets[2].count).toBe(Math.round(total * 0.06));
  });
});

describe("the reviews the detail page shows", () => {
  it("gives every written review the fields a card prints", () => {
    expect(ROUTE_REVIEWS.length).toBeGreaterThan(0);

    for (const review of ROUTE_REVIEWS) {
      expect.soft(review.author.length).toBeGreaterThan(0);
      expect.soft(review.text.length).toBeGreaterThan(0);
      expect.soft(review.date.length).toBeGreaterThan(0);
      expect.soft(review.initials.length).toBeGreaterThan(0);
      expect.soft(review.rating).toBeGreaterThan(0);
      expect.soft(review.rating).toBeLessThanOrEqual(5);
    }
  });
});
