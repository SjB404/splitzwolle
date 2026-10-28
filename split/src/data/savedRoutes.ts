// saved routes only live in localStorage (not tied to the login yet), a window event keeps every card in sync

import { useEffect, useState } from "react";

const STORAGE_KEY = "zwolle-routes:saved";
const CHANGED_EVENT = "zwolle-routes:saved-changed";

// parsed carefully so a half written or weird value can't break the page
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
    // storage can be blocked, the page still works it just forgets
  }

  // the same tab never hears the storage event, so fire one of our own
  window.dispatchEvent(new Event(CHANGED_EVENT));
}

// saves or unsaves the route and returns whether it's saved now
export function toggleSavedRoute(id: string): boolean {
  const saved = readSavedRouteIds();
  const isSaved = saved.includes(id);

  writeSavedRouteIds(
    isSaved ? saved.filter((item) => item !== id) : [id, ...saved],
  );

  return !isSaved;
}

// the saved ids, updates when they change (also from another tab)
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
