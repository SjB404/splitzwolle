/* one selectable route in the planner's list; the row keeps its hairline in both states and only changes its fill, so ticking a box never shifts the rows around it */
/* beerCSS's checkbox: the empty span is the glyph's hook, and the input's aria-label names the route instead of repeating "checkbox" */

import { Link } from "react-router-dom";
import Icon from "../components/icon.tsx";
import { ROUTES_PATH } from "../data/navigation.ts";
import { formatDistance, formatDuration } from "../format.ts";
import type { Route } from "../types.ts";

interface SavedRouteRowProps {
  route: Route;
  /* whether this route is in the plan */
  selected: boolean;
  onToggle: (id: string) => void;
}

export default function SavedRouteRow({
  route,
  selected,
  onToggle,
}: SavedRouteRowProps) {
  return (
    <article
      className={`flex items-start gap-3 border p-4 transition-colors ${
        selected ? "secondary-container" : ""
      }`}
    >
      <label className="checkbox flex-none">
        <input
          type="checkbox"
          checked={selected}
          onChange={() => onToggle(route.id)}
          aria-label={`${route.title} opnemen in de planning`}
        />
        <span aria-hidden="true" />
      </label>

      <div className="min-w-0 flex-1">
        <h3 className="text-base font-bold">{route.title}</h3>

        <p className="mt-2 flex flex-wrap items-center gap-x-4 gap-y-1 text-xs text-ink-muted">
          <span className="inline-flex items-center gap-1">
            <Icon name="route" className="text-base" />
            {formatDistance(route.distanceKm)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="schedule" className="text-base" />
            {formatDuration(route.durationMinutes)}
          </span>
          <span className="inline-flex items-center gap-1">
            <Icon name="place" className="text-base" />
            {route.area}
          </span>
        </p>
      </div>

      <Link
        to={`${ROUTES_PATH}/${route.id}`}
        className="inline-flex flex-none items-center gap-1 text-sm font-semibold text-accent transition-transform hover:translate-x-0.5"
      >
        Bekijk <Icon name="arrow_forward" className="text-base" />
      </Link>
    </article>
  );
}
