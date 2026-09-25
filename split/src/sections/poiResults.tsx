/* the grid of places the filters matched — it owns its band, and the selection is a prop, because the map above and these cards must agree */

import EmptyState from "../components/emptyState.tsx";
import ClearFiltersButton from "../components/clearFiltersButton.tsx";
import Container from "../components/container.tsx";
import SectionHeading from "../components/sectionHeading.tsx";
import PoiCard from "./poiCard.tsx";
import type { PointOfInterest } from "../types.ts";

interface PoiResultsProps {
  points: PointOfInterest[];
  /* the page owns it: the map above and these cards have to agree */
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
