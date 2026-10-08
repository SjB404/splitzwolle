/* searchIndex.json stands in for the collaborator's endpoint; swap this for a fetch later */

import searchIndex from "./searchIndex.json";
import type { SearchIndex, SearchKind } from "../types.ts";

const INDEX: SearchIndex = searchIndex;

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
