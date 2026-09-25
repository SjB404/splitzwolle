/* the search the home page's section bars run on: the matches come from data/searchIndex.json, which stands in for the collaborator's search endpoint — when the api exists, pointing this module at a fetch is the whole change (DESIGN.md §15) */
/* it answers with ids and not with content, so a caller keeps rendering the objects it already has and the index can be swapped without touching a component */

import searchIndex from "./searchIndex.json";
import type { SearchIndex, SearchKind } from "../types.ts";

const INDEX: SearchIndex = searchIndex;

/** the ids of one kind whose title or meta matches the query; an empty query matches every record */
export function searchIds(kind: SearchKind, query: string): Set<string> {
  const records = kind === "route" ? INDEX.routes : INDEX.pointsOfInterest;
  const needle = query.trim().toLowerCase();

  const matches = needle
    ? records.filter((record) =>
        `${record.title} ${record.meta}`.toLowerCase().includes(needle),
      )
    : records;

  return new Set(matches.map((record) => record.id));
}
