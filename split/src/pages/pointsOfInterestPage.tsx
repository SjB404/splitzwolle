import { useMemo, useState } from "react";
import { useLocation } from "react-router-dom";
import AreaMap from "../components/areaMap.tsx";
import MapLegend from "../components/mapLegend.tsx";
import type { MapLegendItem } from "../components/mapLegend.tsx";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
import PoiFilters from "../components/poiFilters.tsx";
import PoiResults from "../components/poiResults.tsx";
import { AREA_NAME } from "../data/area.ts";
import { parsePointOfInterestAnchor } from "../data/navigation.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
  hasActivePoiFilters,
} from "../data/pointsOfInterest.ts";
import type { PoiFilterState } from "../types.ts";

const POI_MAP_LEGEND: MapLegendItem[] = [
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

export default function PointsOfInterestPage() {
  const [filters, setFilters] = useState(INITIAL_POI_FILTERS);
  const anchoredId = parsePointOfInterestAnchor(useLocation().hash);
  /* selection stays out of the url; a url change scrolls the page back to top */
  const [pickedId, setPickedId] = useState<string | null>(null);
  const selectedId = pickedId ?? anchoredId;

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

          <AreaMap
            className="mt-10"
            points={results}
            highlightId={selectedId}
            onClickPoint={setPickedId}
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
        /* flash the url's card only while nobody has picked */
        flashId={pickedId === null ? anchoredId : null}
        onSelect={setPickedId}
        onReset={resetFilters}
      />
    </>
  );
}
