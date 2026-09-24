/*
routestory — the "Over deze route" column: the route written out in prose.

it brings its own grid column, so the page above only has to put it in order.

the second paragraph is calculated from the route's own numbers. a hand written
summary would be a second place the distance is stated, and the two would drift
the first time somebody edited a route.
*/

import { formatDistance, formatDuration } from "../format.ts";
import type { Route } from "../types.ts";

interface RouteStoryProps {
  route: Route;
}

export default function RouteStory({ route }: RouteStoryProps) {
  return (
    <div className="s12 l8">
      <h2 className="text-2xl font-bold sm:text-3xl">Over deze route</h2>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        {route.description}
      </p>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        De route is {formatDistance(route.distanceKm)} lang en duurt ongeveer{" "}
        {formatDuration(route.durationMinutes)}. Onderweg kom je langs{" "}
        {route.stops.length} stopplaatsen, van {route.stops[0]} tot{" "}
        {route.stops[route.stops.length - 1]}.
      </p>
    </div>
  );
}
