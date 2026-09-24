/*
savedroutelist — the "Opgeslagen routes" column: the heading, the count, and the
rows.

the page holds the selection as a set of ids, so this list only renders it. that is
what lets the totals next to it be calculated from the same ids.

the heading is an h2 and the rows are h3s, because the page's h1 comes from
PageHeader. the outline stays in order.
*/

import SavedRouteRow from "./savedRouteRow.jsx";

export default function SavedRouteList({ routes, selectedIds, onToggle }) {
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
