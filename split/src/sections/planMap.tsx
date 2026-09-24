/*
planmap — the planner's map: the selected routes drawn over one picture, the count
that names the drawing, and the legend for its symbols.

the overlay takes one path per selected route, so the same map shows one route or
five without needing a second component. the chip comes from MapPanel and spells
out the same fraction the list beside it shows.

the legend's meaning is decided here, because this is the only overlay that draws a
line, a start and an end at once. a single route needs no key.
*/

import Icon from "../components/icon.tsx";
import MapLegend from "../components/mapLegend.tsx";
import type { MapLegendItem } from "../components/mapLegend.tsx";
import MapPanel from "../components/mapPanel.tsx";
import { PlanningOverlay } from "../components/mapArtwork.tsx";
import { MAP_IMAGES } from "../data/maps.ts";
import type { Route } from "../types.ts";

/* the three things the planner's overlay draws, in the order they appear. "planner" is
   in the name because the map legend is also a component. */
const PLANNER_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "start", label: "Startpunt" },
  { shape: "end", label: "Eindpunt" },
];

interface PlanMapProps {
  /* the routes the reader ticked. the overlay takes paths and not routes, so the one
     line that turns a selection into geometry lives here and not in the page above */
  routes: Route[];
  /* how many are on offer, which is the other half of the chip's "2 van 3" */
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

      {/* an empty map is a dead end, so an empty selection says what to do instead of
          leaving the reader to guess */}
      {routes.length === 0 && (
        <p className="mt-6 flex items-center gap-2 text-sm text-ink-muted">
          <Icon name="check_circle" className="text-base" />
          Kies links minimaal één route om de kaart te vullen.
        </p>
      )}
    </>
  );
}
