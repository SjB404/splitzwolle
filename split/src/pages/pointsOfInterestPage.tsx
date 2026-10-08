/* the places worth a detour — the page owns the filter values and which place is selected; everything else is a section */
/* the selection is derived from the filtered list, so filtering a place away cannot leave a highlight pointing off screen */
/* a url's hash picks the place the page opens on (the home tiles link at one card, not at the page) — see navigation.ts */

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

/* what the two eras' dots mean, which is the only thing this map's reader has to know to read it */
const POI_MAP_LEGEND: MapLegendItem[] = [
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

export default function PointsOfInterestPage() {
  const [filters, setFilters] = useState(INITIAL_POI_FILTERS);
  /* the place the url names, which is where the page opens; the fragment also scrolls its card into view by itself (App.tsx) */
  const anchoredId = parsePointOfInterestAnchor(useLocation().hash);
  /* what the reader picked on *this* visit: `null` until they pick, and it never reaches the url, because a url change would send them back to the top of the page — the tile's own link is the shareable form */
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

          {/* the map shows the current list, so its dots match the cards below; the label names the selected place, or the whole set */}
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
        /* the url's card flashes while the selection is still the url's; the moment the reader picks, the selection is theirs and the flash is over */
        flashId={pickedId === null ? anchoredId : null}
        onSelect={setPickedId}
        onReset={resetFilters}
      />
    </>
  );
}
