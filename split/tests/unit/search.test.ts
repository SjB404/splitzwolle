import { searchIds } from "../../src/data/search.ts";
import searchIndex from "../../src/data/searchIndex.json";
import { ROUTES } from "../../src/data/routes.ts";
import { POINTS_OF_INTEREST } from "../../src/data/pointsOfInterest.ts";
import type { SearchKind, SearchRecord } from "../../src/types.ts";

const INDEX = searchIndex as {
  routes: SearchRecord[];
  pointsOfInterest: SearchRecord[];
};
const KINDS: SearchKind[] = ["route", "poi"];

const recordsOf: Record<SearchKind, SearchRecord[]> = {
  route: INDEX.routes,
  poi: INDEX.pointsOfInterest,
};

const contentIds: Record<SearchKind, string[]> = {
  route: ROUTES.map((route) => route.id),
  poi: POINTS_OF_INTEREST.map((point) => point.id),
};

describe("the index and the content", () => {
  /* two datasets that have to agree: a record whose id is gone is dead weight, and content without a
     record can never be found by the home page's search bars */
  it("describes exactly the routes and the places that exist", () => {
    for (const kind of KINDS) {
      expect
        .soft([...searchIds(kind, "")].sort())
        .toEqual([...contentIds[kind]].sort());
    }
  });

  it("gives every record a title and the words that should find it", () => {
    for (const kind of KINDS) {
      for (const record of recordsOf[kind]) {
        expect.soft(record.title.length).toBeGreaterThan(0);
        expect.soft(record.meta.length).toBeGreaterThan(0);
      }
    }
  });
});

describe("searchIds", () => {
  it("matches every record of the kind when nothing is typed", () => {
    for (const kind of KINDS) {
      expect
        .soft([...searchIds(kind, "")])
        .toEqual(recordsOf[kind].map((record) => record.id));
    }
  });

  it("treats a whitespace-only query as an empty one", () => {
    for (const kind of KINDS) {
      expect
        .soft([...searchIds(kind, "   ")].sort())
        .toEqual([...searchIds(kind, "")].sort());
      expect
        .soft([...searchIds(kind, "\t\n")].sort())
        .toEqual([...searchIds(kind, "")].sort());
    }
  });

  it("finds every record by its own title, however it is typed", () => {
    for (const kind of KINDS) {
      for (const record of recordsOf[kind]) {
        expect.soft(searchIds(kind, record.title).has(record.id)).toBe(true);
        expect
          .soft(searchIds(kind, record.title.toUpperCase()).has(record.id))
          .toBe(true);
        expect
          .soft(searchIds(kind, `  ${record.title}  `).has(record.id))
          .toBe(true);
      }
    }
  });

  it("finds a record by a word from its title", () => {
    for (const kind of KINDS) {
      for (const record of recordsOf[kind]) {
        const word = record.title.split(" ").at(-1)!;

        expect.soft(searchIds(kind, word).has(record.id)).toBe(true);
      }
    }
  });

  it("finds a record by a word from its meta", () => {
    for (const kind of KINDS) {
      for (const record of recordsOf[kind]) {
        const words = record.meta
          .split(" ")
          .map((word) => word.replace(/[·(),]/g, ""))
          .filter((word) => word.length > 3);

        for (const word of words) {
          expect.soft(searchIds(kind, word).has(record.id)).toBe(true);
        }
      }
    }
  });

  it("answers an empty set for a query that matches nothing", () => {
    for (const kind of KINDS) {
      expect.soft(searchIds(kind, "kayakverhuur").size).toBe(0);
    }
  });

  it("searches the kind it was asked for, not the other one", () => {
    /* the two id sets are disjoint, so "only ids of this kind" is the whole claim */
    expect(contentIds.route.some((id) => contentIds.poi.includes(id))).toBe(
      false,
    );

    for (const kind of KINDS) {
      const other: SearchKind = kind === "route" ? "poi" : "route";
      const needle = recordsOf[other][0].title;

      for (const id of searchIds(kind, needle)) {
        expect.soft(contentIds[kind]).toContain(id);
      }
    }
  });

  it("only ever answers ids that the content has", () => {
    for (const kind of KINDS) {
      for (const id of searchIds(kind, "")) {
        expect.soft(contentIds[kind]).toContain(id);
      }
    }
  });
});
