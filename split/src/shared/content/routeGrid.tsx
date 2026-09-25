/* the grid route cards are listed in — grid and AnimatePresence together, so the overview's fade in/out cannot drift from the two preview strips */

import { AnimatePresence } from "motion/react";
import RouteCard from "./routeCard.tsx";
import type { Route } from "../../types.ts";

interface RouteGridProps {
  /** the routes to draw, in the caller's order */
  routes: Route[];
  /** false where the section around the grid already says the routes are popular (the home preview) */
  showPopular?: boolean;
}

export default function RouteGrid({
  routes,
  showPopular = true,
}: RouteGridProps) {
  return (
    <div className="mt-10 grid gap-6">
      <AnimatePresence initial={false}>
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} showPopular={showPopular} />
        ))}
      </AnimatePresence>
    </div>
  );
}
