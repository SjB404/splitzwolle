import { useMemo, useRef, useState } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import AreaMap from "../components/areaMap.tsx";
import MapLegend from "../components/mapLegend.tsx";
import type { MapLegendItem } from "../components/mapLegend.tsx";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
import PoiFilters from "../components/poiFilters.tsx";
import PoiResults from "../components/poiResults.tsx";
import { AREA_NAME } from "../data/area.ts";
import {
  parsePointOfInterestAnchor,
  pointOfInterestAnchor,
} from "../data/navigation.ts";
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
  const navigate = useNavigate();
  const mapRef = useRef<HTMLDivElement | null>(null);
  const [filters, setFilters] = useState(INITIAL_POI_FILTERS);
  // the picked place lives in the url (#poi-<id>) so a link can open the map on it
  const selectedId = parsePointOfInterestAnchor(useLocation().hash);

  const results = useMemo(() => filterPointsOfInterest(filters), [filters]);
  const selectedPoint =
    results.find((point) => point.id === selectedId) ?? null;

  // replace so picking places doesn't fill up the back button, and no scroll so the map stays put
  function select(id: string | null) {
    navigate(
      { hash: id ? pointOfInterestAnchor(id) : "" },
      { replace: true, state: { scroll: false } },
    );
  }

  // the list buttons also scroll up to the map, since that's where the card opens
  function showOnMap(id: string) {
    select(id);
    mapRef.current?.scrollIntoView({ behavior: "smooth" });
  }

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

          {/* gets the picked place's anchor as its id, so a #poi-<id> link from another page lands here */}
          <div
            ref={mapRef}
            id={selectedId ? pointOfInterestAnchor(selectedId) : undefined}
            className="mt-10 scroll-mt-24"
          >
            <AreaMap
              points={results}
              highlightId={selectedId}
              onClickPoint={(id) => select(id === selectedId ? null : id)}
              onDeselect={() => select(null)}
              clickHint="Klik om deze plek te kiezen"
              label={
                selectedPoint ? selectedPoint.name : "Alle bezienswaardigheden"
              }
              description={`Kaart van ${AREA_NAME} met ${results.length} bezienswaardigheden; dezelfde plekken staan in de lijst eronder.`}
            />
          </div>

          <MapLegend items={POI_MAP_LEGEND} />
        </Container>
      </section>

      <PoiResults
        points={results}
        selectedId={selectedId}
        onShowOnMap={showOnMap}
        onReset={resetFilters}
      />
    </>
  );
}
