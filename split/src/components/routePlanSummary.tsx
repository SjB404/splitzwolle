/* what the picked places add up to: the stops in visit order, the distance and the duration, and the way out to a real navigation app */
/* the numbers are the directions api's when it answered and our own estimate when it did not — and the last line says which of the two it is */

import Icon from "./icon.tsx";
import { directionsUrl } from "../data/directions.ts";
import { formatDistance, formatDuration } from "../format.ts";
import type { PlannedRoute } from "../data/usePlannedRoute.ts";

interface RoutePlanSummaryProps {
  plan: PlannedRoute;
  onReset: () => void;
}

export default function RoutePlanSummary({
  plan,
  onReset,
}: RoutePlanSummaryProps) {
  if (plan.points.length < 2) {
    return (
      <p className="surface-container-low mt-6 flex items-start gap-2 rounded-box border-2 border-line p-4 text-sm text-ink-muted">
        <Icon name="route" className="text-base" />
        {plan.points.length === 0
          ? "Kies twee of meer plekken om een route te maken."
          : "Kies nog een plek: een route heeft minstens twee stopplaatsen."}
      </p>
    );
  }

  const modeWord = plan.mode === "bicycling" ? "fietsen" : "lopen";

  return (
    <article className="mt-6 p-5">
      <h3 className="text-lg font-bold">
        {plan.points.length} stopplaatsen, {modeWord}
      </h3>

      <ol className="mt-4 flex flex-col gap-2 text-sm">
        {plan.points.map((point, index) => (
          <li key={point.id} className="flex items-center gap-2">
            <span className="flex h-6 w-6 flex-none items-center justify-center rounded-full bg-orange-500 text-[13px] font-bold text-white">
              {index + 1}
            </span>
            <span className="min-w-0 truncate">{point.name}</span>
            <span className="ml-auto flex-none text-xs text-ink-muted">
              {point.era}
            </span>
          </li>
        ))}
      </ol>

      <dl className="mt-4 flex flex-wrap items-center gap-x-8 gap-y-2 border-t-2 border-line rounded-none pt-4">
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
            Afstand
          </dt>
          <dd className="text-lg font-bold">
            {formatDistance(plan.distanceKm)}
          </dd>
        </div>
        <div>
          <dt className="text-xs uppercase tracking-[0.14em] text-ink-muted">
            Duur
          </dt>
          <dd className="text-lg font-bold">
            {formatDuration(plan.durationMinutes)}
          </dd>
        </div>
      </dl>

      {/* which of the two the numbers are: a real street route or a straight-line estimate */}
      <p className="mt-3 text-xs text-ink-muted" aria-live="polite">
        {plan.pending
          ? "De route wordt berekend…"
          : plan.followsStreets
            ? "Via de straten, berekend met de routes van Google Maps."
            : "Hemelsbreed geschat: de route kon niet via de straten berekend worden."}
      </p>

      <div className="mt-4 flex flex-wrap items-center gap-3">
        <a
          href={directionsUrl(
            plan.points.map((point) => point.coordinates),
            plan.mode,
          )}
          target="_blank"
          rel="noreferrer"
          className="button ripple tap-target"
        >
          <Icon name="open_in_new" className="mr-1" />
          Open in Google Maps
        </a>

        <button
          type="button"
          onClick={onReset}
          className="button border text-ink ripple tap-target"
        >
          Selectie wissen
        </button>
      </div>
    </article>
  );
}
