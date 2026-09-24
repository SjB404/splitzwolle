/*
routeresults — the route cards the filters matched, plus the two states around
them: nothing found, and more found than shown.

it owns the paging rule (how many is a page lives in data/routes.js) and the empty
state, so the filters and the "nothing here" card always agree.

the grid only ever grows downwards, so nothing reflows: new cards fade in and
removed ones fade out. nothing animates on scroll, because content that moves
while you read it is noise. that is why the fade sits on RouteCard.
*/

import { AnimatePresence } from "motion/react";
import EmptyState from "../components/emptyState.jsx";
import RouteCard from "../components/routeCard.jsx";
import { ROUTE_PAGE_SIZE } from "../data/routes.js";

export default function RouteResults({ routes, showAll, onShowAll, onReset }) {
  if (routes.length === 0) {
    return (
      <EmptyState
        icon="search"
        title="Geen routes gevonden"
        description="Pas de filters aan of zoek op een andere wijk, titel of thema."
        action={
          <button
            type="button"
            onClick={onReset}
            className="button border text-ink ripple mt-2"
          >
            Filters wissen
          </button>
        }
      />
    );
  }

  const visibleRoutes = showAll ? routes : routes.slice(0, ROUTE_PAGE_SIZE);
  const hasMore = routes.length > ROUTE_PAGE_SIZE;

  return (
    <>
      <div className="mt-10 grid gap-6">
        <AnimatePresence initial={false}>
          {visibleRoutes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </AnimatePresence>
      </div>

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
