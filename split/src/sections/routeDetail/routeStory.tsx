/* "Over deze route" — brings its own grid column, and the second paragraph is computed from the route so a hand written summary cannot drift */

import { formatDistance, formatDuration } from "../../format.ts";
import { routePoints } from "../../data/routes.ts";
import type { Route } from "../../types.ts";

interface RouteStoryProps {
  route: Route;
}

export default function RouteStory({ route }: RouteStoryProps) {
  const places = routePoints(route);

  return (
    <div className="s12 l8">
      <h2 className="text-2xl font-bold sm:text-3xl">Over deze route</h2>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        {route.description}
      </p>

      <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
        De route is {formatDistance(route.distanceKm)} lang en duurt ongeveer{" "}
        {formatDuration(route.durationMinutes)}. Onderweg kom je langs{" "}
        {places.length} stopplaatsen, van {places[0]?.name} tot{" "}
        {places[places.length - 1]?.name}.
      </p>
    </div>
  );
}
