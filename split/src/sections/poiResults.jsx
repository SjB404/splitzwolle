/*
poiresults — the grid of places the filters matched.

it owns the band it fills, so the page above stays a list of what is on screen.

two states: the cards, or the empty state (the same EmptyState the route overview
uses, stepped down to an h3 because here it sits under a SectionHeading).

the selection is a prop and not state of its own: the map and the cards must show
the same selection, and only the page can own that.
*/

import EmptyState from "../components/emptyState.jsx";
import SectionHeading from "../components/sectionHeading.jsx";
import PoiCard from "./poiCard.jsx";

export default function PoiResults({ points, selectedId, onSelect, onReset }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
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
            action={
              <button
                type="button"
                onClick={onReset}
                className="button border text-ink ripple mt-2"
              >
                Filters wissen
              </button>
            }
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
      </div>
    </section>
  );
}
