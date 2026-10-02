/* the home page's strip of the route overview — its own search bar and the cards that matched; how many routes a preview holds lives in data/routes.ts */
/* the matches come from the search index (data/search.ts) and not from the data module, so this strip is already wired the way the api will be */
/* the cards are written out here and not as a component of their own: this strip is the only caller, and it never shows the "Populair" tag — the section title already says it */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import EmptyState from "./emptyState.tsx";
import SectionHeading from "./sectionHeading.tsx";
import SectionSearchBar from "./sectionSearchBar.tsx";
import Container from "./container.tsx";
import Icon from "./icon.tsx";
import MapSnapshot from "./mapSnapshot.tsx";
import RouteShape from "./routeShape.tsx";
import { MOTION_TRANSITION } from "../motion.ts";
import { ROUTES_PATH, publicRoutePath } from "../data/navigation.ts";
import {
  ROUTES,
  ROUTE_PREVIEW_COUNT,
  routeCoordinates,
} from "../data/routes.ts";
import { searchIds } from "../data/search.ts";
import { formatDistance, formatDuration, formatRating } from "../format.ts";

export default function PopularRoutesPreview() {
  const [query, setQuery] = useState("");

  /* the search answers with ids, so the strip keeps rendering the routes the rest of the app renders */
  const matches = useMemo(() => {
    const ids = searchIds("route", query);
    return ROUTES.filter((route) => ids.has(route.id));
  }, [query]);

  return (
    /* content-visibility keeps this band, which sits under the fold, out of the first paint and out of every resize until it is scrolled to; the intrinsic size is the band's own measured height, so the scrollbar does not move when it is rendered */
    <section className="py-band [contain-intrinsic-size:auto_48rem] [content-visibility:auto]">
      <Container>
        <SectionHeading
          title="Populaire routes"
          description="De hoogst gewaardeerde routes van deze maand, gekozen door de community."
        />

        <SectionSearchBar
          id="home-route-search"
          label="Zoek in de populaire routes"
          placeholder="Zoek op titel, wijk of thema…"
          value={query}
          onChange={setQuery}
          resultLabel={`${matches.length} ${
            matches.length === 1 ? "route" : "routes"
          }`}
          action={
            /* a link dressed as a button needs .button (a bare <a> has no button box), and border defaults to primary text — 2.5:1 on white — so the ink comes from the theme; h-12 is the field's own 48px, so the action sits in the row at the field's height instead of 8px short of it (§7) */
            <Link to={ROUTES_PATH} className="button border text-ink ripple h-12">
              Alle routes bekijken
            </Link>
          }
        />

        {matches.length === 0 ? (
          <EmptyState
            icon="search"
            title="Geen routes gevonden"
            titleLevel={3}
            description="Zoek op een andere wijk, titel of thema, of bekijk alle routes."
          />
        ) : (
          /* a preview keeps showing a strip of what matched; grid and AnimatePresence together, so a card leaving on a search stays in the dom until its fade ends, which css cannot do */
          <div className="mt-10 grid gap-6">
            <AnimatePresence initial={false}>
              {matches.slice(0, ROUTE_PREVIEW_COUNT).map((route) => (
                <m.article
                  key={route.id}
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  transition={MOTION_TRANSITION}
                  className="s12 m6 l4 xl:col-span-3 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1"
                >
                  {/* the frame takes its height from the column and keeps a map's kind of ratio, so the preview scales with the card instead of stepping at two widths */}
                  <div className="relative aspect-[16/10] overflow-hidden surface-container">
                    {/* the route's own shape, drawn from the places it visits; a real map picture takes its place when the static map service is switched on */}
                    <MapSnapshot
                      points={routeCoordinates(route)}
                      alt={`Kaart met de route ${route.title}`}
                      className="h-full w-full object-cover"
                      fallback={<RouteShape points={routeCoordinates(route)} />}
                    />

                    <span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">
                      {route.area}
                    </span>

                    <span className="chip surface-container-lowest absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                      {route.theme}
                    </span>
                  </div>

                  <div className="flex flex-1 flex-col p-5">
                    {/* one stretched link makes the whole card clickable without nesting interactive elements; content-[''] matters because BeerCSS's reset clears both pseudo-elements */}
                    <h3 className="text-xl font-bold">
                      <Link
                        to={publicRoutePath(route.id)}
                        className="after:absolute after:inset-0 after:content-['']"
                      >
                        {route.title}
                      </Link>
                    </h3>

                    <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
                      <Icon name="route" className="text-base" />
                      {formatDistance(route.distanceKm)} ·{" "}
                      {formatDuration(route.durationMinutes)}
                    </p>

                    <div className="mt-4 flex items-center gap-2 border-t-2 border-line rounded-none pt-4">
                      <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
                        <Icon
                          name="star"
                          className="fill text-base text-accent"
                        />
                        {formatRating(route.rating)}
                      </span>
                      <span className="text-xs text-ink-muted">
                        ({route.reviews} beoordelingen)
                      </span>

                      <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5">
                        Bekijk{" "}
                        <Icon name="arrow_forward" className="text-base" />
                      </span>
                    </div>
                  </div>
                </m.article>
              ))}
            </AnimatePresence>
          </div>
        )}
      </Container>
    </section>
  );
}
