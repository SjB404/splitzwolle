/* the planner's map — the selected routes over one picture, the count chip, and the legend (decided here, because this is the only overlay that draws a line, a start and an end at once) */

import Icon from "../../shared/primitives/icon.tsx";
import MapLegend from "../../shared/map/mapLegend.tsx";
import type { MapLegendItem } from "../../shared/map/mapLegend.tsx";
import MapPanel from "../../shared/map/mapPanel.tsx";
import { PlanningOverlay } from "../../shared/map/mapArtwork.tsx";
import { MAP_IMAGES } from "../../data/maps.ts";
import type { Route } from "../../types.ts";

/* what the planner's overlay draws, in order; "planner" is in the name because MapLegend is also a component */
const PLANNER_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "start", label: "Startpunt" },
  { shape: "end", label: "Eindpunt" },
];

interface PlanMapProps {
  /* the ticked routes: turning a selection into geometry lives here, not in the page */
  routes: Route[];
  /* the other half of the chip's "2 van 3" */
  totalRouteCount: number;
}

export default function PlanMap({ routes, totalRouteCount }: PlanMapProps) {
  return (
    <>
      <MapPanel
        image={MAP_IMAGES.roads}
        alt={`Kaart van Zwolle met ${routes.length} gekozen routes`}
        label={`${routes.length} van ${totalRouteCount} routes`}
      >
        <PlanningOverlay paths={routes.map((route) => route.path)} />
      </MapPanel>

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
