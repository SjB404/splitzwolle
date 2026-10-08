/* no account yet, so localStorage is the store; one window event keeps every card in step */

import { useEffect, useState } from "react";

const STORAGE_KEY = "zwolle-routes:saved";
const CHANGED_EVENT = "zwolle-routes:saved-changed";

/* defensive parse: a half-written or foreign value must not break the page */
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
    /* storage can be blocked; the page still works, it just forgets */
  }

  /* the same tab never hears the storage event, so fire one of our own */
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

export function toggleSavedRoute(id: string): boolean {
  const saved = readSavedRouteIds();
  const isSaved = saved.includes(id);

  writeSavedRouteIds(
    isSaved ? saved.filter((item) => item !== id) : [id, ...saved],
  );

  return !isSaved;
}

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
