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

  const matches = useMemo(() => {
    const ids = searchIds("route", query);
    return ROUTES.filter((route) => ids.has(route.id));
  }, [query]);

  return (
    /* content-visibility:auto keeps this band out of the first paint; 48rem is its measured height */
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
            /* bare <a> needs .button; .border's default text is 2.5:1 on white, so text-ink fixes it */
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
          <div className="mt-10 grid gap-6">
            <AnimatePresence initial={false}>
              {matches.slice(0, ROUTE_PREVIEW_COUNT).map((route) => {
                const coords = routeCoordinates(route);

                return (
                  <m.article
                    key={route.id}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={MOTION_TRANSITION}
                    className="s12 m6 l4 xl:col-span-3 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1 has-[:focus-visible]:outline-2 has-[:focus-visible]:outline-offset-2 has-[:focus-visible]:outline-(--primary)"
                  >
                    <div className="relative aspect-[16/10] overflow-hidden rounded-none surface-container">
                      <MapSnapshot
                        points={coords}
                        alt={`Kaart met de route ${route.title}`}
                        className="h-full w-full object-cover"
                        fallback={<RouteShape points={coords} />}
                      />

                      <span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">
                        {route.area}
                      </span>

                      <span className="chip surface-container-lowest absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
                        {route.theme}
                      </span>
                    </div>

                    <div className="flex flex-1 flex-col rounded-none p-5">
                      <h3 className="text-xl font-bold">{route.title}</h3>

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

                    {/* overlay link: a stretched ::after fails because beerCSS's reset makes every element relative */}
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
        )}
      </Container>
    </section>
  );
}
