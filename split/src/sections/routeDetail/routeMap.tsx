/* the route on the map — the shared interactive map, told which places this route visits and in what order */
/* the route's own theme decides the way of travelling, so a fiets route is drawn with the cycling profile */

import { useMemo } from "react";
import AreaMap from "../../shared/map/areaMap.tsx";
import MapLegend from "../../shared/map/mapLegend.tsx";
import type { MapLegendItem } from "../../shared/map/mapLegend.tsx";
import { usePlannedRoute } from "../../shared/map/usePlannedRoute.ts";
import { AREA_NAME } from "../../data/area.ts";
import { routePoints } from "../../data/routes.ts";
import type { Route } from "../../types.ts";

const ROUTE_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

interface RouteMapProps {
  route: Route;
}

export default function RouteMap({ route }: RouteMapProps) {
  const places = useMemo(() => routePoints(route), [route]);
  const plan = usePlannedRoute(
    places,
    route.theme === "Fiets" ? "bicycling" : "walking",
  );
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
        label={route.title}
        description={`Kaart van ${AREA_NAME} met de ${places.length} plekken van de route ${route.title}; ze staan ook in de lijst onderaan deze pagina.`}
      />

      <MapLegend items={ROUTE_MAP_LEGEND} />
    </>
  );
}
