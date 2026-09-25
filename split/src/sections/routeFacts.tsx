/* the row of figures under a route's map — every number goes through the shared formatters, so a route cannot read differently on two pages */

import { formatDistance, formatDuration } from "../format.ts";
import type { Route } from "../types.ts";

interface RouteFactsProps {
  route: Route;
}

interface RouteFact {
  label: string;
  value: string;
}

export default function RouteFacts({ route }: RouteFactsProps) {
  const facts: RouteFact[] = [
    { label: "Afstand", value: formatDistance(route.distanceKm) },
    { label: "Duur", value: formatDuration(route.durationMinutes) },
    { label: "Moeilijkheid", value: route.difficulty },
    { label: "Hoogteverschil", value: `${route.elevation} m` },
  ];

  return (
    <dl className="mt-6 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
      {facts.map(({ label, value }) => (
        <div key={label}>
          <dt className="text-xs uppercase tracking-wider text-ink-muted">
            {label}
          </dt>
          <dd className="font-display mt-1 text-xl font-bold text-heading">
            {value}
          </dd>
        </div>
      ))}
    </dl>
  );
}
