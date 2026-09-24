/*
routeresults — the route cards the filters matched, plus the two states around
them: nothing found, and more found than shown.

it owns the paging rule (how many is a page lives in data/routes.js) and the empty
state, so the filters and the "nothing here" card always agree.

the grid only ever grows downwards, so nothing reflows: new cards fade in and
removed ones fade out. nothing animates on scroll, because content that moves
while you read it is noise. that is why the fade sits on RouteCard.
*/

import EmptyState from "../components/emptyState.tsx";
import ClearFiltersButton from "../components/clearFiltersButton.tsx";
import RouteGrid from "../components/routeGrid.tsx";
import { ROUTE_PAGE_SIZE } from "../data/routes.ts";
import type { Route } from "../types.ts";

interface RouteResultsProps {
  routes: Route[];
  /* whether the reader asked for the whole list. the page owns it, because changing a
     filter collapses it again */
  showAll: boolean;
  onShowAll: () => void;
  /* the empty state's way out, which only the page can define */
  onReset: () => void;
}

export default function RouteResults({
  routes,
  showAll,
  onShowAll,
  onReset,
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
      <RouteGrid routes={visibleRoutes} />

      {hasMore && (
        <div className="mt-10 flex flex-wrap items-center justify-center gap-4">
          {!showAll && (
            <button type="button" onClick={onShowAll} className="ripple">
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
