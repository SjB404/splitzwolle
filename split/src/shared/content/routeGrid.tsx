/* the grid route cards are listed in — grid and AnimatePresence together, so the overview's fade in/out cannot drift from the two preview strips */

import { AnimatePresence } from "motion/react";
import RouteCard from "./routeCard.tsx";
import type { Route } from "../../types.ts";

interface RouteGridProps {
  /** the routes to draw, in the caller's order */
  routes: Route[];
}

export default function RouteGrid({ routes }: RouteGridProps) {
  return (
    <div className="mt-10 grid gap-6">
      <AnimatePresence initial={false}>
        {routes.map((route) => (
          <RouteCard key={route.id} route={route} />
        ))}
      </AnimatePresence>
    </div>
  );
}
