/* the places worth a detour — the page owns the filter values and which place is selected; everything else is a section */
/* the selection is derived from the filtered list, so filtering a place away cannot leave a highlight pointing off screen */

import { useMemo, useState } from "react";
import MapPanel from "../shared/map/mapPanel.tsx";
import PageHeader from "../shared/layout/pageHeader.tsx";
import Container from "../shared/layout/container.tsx";
import { PoiOverlay } from "../shared/map/mapArtwork.tsx";
import PoiFilters from "../sections/pointsOfInterest/poiFilters.tsx";
import PoiResults from "../sections/pointsOfInterest/poiResults.tsx";
import { MAP_IMAGES } from "../data/maps.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
  hasActivePoiFilters,
} from "../data/pointsOfInterest.ts";
import type { PoiFilterState } from "../types.ts";

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
      <PageHeader
        eyebrow="Points of Interest"
        title="Bezienswaardigheden in Zwolle"
        description="Van middeleeuwse poorten tot de beste lunchplekken van de stad. Filter op categorie en zet een plek op de kaart."
      />

      <section className="py-band">
        <Container>
          <PoiFilters
            filters={filters}
            matchCount={results.length}
            onFilterChange={updateFilter}
            onReset={hasActivePoiFilters(filters) ? resetFilters : undefined}
          />

          {/* the map shows the current list, so its pins match the cards below; the label names the selected place, or the whole set */}
          <MapPanel
            className="mt-10"
            image={MAP_IMAGES.terrain}
            alt={`Kaart van Zwolle met ${results.length} bezienswaardigheden`}
            label={
              selectedPoint ? selectedPoint.name : "Alle bezienswaardigheden"
            }
          >
            <PoiOverlay points={results} selectedId={selectedId} />
          </MapPanel>
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
