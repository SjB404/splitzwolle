/*
routestops — the numbered "Onderweg" list of stops on a route.

the numbers are position, not identity: they follow the route's own order. the list
is keyed by the stop's name, because the same stop cannot appear twice on one route
and an index key would redo every row if the order changed.

the round number uses the primary colour, the same role the map pins use, so a
numbered stop and a pin read as the same kind of thing.
*/

import Icon from "../components/icon.tsx";
import type { Route } from "../types.ts";

interface RouteStopsProps {
  route: Route;
}

export default function RouteStops({ route }: RouteStopsProps) {
  return (
    <aside className="s12 l4">
      <article className="p-5">
        <h3 className="inline-flex items-center gap-2 text-lg font-bold">
          <Icon name="place" className="text-base text-accent" />
          Onderweg
        </h3>

        <ol className="mt-4 flex flex-col gap-3 text-sm">
          {route.stops.map((stop, index) => (
            <li key={stop} className="flex items-start gap-3">
              <span className="primary flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold">
                {index + 1}
              </span>
              <span className="text-ink">{stop}</span>
            </li>
          ))}
        </ol>
      </article>
    </aside>
  );
}
