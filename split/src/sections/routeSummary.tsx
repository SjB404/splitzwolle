/*
routesummary — the card beside a route's map: the one filled action on the page,
the practical details, and the tags.

it reads the same route the map and the story read, so "Stopplaatsen" here is the
length of the list printed under "Onderweg". there is no second copy of that
number to get out of step.

the action is a Link and not a button, because planning is a page. a link dressed
as a button needs beerCSS's .button class, or it has no box.
*/

import { Link } from "react-router-dom";
import Icon from "../components/icon.tsx";
import { PLANNING_PATH } from "../data/navigation.ts";
import { ROUTE_THEME_ICONS } from "../data/routes.ts";
import type { Route } from "../types.ts";

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

      <dl className="flex flex-col gap-3 border-t border-line pt-5 text-sm">
        <div className="flex items-start gap-2">
          <dt className="inline-flex items-center gap-1.5 text-ink-muted">
            <Icon name="place" className="text-base" />
            Startpunt
          </dt>
          <dd className="ml-auto text-right font-semibold text-ink">{route.startPoint}</dd>
        </div>
        <div className="flex items-start gap-2">
          <dt className="inline-flex items-center gap-1.5 text-ink-muted">
            {/* the glyph comes from the data module's theme table. that table is typed
                over every theme, so a new theme cannot be listed without an icon and
                no fallback is needed here. */}
            <Icon name={ROUTE_THEME_ICONS[route.theme]} className="text-base" />
            Type
          </dt>
          <dd className="ml-auto text-right font-semibold text-ink">{route.theme}</dd>
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

      <ul className="flex flex-wrap gap-2 border-t border-line pt-5">
        {[route.theme, route.difficulty, route.area].map((tag) => (
          <li key={tag} className="chip">
            {tag}
          </li>
        ))}
      </ul>
    </article>
  );
}
