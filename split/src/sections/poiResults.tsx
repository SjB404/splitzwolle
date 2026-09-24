/*
poiresults — the grid of places the filters matched.

it owns the band it fills, so the page above stays a list of what is on screen.

two states: the cards, or the empty state (the same EmptyState the route overview
uses, stepped down to an h3 because here it sits under a SectionHeading).

the selection is a prop and not state of its own: the map and the cards must show
the same selection, and only the page can own that.
*/

import EmptyState from "../components/emptyState.tsx";
import ClearFiltersButton from "../components/clearFiltersButton.tsx";
import Container from "../components/container.tsx";
import SectionHeading from "../components/sectionHeading.tsx";
import PoiCard from "./poiCard.tsx";
import type { PointOfInterest } from "../types.ts";

interface PoiResultsProps {
  points: PointOfInterest[];
  /* the page owns the selection: the map above and these cards have to agree, and only
     one place can hold it */
  selectedId: string | null;
  onSelect: (id: string) => void;
  /* the empty state's way out, which only the page can define */
  onReset: () => void;
}

export default function PoiResults({
  points,
  selectedId,
  onSelect,
  onReset,
}: PoiResultsProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="Alle bezienswaardigheden"
          description="Kies een plek om hem op de kaart hierboven te zetten."
        />

        {points.length === 0 ? (
          <EmptyState
            icon="place"
            title="Niets gevonden"
            titleLevel={3}
            description="Pas de filters aan of zoek op een andere naam, wijk of categorie."
            action={<ClearFiltersButton onClick={onReset} className="mt-2" />}
          />
        ) : (
          <div className="mt-10 grid gap-6">
            {points.map((point) => (
              <PoiCard
                key={point.id}
                point={point}
                selected={point.id === selectedId}
                onSelect={onSelect}
              />
            ))}
          </div>
        )}
      </Container>
    </section>
  );
}
