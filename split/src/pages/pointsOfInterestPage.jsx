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
import MapPanel from "../components/mapPanel.jsx";
import PageHeader from "../components/pageHeader.jsx";
import { PoiOverlay } from "../components/mapArtwork.jsx";
import PoiFilters from "../sections/poiFilters.jsx";
import PoiResults from "../sections/poiResults.jsx";
import { MAP_IMAGES } from "../data/maps.js";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
  hasActivePoiFilters,
} from "../data/pointsOfInterest.js";

export default function PointsOfInterestPage() {
  const [filters, setFilters] = useState(INITIAL_POI_FILTERS);
  const [selectedId, setSelectedId] = useState(null);

  const results = useMemo(() => filterPointsOfInterest(filters), [filters]);
  const selectedPoint = results.find((point) => point.id === selectedId) ?? null;

  function updateFilter(key, value) {
    setFilters((current) => ({ ...current, [key]: value }));
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
        <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
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
        </div>
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
