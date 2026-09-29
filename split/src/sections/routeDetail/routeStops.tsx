/* the numbered "Onderweg" list — every stop is a place, so a row can carry its own glyph and the era it belongs to */
/* keyed by place id (a place cannot repeat in one route), and the round number uses the primary role the map pins use */

import Icon from "../../shared/primitives/icon.tsx";
import { poiCategoryIcon } from "../../data/pointsOfInterest.ts";
import { routePoints } from "../../data/routes.ts";
import type { Route } from "../../types.ts";

interface RouteStopsProps {
  route: Route;
}

export default function RouteStops({ route }: RouteStopsProps) {
  const places = routePoints(route);

  return (
    <aside className="s12 l4">
      <article className="p-5">
        <h3 className="inline-flex items-center gap-2 text-lg font-bold">
          <Icon name="place" className="text-base text-accent" />
          Onderweg
        </h3>

        <ol className="mt-4 flex flex-col gap-3 text-sm">
          {places.map((point, index) => (
            <li key={point.id} className="flex items-start gap-3">
              <span className="primary flex h-6 w-6 flex-none items-center justify-center rounded-full text-[11px] font-bold">
                {index + 1}
              </span>

              <span className="min-w-0">
                <span className="block text-ink">{point.name}</span>
                <span className="mt-0.5 flex items-center gap-1 text-xs text-ink-muted">
                  <Icon
                    name={poiCategoryIcon(point.category)}
                    className="text-base"
                  />
                  {point.category} · {point.era}
                </span>
              </span>
            </li>
          ))}
        </ol>
      </article>
    </aside>
  );
}
