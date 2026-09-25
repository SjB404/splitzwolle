/* the card beside a route's map — the page's one filled action, the practical details and the tags, all read from the same route so no figure can get out of step */

import { Link } from "react-router-dom";
import Icon from "../../shared/primitives/icon.tsx";
import { PLANNING_PATH } from "../../data/navigation.ts";
import { ROUTE_THEME_ICONS } from "../../data/routes.ts";
import type { Route } from "../../types.ts";

interface RouteSummaryProps {
  route: Route;
}

export default function RouteSummary({ route }: RouteSummaryProps) {
  return (
    <article className="flex flex-col gap-5 p-5">
      <div>
        <h2 className="text-lg font-bold">Plan deze route</h2>
        <p className="mt-1 text-sm text-ink-muted">
          Voeg de route toe aan je planning en bepaal zelf waar je stopt.
        </p>
      </div>

      <Link to={PLANNING_PATH} className="button ripple">
        <Icon name="route" className="mr-1.5 text-base" />
        Plan deze route
      </Link>

      <dl className="flex flex-col gap-3 border-t border-line rounded-none pt-5 text-sm">
        <div className="flex items-start gap-2">
          <dt className="inline-flex items-center gap-1.5 text-ink-muted">
            <Icon name="place" className="text-base" />
            Startpunt
          </dt>
          <dd className="ml-auto text-right font-semibold text-ink">
            {route.startPoint}
          </dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="inline-flex items-center gap-1.5 text-ink-muted">
            {/* the glyph comes from the data module's theme table, which is typed over every theme — so no fallback is needed here */}
            <Icon name={ROUTE_THEME_ICONS[route.theme]} className="text-base" />
            Type
          </dt>
          <dd className="ml-auto text-right font-semibold text-ink">
            {route.theme}
          </dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="inline-flex items-center gap-1.5 text-ink-muted">
            <Icon name="flag" className="text-base" />
            Stopplaatsen
          </dt>
          <dd className="ml-auto text-right font-semibold text-ink">
            {route.stops.length}
          </dd>
        </div>
      </dl>

      <ul className="flex flex-wrap gap-2 border-t border-line rounded-none pt-5">
        {[route.theme, route.difficulty, route.area].map((tag) => (
          <li key={tag} className="chip">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}
