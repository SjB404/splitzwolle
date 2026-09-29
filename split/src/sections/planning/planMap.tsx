/* the planner's map — the places of every ticked route, on the shared interactive map; this file is only what tells the map what the plan is */

import { useMemo } from "react";
import AreaMap from "../../shared/map/areaMap.tsx";
import MapLegend from "../../shared/map/mapLegend.tsx";
import type { MapLegendItem } from "../../shared/map/mapLegend.tsx";
import { usePlannedRoute } from "../../shared/map/usePlannedRoute.ts";
import { AREA_NAME } from "../../data/area.ts";
import { routePoints } from "../../data/routes.ts";
import Icon from "../../shared/primitives/icon.tsx";
import type { PointOfInterest, Route } from "../../types.ts";

/* what this map draws, in order; the planner is a walking plan, so there is no bicycle dot to explain */
const PLANNER_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

interface PlanMapProps {
  /* the ticked routes: turning a selection into places lives here, not in the page */
  routes: Route[];
  /* the other half of the chip's "2 van 3" */
  totalRouteCount: number;
}

export default function PlanMap({ routes, totalRouteCount }: PlanMapProps) {
  /* every place of every ticked route, once: two routes that both visit the Peperbus should not pin it twice */
  const places = useMemo(() => {
    const seen = new Set<string>();
    const unique: PointOfInterest[] = [];

    for (const route of routes) {
      for (const point of routePoints(route)) {
        if (seen.has(point.id)) continue;
        seen.add(point.id);
        unique.push(point);
      }
    }

    return unique;
  }, [routes]);

  /* the line through the plan's places, in the order the plan lists them */
  const plan = usePlannedRoute(places, "walking");
  const order = useMemo(
    () => new Map(places.map((point, index) => [point.id, index + 1])),
    [places],
  );

  return (
    <>
      <AreaMap
        points={places}
        line={plan}
        order={order}
        clickHint="Klik om deze plek te kiezen"
        label={`${routes.length} van ${totalRouteCount} routes`}
        description={`Kaart van ${AREA_NAME} met de plekken van ${routes.length} gekozen routes; dezelfde plekken staan in de lijst ernaast.`}
      />

      <MapLegend items={PLANNER_MAP_LEGEND} />

      {/* an empty map is a dead end, so say what to do instead */}
      {routes.length === 0 && (
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Icon name="check_circle" className="text-base" />
          Kies links minimaal één route om de kaart te vullen.
        </p>
      )}
    </>
  );
}
