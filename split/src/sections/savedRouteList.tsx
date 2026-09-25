/* "Opgeslagen routes" column — renders the page's selection; the heading is an h2 and the rows are h3s because the page's h1 comes from PageHeader */

import SavedRouteRow from "./savedRouteRow.tsx";
import type { Route } from "../types.ts";

interface SavedRouteListProps {
  routes: Route[];
  /* the ticked ids, owned by the page: the totals beside this list use the same ids */
  selectedIds: string[];
  onToggle: (id: string) => void;
}

export default function SavedRouteList({
  routes,
  selectedIds,
  onToggle,
}: SavedRouteListProps) {
  const selectedCount = routes.filter((route) =>
    selectedIds.includes(route.id),
  ).length;

  return (
    <>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold sm:text-3xl">Opgeslagen routes</h2>
          <p className="mt-2 text-[15px] text-ink-muted">
            Vink de routes aan die je in je planning wilt opnemen.
          </p>
        </div>

        <p className="text-sm text-ink-muted">
          {selectedCount} van {routes.length}
        </p>
      </div>

      <ul className="mt-6 flex flex-col gap-3">
        {routes.map((route) => (
          <li key={route.id}>
            <SavedRouteRow
              route={route}
              selected={selectedIds.includes(route.id)}
              onToggle={onToggle}
            />
          </li>
        ))}
      </ul>
    </>
  );
}
