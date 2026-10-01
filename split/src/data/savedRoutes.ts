/* the routes this reader saved — there is no account yet, so the browser is the store (see docs/BACKEND.md).
   One window event keeps every card, the filter and the count in step without a state library */

import { useEffect, useState } from "react";

const STORAGE_KEY = "zwolle-routes:saved";
const CHANGED_EVENT = "zwolle-routes:saved-changed";

/** the ids in local storage, read defensively: a half-written or foreign value must never break the page */
export function readSavedRouteIds(): string[] {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const value: unknown = raw === null ? [] : JSON.parse(raw);

    return Array.isArray(value)
      ? value.filter((id): id is string => typeof id === "string")
      : [];
  } catch {
    return [];
  }
}

function writeSavedRouteIds(ids: string[]) {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(ids));
  } catch {
    /* a browser with storage switched off still gets a working page, it just forgets */
  }

  /* the same tab does not hear the storage event, so it fires its own */
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

/** toggles one route and answers whether it is saved now */
export function toggleSavedRoute(id: string): boolean {
  const saved = readSavedRouteIds();
  const isSaved = saved.includes(id);

  writeSavedRouteIds(
    isSaved ? saved.filter((item) => item !== id) : [id, ...saved],
  );

  return !isSaved;
}

/** clears every saved route, for a reader who wants the list back to nothing */
export function clearSavedRoutes() {
  writeSavedRouteIds([]);
}

/** the saved ids as React state, kept in step with the rest of the page and with other tabs */
export function useSavedRouteIds(): string[] {
  const [ids, setIds] = useState(readSavedRouteIds);

  useEffect(() => {
    const sync = () => setIds(readSavedRouteIds());

    window.addEventListener(CHANGED_EVENT, sync);
    window.addEventListener("storage", sync);

    return () => {
      window.removeEventListener(CHANGED_EVENT, sync);
      window.removeEventListener("storage", sync);
    };
  }, []);

  return ids;
}
