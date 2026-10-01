/* one route in the overview grid — wider than the shared RouteCard, because it carries the description and three
   destinations: the title loads the route into the builder as a custom route, the bookmark saves it, the arrow
   opens its public page */

import { Link } from "react-router-dom";
import { m } from "motion/react";
import Icon from "../../shared/primitives/icon.tsx";
import StarRating from "../../shared/primitives/starRating.tsx";
import MapSnapshot from "../../shared/map/mapSnapshot.tsx";
import RouteShape from "../../shared/map/routeShape.tsx";
import { MOTION_TRANSITION } from "../../motion.ts";
import { routeCoordinates } from "../../data/routes.ts";
import { publicRoutePath } from "../../data/navigation.ts";
import { formatRating } from "../../format.ts";
import type { Route } from "../../types.ts";

interface RouteOverviewCardProps {
  route: Route;
  /* the title hands the route's places to the builder, as a custom route */
  onBuild: (route: Route) => void;
  /* whether this route is one the reader saved; the page owns the store, so the card only shows it */
  saved: boolean;
  onToggleSave: (route: Route) => void;
}

export default function RouteOverviewCard({
  route,
  onBuild,
  saved,
  onToggleSave,
}: RouteOverviewCardProps) {
  return (
    <m.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={MOTION_TRANSITION}
      className="s12 m6 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1"
    >
      {/* the frame keeps a wide card's ratio: a 2-up card is ~760px at 1600, so the 16:10 of the small card would be 475px tall */}
      <div className="relative aspect-[21/9] overflow-hidden surface-container">
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
              <Icon name="local_fire_department" className="mr-1" /> Populair
            </span>
          )}

          {saved && (
            <span className="chip primary text-[11px] font-bold uppercase tracking-wide">
              <Icon name="bookmark" className="mr-1" /> Opgeslagen
            </span>
          )}
        </div>

        <span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">
          {route.area}
        </span>

        <span className="chip surface-container-lowest absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
          {route.theme}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-4">
        {/* one stretched button makes the whole card load the route into the builder; content-[''] matters because BeerCSS's reset clears both pseudo-elements */}
        <h3 className="text-xl font-bold">
          <button
            type="button"
            onClick={() => onBuild(route)}
            className="text-left after:absolute after:inset-0 after:content-['']"
          >
            {route.title}
          </button>
        </h3>

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

          {/* both controls are relative z-10 siblings of the stretched button, never children of it: a control inside a control is not html */}
          <div className="relative z-10 ml-auto flex items-center gap-1">
            <button
              type="button"
              aria-pressed={saved}
              aria-label={
                saved
                  ? `Haal ${route.title} uit je opgeslagen routes`
                  : `Bewaar ${route.title} bij je opgeslagen routes`
              }
              onClick={() => onToggleSave(route)}
              className="button circle transparent ripple tap-target text-ink"
            >
              <Icon name={saved ? "bookmark" : "bookmark_border"} />
            </button>

            <Link
              to={publicRoutePath(route.id)}
              aria-label={`Open de route ${route.title}`}
              className="button circle transparent ripple tap-target text-ink"
            >
              <Icon name="arrow_forward" />
            </Link>
          </div>
        </div>
      </div>
    </m.article>
  );
}
