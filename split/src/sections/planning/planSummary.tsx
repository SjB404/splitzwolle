/* the "Routeoverzicht" card — everything is calculated from the ticked routes in the same render, which is why it takes the routes and not four numbers */
/* the duration comes from a stated pace, so the total always agrees with the distance beside it; a bicycle mode would change PACE_KM_PER_HOUR only */

import { Link } from "react-router-dom";
import Icon from "../../shared/primitives/icon.tsx";
import { LOGIN_PATH } from "../../data/navigation.ts";
import { formatDecimal, formatDistance, formatDuration } from "../../format.ts";
import type { Route } from "../../types.ts";

/* the average dutch walking pace, used to turn the selected distance into a duration */
const PACE_KM_PER_HOUR = 4.5;

const PACE_NOTE = `Gerekend met een wandeltempo van ${formatDecimal(PACE_KM_PER_HOUR)} km per uur.`;

interface PlanSummaryProps {
  routes: Route[];
}

export default function PlanSummary({ routes }: PlanSummaryProps) {
  const totalDistanceKm = routes.reduce(
    (sum, route) => sum + route.distanceKm,
    0,
  );
  const totalMinutes = Math.round((totalDistanceKm / PACE_KM_PER_HOUR) * 60);
  const totalStops = routes.reduce((sum, route) => sum + route.stops.length, 0);

  return (
    <article className="mt-6 p-5">
      <h2 className="text-lg font-bold">Routeoverzicht</h2>
      <p className="mt-1 text-sm text-ink-muted">
        De som van de routes die je hebt aangevinkt.
      </p>

      <dl className="mt-4 flex flex-col gap-3 border-t border-line rounded-none pt-5 text-sm">
        <div className="flex items-center gap-2">
          <dt className="text-ink-muted">Routes</dt>
          <dd className="ml-auto font-semibold text-ink">{routes.length}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-ink-muted">Stopplaatsen</dt>
          <dd className="ml-auto font-semibold text-ink">{totalStops}</dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-ink-muted">Totale afstand</dt>
          <dd className="ml-auto font-semibold text-ink">
            {formatDistance(totalDistanceKm)}
          </dd>
        </div>
        <div className="flex items-center gap-2">
          <dt className="text-ink-muted">Verwachte duur</dt>
          <dd className="ml-auto font-semibold text-ink">
            {formatDuration(totalMinutes)}
          </dd>
        </div>
      </dl>

      <p className="mt-4 text-xs text-ink-muted">{PACE_NOTE}</p>

      {/* the section's one filled action, and it goes somewhere real: saving a plan belongs to an account, and nothing is stored yet */}
      <div className="mt-5 border-t border-line rounded-none pt-5">
        <Link to={LOGIN_PATH} className="button ripple">
          <Icon name="check_circle" className="mr-1.5 text-base" />
          Route opslaan
        </Link>
        <p className="mt-3 text-xs text-ink-muted">
          Opslaan en delen horen bij je account.
        </p>
      </div>
    </article>
  );
}
