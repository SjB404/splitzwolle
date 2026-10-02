/* the routes the filters matched — two per row, because each card carries a description and three actions; plus the empty state and the paging rule (how many is a page lives in data/routes.ts) */

import { AnimatePresence } from "motion/react";
import EmptyState from "../../shared/content/emptyState.tsx";
import ClearFiltersButton from "../../shared/filters/clearFiltersButton.tsx";
import RouteOverviewCard from "./routeOverviewCard.tsx";
import { ROUTE_PAGE_SIZE } from "../../data/routes.ts";
import type { Route } from "../../types.ts";

interface RouteResultsProps {
  routes: Route[];
  /* whether the reader asked for the whole list; the page owns it, because a filter change collapses it again */
  showAll: boolean;
  onShowAll: () => void;
  /* the empty state's way out, which only the page can define */
  onReset: () => void;
  onBuild: (route: Route) => void;
  /* the routes the reader saved, read from the browser by the page and handed down as facts */
  savedIds: string[];
  onToggleSave: (route: Route) => void;
}

export default function RouteResults({
  routes,
  showAll,
  onShowAll,
  onReset,
  onBuild,
  savedIds,
  onToggleSave,
}: RouteResultsProps) {
  if (routes.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="Geen routes gevonden"
        description="Pas de filters aan of zoek op een andere wijk, titel of thema."
        action={<ClearFiltersButton onClick={onReset} className="mt-2" />}
      />
    );
  }

  const visibleRoutes = showAll ? routes : routes.slice(0, ROUTE_PAGE_SIZE);
  const hasMore = routes.length > ROUTE_PAGE_SIZE;

  return (
    <>
      <div className="mt-8 grid gap-5">
        <AnimatePresence initial={false}>
          {visibleRoutes.map((route) => (
            <RouteOverviewCard
              key={route.id}
              route={route}
              onBuild={onBuild}
              saved={savedIds.includes(route.id)}
              onToggleSave={onToggleSave}
            />
          ))}
        </AnimatePresence>
      </div>

      {hasMore && (
        <div className="mt-8 flex flex-wrap items-center justify-center gap-4">
          {!showAll && (
            <button
              type="button"
              onClick={onShowAll}
              className="ripple tap-target"
            >
              Toon meer routes
            </button>
          )}
          <p className="text-sm text-ink-muted">
            {visibleRoutes.length} van {routes.length} routes
          </p>
        </div>
      )}
    </>
  );
}
