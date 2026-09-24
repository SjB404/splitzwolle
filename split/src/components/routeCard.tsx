/*
routecard — one route in a grid.

three pages list routes, so the card exists once and every list stays identical.

when the overview grows with "Toon meer routes", a card leaving the page has to stay
in the dom until its fade finishes. that is the one thing css cannot do, so it fades
with m.article. m.* is the light version of motion, which is what the root LazyMotion
expects.
*/

import { Link } from "react-router-dom";
import { m } from "motion/react";
import Icon from "./icon.tsx";
import { MapImage, RouteOverlay } from "./mapArtwork.tsx";
import { MOTION_TRANSITION } from "../motion.ts";
import { MAP_IMAGES } from "../data/maps.ts";
import { ROUTES_PATH } from "../data/navigation.ts";
import { formatDistance, formatDuration, formatRating } from "../format.ts";
import type { Route } from "../types.ts";

interface RouteCardProps {
  /* the card formats the route's own fields itself, so no list has to prepare strings
     for it and the same route cannot read differently in two places */
  route: Route;
}

export default function RouteCard({ route }: RouteCardProps) {
  return (
    <m.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={MOTION_TRANSITION}
      className="s12 m6 l4 xl:col-span-3 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1"
    >
      {/* the frame is a fixed height and the picture is cropped to fill it, so it grows
          with the column on wide screens and keeps most of the map in view */}
      <div className="relative h-52 overflow-hidden surface-container xl:h-64">
        {/* the picture here is decorative, because the card's own title, area and
            distance say everything. object-cover crops it the same way the overlay's
            slice does, so the drawn route lands on the map at every card width. */}
        <MapImage
          image={MAP_IMAGES.roads}
          className="h-full w-full object-cover"
          decorative
        />
        <RouteOverlay path={route.path} />

        {route.popular && (
          <span className="chip primary absolute left-4 top-4 text-[11px] font-bold uppercase tracking-wide">
            <Icon name="local_fire_department" className="mr-1" /> Populair
          </span>
        )}

        <span className="chip surface-container-lowest absolute right-4 top-4 text-[11px] font-semibold">
          {route.area}
        </span>

        <span className="chip surface-container-lowest absolute bottom-4 left-4 text-[10px] font-bold uppercase tracking-[0.14em] text-ink-muted">
          {route.theme}
        </span>
      </div>

      <div className="flex flex-1 flex-col p-5">
        {/* One stretched link makes the whole card clickable — including the
            artwork — without nesting interactive elements. `content-['']` is
            needed because BeerCSS's reset clears both pseudo-elements. */}
        <h3 className="text-xl font-bold">
          <Link
            to={`${ROUTES_PATH}/${route.id}`}
            className="after:absolute after:inset-0 after:content-['']"
          >
            {route.title}
          </Link>
        </h3>

        <p className="mt-2 flex items-center gap-1.5 text-sm text-ink-muted">
          <Icon name="route" className="text-base" />
          {formatDistance(route.distanceKm)} · {formatDuration(route.durationMinutes)}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-line pt-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
            <Icon name="star" className="fill text-base text-accent" />
            {formatRating(route.rating)}
          </span>
          <span className="text-xs text-ink-muted">({route.reviews} beoordelingen)</span>

          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5">
            Bekijk <Icon name="arrow_forward" className="text-base" />
          </span>
        </div>
      </div>
    </m.article>
  );
}
