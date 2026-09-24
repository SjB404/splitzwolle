/*
pointsofinterestpage — the places worth a detour.

the page owns the two things the sections share: the filter values, and which place
is selected. everything else is a section: PoiFilters on top, the map, then
PoiResults.

selectedPoint is looked up from the filtered list instead of being kept in sync with
it. filter the selected place away and its highlight goes with it, so nothing can
point at a place that is not on screen.
*/

import { useMemo, useState } from "react";
import MapPanel from "../components/mapPanel.tsx";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
import { PoiOverlay } from "../components/mapArtwork.tsx";
import PoiFilters from "../sections/poiFilters.tsx";
import PoiResults from "../sections/poiResults.tsx";
import { MAP_IMAGES } from "../data/maps.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
  hasActivePoiFilters,
} from "../data/pointsOfInterest.ts";
import type { PoiFilterState } from "../types.ts";

export default function PointsOfInterestPage() {
  const [filters, setFilters] = useState(INITIAL_POI_FILTERS);
  /* null means nothing is selected, which is what the map reads to decide whether one
     pin is drawn larger */
  const [selectedId, setSelectedId] = useState<string | null>(null);

  const results = useMemo(() => filterPointsOfInterest(filters), [filters]);
  const selectedPoint = results.find((point) => point.id === selectedId) ?? null;

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

      <section className="py-16 sm:py-20">
        <Container>
          <PoiFilters
            filters={filters}
            matchCount={results.length}
            onFilterChange={updateFilter}
            onReset={hasActivePoiFilters(filters) ? resetFilters : undefined}
          />

          {/* the map shows the current list, so its pins always match the cards below.
              the label names the selected place, or the whole set when nothing is
              selected. */}
          <MapPanel
            className="mt-10"
            image={MAP_IMAGES.terrain}
            alt={`Kaart van Zwolle met ${results.length} bezienswaardigheden`}
            label={selectedPoint ? selectedPoint.name : "Alle bezienswaardigheden"}
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
