/*
routegrid — the grid route cards are listed in.

three places list routes: the home page's preview, the overview and the related strip on
a route's own page. they have to stay identical, so the grid and the fade that belongs
to it live together here instead of being retyped.

the fade is AnimatePresence. it is what lets the overview's "Toon meer routes" fade a
card in and a new filter fade one out, and it is why a card can leave the page: only a
component that stays mounted until its exit finishes can do that, and css cannot.

the two preview strips never change once they are on screen, so for them it does
nothing. initial={false} keeps a first render — a page load — from animating every card
at once.
*/

import { AnimatePresence } from "motion/react";
import RouteCard from "./routeCard.tsx";
import type { Route } from "../types.ts";

interface RouteGridProps {
  /** the routes to draw, in the order the caller decided on */
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
