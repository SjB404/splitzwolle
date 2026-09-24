/*
routespage — the overview: every route, filtered and paged.

the page owns the two things the sections share: the filter values, and whether the
list is expanded. RouteFilters draws the controls, RouteResults draws what is left.
the band around them is the page's, because it holds both.

the filters are state and not url parameters: they are a view of one list, not a
destination, so there is nothing to link to. filterRoutes lives with the data it
filters, in data/routes.js.
*/

import { useMemo, useState } from "react";
import PageHeader from "../components/pageHeader.jsx";
import RouteFilters from "../sections/routeFilters.jsx";
import RouteResults from "../sections/routeResults.jsx";
import {
  INITIAL_ROUTE_FILTERS,
  filterRoutes,
  hasActiveRouteFilters,
} from "../data/routes.js";

export default function RoutesPage() {
  const [filters, setFilters] = useState(INITIAL_ROUTE_FILTERS);
  const [showAll, setShowAll] = useState(false);

  const results = useMemo(() => filterRoutes(filters), [filters]);

  /* changing a filter collapses the list again. leaving "Toon meer" open across a new
     search would open the page on a list nobody asked for. */
  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
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

      <section className="py-16 sm:py-20">
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
          {/* onReset is undefined while nothing is filtered, which is how the panel's
              "Filters wissen" button stays away */}
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
