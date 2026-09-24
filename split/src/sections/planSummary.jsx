/*
plansummary — the "Routeoverzicht" card: the sum of the ticked routes.

every figure is calculated from the selection instead of being stored, so unticking
a row updates the distance, the duration and the stop count in the same render.

that is also why it takes the routes and not four numbers: adding up a selection is
this card's whole job.

the duration comes from a stated walking pace and not a per route number, so the
total always agrees with the distance printed next to it. if the planner ever learns
about bicycles, PACE_KM_PER_HOUR is the one line to change.
*/

import { Link } from "react-router-dom";
import Icon from "../components/icon.jsx";
import { LOGIN_PATH } from "../data/navigation.js";
import { formatDistance, formatDuration } from "../format.js";

/* the average dutch walking pace, used to turn the selected distance into a duration */
const PACE_KM_PER_HOUR = 4.5;

const PACE_NOTE = `Gerekend met een wandeltempo van ${PACE_KM_PER_HOUR.toFixed(1).replace(".", ",")} km per uur.`;

export default function PlanSummary({ routes }) {
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

      <dl className="mt-4 flex flex-col gap-3 border-t border-line pt-5 text-sm">
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

      {/* the one filled action in this section, and it goes somewhere real: saving a
          plan belongs to an account, and the account screen is the login page.
          nothing is stored yet. */}
      <div className="mt-5 border-t border-line pt-5">
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
