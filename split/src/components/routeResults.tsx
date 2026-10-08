/* the routes the filters matched — two per row, because each card carries a description and two actions; plus the empty state, the paging rule (how many is a page lives in data/routes.ts) and the notice a save answers with */
/* the card is written out in the map below and not as a component of its own: this list is its only caller */

import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import EmptyState from "./emptyState.tsx";
import ClearFiltersButton from "./clearFiltersButton.tsx";
import Icon from "./icon.tsx";
import StarRating from "./starRating.tsx";
import MapSnapshot from "./mapSnapshot.tsx";
import RouteShape from "./routeShape.tsx";
import { MOTION_TRANSITION } from "../motion.ts";
import { ROUTE_PAGE_SIZE, routeCoordinates } from "../data/routes.ts";
import { publicRoutePath } from "../data/navigation.ts";
import { formatRating } from "../format.ts";
import type { Route } from "../types.ts";

interface RouteResultsProps {
  routes: Route[];
  /* whether the reader asked for the whole list; the page owns it, because a filter change collapses it again */
  showAll: boolean;
  onShowAll: () => void;
  /* the empty state's way out, which only the page can define */
  onReset: () => void;
  /* the routes the reader saved, read from the browser by the page and handed down as facts */
  savedIds: string[];
  onToggleSave: (route: Route) => void;
}

/* how long the saved-route notice stays: long enough to read twice, short enough to ignore */
const NOTICE_MS = 4000;

export default function RouteResults({
  routes,
  showAll,
  onShowAll,
  onReset,
  savedIds,
  onToggleSave,
}: RouteResultsProps) {
  /* the notice the save button answers with, and the one piece of state this list owns */
  const [notice, setNotice] = useState<string | null>(null);

  useEffect(() => {
    if (!notice) return;

    const timer = setTimeout(() => setNotice(null), NOTICE_MS);

    return () => clearTimeout(timer);
  }, [notice]);

  /* the notice lives in a live region that is always in the tree, so a screen reader reads it the moment the text arrives; the pill itself is what animates in and out */
  const noticeElement = (
    <div
      role="status"
      aria-live="polite"
      className="pointer-events-none fixed bottom-6 left-1/2 z-50 -translate-x-1/2"
    >
      <AnimatePresence>
        {notice && (
          <m.p
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            transition={MOTION_TRANSITION}
            className="surface-container-highest min-h-12 content-center rounded-box border-2 border-line px-5 text-sm font-semibold text-ink"
          >
            {notice}
          </m.p>
        )}
      </AnimatePresence>
    </div>
  );

  if (routes.length === 0) {
    return (
      <>
        <EmptyState
          icon="search"
          title="Geen routes gevonden"
          description="Pas de filters aan of zoek op een andere wijk, titel of thema."
          action={<ClearFiltersButton onClick={onReset} className="mt-2" />}
        />
        {noticeElement}
      </>
    );
  }

  const visibleRoutes = showAll ? routes : routes.slice(0, ROUTE_PAGE_SIZE);
  const hasMore = routes.length > ROUTE_PAGE_SIZE;

  return (
    <>
      <div className="mt-8 grid gap-5">
        <AnimatePresence initial={false}>
          {visibleRoutes.map((route) => {
            const saved = savedIds.includes(route.id);

            return (
              <m.article
                key={route.id}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={MOTION_TRANSITION}
                className="s12 m6 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--primary)"
              >
                {/* the frame keeps a wide card's ratio: a 2-up card is ~760px at 1600, so the 16:10 of the small card would be 475px tall; square, so it butts the card body and the panel's own clip draws the top corners (DESIGN.md §5) */}
                <div className="relative aspect-[21/9] overflow-hidden rounded-none surface-container">
                  <MapSnapshot
                    points={routeCoordinates(route)}
                    alt={`Kaart met de route ${route.title}`}
                    className="h-full w-full object-cover"
                    fallback={<RouteShape points={routeCoordinates(route)} />}
                  />

                  {/* the chips stack instead of sharing a corner: a popular route can also be one the reader saved */}
                  <div className="absolute left-4 top-4 flex flex-wrap gap-2">
                    {route.popular && (
                      <span className="chip primary text-[11px] font-bold uppercase tracking-wide">
                        <Icon name="local_fire_department" className="mr-1" />{" "}
                        Populair
                      </span>
                    )}

                    {saved && (
                      <span className="chip primary text-[11px] font-bold uppercase tracking-wide">
                        <Icon name="bookmark" className="mr-1" /> Opgeslagen
                      </span>
                    )}
                  </div>

                  <span className="chip surface-container-lowest absolute bottom-4 right-4 text-[11px] font-semibold">
                    {route.area}
                  </span>

                  <span className="chip surface-container-lowest absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                    {route.theme}
                  </span>

                  {/* the save button rides *on* the card, in the corner the drawn notes live in: the wrapper positions
                      it (a `.tap-target` cannot be absolute itself — its own unlayered `position: relative` wins,
                      the same reason the share button is wrapped), it is a sibling of the card's own link and lifted
                      above it with `z-10`, so a tap saves without opening the route (DESIGN.md §7). A control that is
                      *on* fills with the seed and needs no boundary, which is why `border` is only in the off state */}
                  <div className="absolute right-4 top-4 z-10">
                    <button
                      type="button"
                      aria-pressed={saved}
                      aria-label={
                        saved
                          ? `Haal ${route.title} uit je opgeslagen routes`
                          : `Bewaar ${route.title} bij je opgeslagen routes`
                      }
                      onClick={() => {
                        onToggleSave(route);

                        setNotice(
                          saved
                            ? "Uit je opgeslagen routes gehaald."
                            : "Toegevoegd aan je opgeslagen routes.",
                        );
                      }}
                      className={`button circle ripple tap-target ${
                        saved
                          ? "bg-selected text-on-selected"
                          : "surface-container-lowest border"
                      }`}
                    >
                      <Icon name={saved ? "bookmark" : "bookmark_border"} />
                    </button>
                  </div>
                </div>

                <div className="flex flex-1 flex-col rounded-none p-4">
                  <h3 className="text-xl font-bold">{route.title}</h3>

                  <p className="mt-2 line-clamp-2 text-sm text-ink-muted">
                    {route.description}
                  </p>

                  <div className="mt-3 flex items-center gap-2 border-t-2 border-line rounded-none pt-3">
                    <StarRating value={route.rating} />
                    <span className="text-sm font-semibold text-ink">
                      {formatRating(route.rating)}
                    </span>
                    <span className="text-xs text-ink-muted">
                      ({route.reviews} beoordelingen)
                    </span>
                  </div>
                </div>

                {/* the whole card is the way to the route's own page: an empty link laid over it, last so it
                    paints above the picture and the body, and under the save button's z-10. A stretched
                    `::after` on the title cannot do this — beerCSS's reset makes every element relative, so
                    inset-0 would stop at the heading instead of reaching the card. It stays square (§5) and
                    hands the focus ring to the card, which draws it outside its own clip */}
                <Link
                  to={publicRoutePath(route.id)}
                  aria-label={`Open de route ${route.title}`}
                  className="absolute inset-0 z-0 rounded-none focus-visible:outline-none"
                />
              </m.article>
            );
          })}
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

      {noticeElement}
    </>
  );
}
