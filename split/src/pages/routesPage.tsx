/* the overview: build a route out of the places, or take a ready-made one — the page owns the filters, the picked places, the way of travelling and whether the list is expanded, because its sections share them */
/* the filters are state and not url parameters: they are a view of one list, not a destination */

import { useMemo, useState } from "react";
import { useSearchParams } from "react-router-dom";
import Container from "../shared/layout/container.tsx";
import PageHeader from "../shared/layout/pageHeader.tsx";
import SectionHeading from "../shared/layout/sectionHeading.tsx";
import AreaMap from "../shared/map/areaMap.tsx";
import MapLegend from "../shared/map/mapLegend.tsx";
import type { MapLegendItem } from "../shared/map/mapLegend.tsx";
import { usePlannedRoute } from "../shared/map/usePlannedRoute.ts";
import PoiPicker from "../sections/routes/poiPicker.tsx";
import RouteFilters from "../sections/routes/routeFilters.tsx";
import RoutePlanSummary from "../sections/routes/routePlanSummary.tsx";
import RouteResults from "../sections/routes/routeResults.tsx";
import { AREA_NAME, pointsInArea } from "../data/area.ts";
import {
  POINTS_OF_INTEREST,
  getPointOfInterest,
} from "../data/pointsOfInterest.ts";
import {
  INITIAL_ROUTE_FILTERS,
  filterRoutes,
  hasActiveRouteFilters,
} from "../data/routes.ts";
import type {
  PointOfInterest,
  RouteFilterState,
  TravelMode,
} from "../types.ts";

/* the places a route may use do not depend on a filter: they are the ones inside the covered area (data/area.ts) */
const AREA_POINTS = pointsInArea(POINTS_OF_INTEREST);

/* what the builder's map draws, in the order the legend reads it */
const AREA_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

export default function RoutesPage() {
  const [filters, setFilters] = useState(INITIAL_ROUTE_FILTERS);
  const [showAll, setShowAll] = useState(false);
  /* the ids are the state and the places are looked up, so a picked place can never go stale in the data */
  const [searchParams] = useSearchParams();
  /* places handed over from the places overview arrive in the url (?plek=peperbus), so the link can be shared and the back button works */
  const [pickedIds, setPickedIds] = useState<string[]>(() =>
    searchParams
      .getAll("plek")
      .filter((id) => getPointOfInterest(id) !== undefined),
  );
  const [mode, setMode] = useState<TravelMode>("walking");

  const results = useMemo(() => filterRoutes(filters), [filters]);

  const pickedPoints = useMemo(
    () =>
      pickedIds
        .map((id) => getPointOfInterest(id))
        .filter((point): point is PointOfInterest => point !== undefined),
    [pickedIds],
  );

  const plan = usePlannedRoute(pickedPoints, mode);

  /* the map prints the visit order beside each dot, so the list, the map and the summary read the same */
  const order = useMemo(
    () => new Map(pickedIds.map((id, index) => [id, index + 1])),
    [pickedIds],
  );

  function togglePoint(id: string) {
    setPickedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  function clearPicked() {
    setPickedIds([]);
  }

  /* a filter change collapses the list, so "Toon meer" cannot leave the reader on a list nobody asked for */
  function updateFilter(patch: Partial<RouteFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
    setShowAll(false);
  }

  function resetFilters() {
    setFilters(INITIAL_ROUTE_FILTERS);
    setShowAll(false);
  }

  return (
    <>
      <PageHeader
        eyebrow="Routes"
        title="Stel je route samen"
        description={`Kies de plekken die je wilt zien en zie de route ontstaan, allemaal binnen ${AREA_NAME}. Liever iets kant-en-klaars? Kies dan hieronder een van de routes.`}
      />

      <section className="py-band">
        <Container className="grid gap-y-10 lg:gap-x-20">
          <div className="s12 l5">
            <PoiPicker
              points={AREA_POINTS}
              pickedIds={pickedIds}
              mode={mode}
              onToggle={togglePoint}
              onModeChange={setMode}
              onReset={clearPicked}
            />

            <RoutePlanSummary plan={plan} onReset={clearPicked} />
          </div>

          <div className="s12 l7">
            <AreaMap
              points={AREA_POINTS}
              line={plan}
              order={order}
              onClickPoint={togglePoint}
              clickHint="Klik om deze plek aan je route toe te voegen"
              label={
                pickedIds.length > 0
                  ? `${pickedIds.length} van ${AREA_POINTS.length} plekken`
                  : `${AREA_POINTS.length} plekken in de binnenstad`
              }
              description={`Kaart van ${AREA_NAME} met ${AREA_POINTS.length} plekken. De gekozen plekken en hun volgorde staan in de lijst naast de kaart.`}
            />

            <MapLegend items={AREA_MAP_LEGEND} />
          </div>
        </Container>
      </section>

      <section className="py-band">
        <Container>
          <SectionHeading
            eyebrow="Kant-en-klaar"
            title="Routes door de binnenstad"
            description="Rondjes die anderen al liepen of fietsten, met dezelfde plekken als hierboven."
          />

          <div className="mt-10">
            {/* onReset stays undefined while nothing is filtered, which is how "Filters wissen" stays away */}
            <RouteFilters
              filters={filters}
              matchCount={results.length}
              onFilterChange={updateFilter}
              onReset={
                hasActiveRouteFilters(filters) ? resetFilters : undefined
              }
            />
          </div>

          <RouteResults
            routes={results}
            showAll={showAll}
            onShowAll={() => setShowAll(true)}
            onReset={resetFilters}
          />
        </Container>
      </section>
    </>
  );
}
