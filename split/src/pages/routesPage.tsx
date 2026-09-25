/* the overview: every route, filtered and paged — the page owns the filter values and whether the list is expanded, because both sections share them */
/* the filters are state and not url parameters: they are a view of one list, not a destination */

import { useMemo, useState } from "react";
import PageHeader from "../shared/layout/pageHeader.tsx";
import RouteFilters from "../sections/routes/routeFilters.tsx";
import RouteResults from "../sections/routes/routeResults.tsx";
import {
  INITIAL_ROUTE_FILTERS,
  filterRoutes,
  hasActiveRouteFilters,
} from "../data/routes.ts";
import type { RouteFilterState } from "../types.ts";

export default function RoutesPage() {
  const [filters, setFilters] = useState(INITIAL_ROUTE_FILTERS);
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => filterRoutes(filters), [filters]);

  /* a filter change collapses the list, so "Toon meer" cannot leave the reader on a list nobody asked for */
  function updateFilter(patch: Partial<RouteFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
    setShowAll(false);
  }

  function resetFilters() {
    setFilters(INITIAL_ROUTE_FILTERS);
    setShowAll(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Routes"
        title="Alle routes in Zwolle"
        description="Blader door alle wandel- en fietsroutes van Zwolle en omstreken. Filter op thema, afstand of moeilijkheid en bekijk de route die bij je past."
      />

      <section className="py-band">
        <div className="mx-auto max-w-[100rem] px-gutter">
          {/* onReset stays undefined while nothing is filtered, which is how "Filters wissen" stays away */}
          <RouteFilters
            filters={filters}
            matchCount={results.length}
            onFilterChange={updateFilter}
            onReset={hasActiveRouteFilters(filters) ? resetFilters : undefined}
          />

          <RouteResults
            routes={results}
            showAll={showAll}
            onShowAll={() => setShowAll(true)}
            onReset={resetFilters}
          />
        </div>
      </section>
    </>
  );
}
