/* one route in a grid — three pages list routes, so the card exists once; it fades with m.article because a card leaving on "Toon meer" must stay in the dom until its fade ends, which css cannot do */

import { Link } from "react-router-dom";
import { m } from "motion/react";
import Icon from "../primitives/icon.tsx";
import { MapImage, RouteOverlay } from "../map/mapArtwork.tsx";
import { MOTION_TRANSITION } from "../../motion.ts";
import { MAP_IMAGES } from "../../data/maps.ts";
import { ROUTES_PATH } from "../../data/navigation.ts";
import { formatDistance, formatDuration, formatRating } from "../../format.ts";
import type { Route } from "../../types.ts";

interface RouteCardProps {
  /* the card formats the route's own fields, so no list has to prepare strings for it */
  route: Route;
  /* false where the section around the card already says the routes are popular */
  showPopular?: boolean;
}

export default function RouteCard({
  route,
  showPopular = true,
}: RouteCardProps) {
  return (
    <m.article
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={MOTION_TRANSITION}
      className="s12 m6 l4 xl:col-span-3 no-padding group relative flex flex-col overflow-hidden transition-transform motion-safe:hover:-translate-y-1"
    >
      {/* the frame takes its height from the column and keeps a map's kind of ratio, so the artwork scales with the card instead of stepping at two widths */}
      <div className="relative aspect-[16/10] overflow-hidden surface-container">
        {/* decorative, because the card's own title, area and distance say everything; object-cover crops exactly like the overlay's slice, so the route lands on the map at every width */}
        <MapImage
          image={MAP_IMAGES.roads}
          className="h-full w-full object-cover"
          decorative
        />
        <RouteOverlay path={route.path} />

        {showPopular && route.popular && (
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
        {/* one stretched link makes the whole card clickable without nesting interactive elements; content-[''] matters because BeerCSS's reset clears both pseudo-elements */}
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
          {formatDistance(route.distanceKm)} ·{" "}
          {formatDuration(route.durationMinutes)}
        </p>

        <div className="mt-4 flex items-center gap-2 border-t border-line rounded-none pt-4">
          <span className="inline-flex items-center gap-1 text-sm font-semibold text-ink">
            <Icon name="star" className="fill text-base text-accent" />
            {formatRating(route.rating)}
          </span>
          <span className="text-xs text-ink-muted">
            ({route.reviews} beoordelingen)
          </span>

          <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent transition-transform group-hover:translate-x-0.5">
            Bekijk <Icon name="arrow_forward" className="text-base" />
          </span>
        </div>
      </div>
    </m.article>
  );
}
