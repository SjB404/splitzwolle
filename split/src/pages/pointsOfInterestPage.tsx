/* the places worth a detour — the page owns the filter values and which place is selected; everything else is a section */
/* the selection is derived from the filtered list, so filtering a place away cannot leave a highlight pointing off screen */

import { useMemo, useState } from "react";
import AreaMap from "../shared/map/areaMap.tsx";
import MapLegend from "../shared/map/mapLegend.tsx";
import type { MapLegendItem } from "../shared/map/mapLegend.tsx";
import PageHeader from "../shared/layout/pageHeader.tsx";
import Container from "../shared/layout/container.tsx";
import PoiFilters from "../sections/pointsOfInterest/poiFilters.tsx";
import PoiResults from "../sections/pointsOfInterest/poiResults.tsx";
import { AREA_NAME } from "../data/area.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
  hasActivePoiFilters,
} from "../data/pointsOfInterest.ts";
import type { PoiFilterState } from "../types.ts";

/* what the two eras' dots mean, which is the only thing this map's reader has to know to read it */
const POI_MAP_LEGEND: MapLegendItem[] = [
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

export default function PointsOfInterestPage() {
  const [filters, setFilters] = useState(INITIAL_POI_FILTERS);
  /* null means nothing is selected, which the map reads to enlarge one pin */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => filterPointsOfInterest(filters), [filters]);
  const selectedPoint =
    results.find((point) => point.id === selectedId) ?? null;

  function updateFilter(patch: Partial<PoiFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
  }

  function resetFilters() {
    setFilters(INITIAL_POI_FILTERS);
  }

  return (
    <>
      <PageHeader title="Bezienswaardigheden in Zwolle" />

      <section className="py-band">
        <Container>
          <PoiFilters
            filters={filters}
            matchCount={results.length}
            onFilterChange={updateFilter}
            onReset={hasActivePoiFilters(filters) ? resetFilters : undefined}
          />

          {/* the map shows the current list, so its dots match the cards below; the label names the selected place, or the whole set */}
          <AreaMap
            className="mt-10"
            points={results}
            highlightId={selectedId}
            onClickPoint={setSelectedId}
            clickHint="Klik om deze plek te kiezen"
            label={
              selectedPoint ? selectedPoint.name : "Alle bezienswaardigheden"
            }
            description={`Kaart van ${AREA_NAME} met ${results.length} bezienswaardigheden; dezelfde plekken staan in de lijst eronder.`}
          />

          <MapLegend items={POI_MAP_LEGEND} />
        </Container>
      </section>

      <PoiResults
        points={results}
        selectedId={selectedId}
        onSelect={setSelectedId}
        onReset={resetFilters}
      />
    </>
  );
}
