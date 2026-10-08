/* the grid of places the filters matched — it owns its band, and the selection is a prop, because the map above and these cards must agree */
/* the card is written out in the map below and not as a component of its own: this grid is the only caller */

import { Link } from "react-router-dom";
import EmptyState from "./emptyState.tsx";
import ClearFiltersButton from "./clearFiltersButton.tsx";
import Container from "./container.tsx";
import SectionHeading from "./sectionHeading.tsx";
import Icon from "./icon.tsx";
import { formatDistance, formatRating } from "../format.ts";
import {
  builderPath,
  pointOfInterestAnchor,
} from "../data/navigation.ts";
import { poiCategoryIcon } from "../data/pointsOfInterest.ts";
import { PLACE_IMAGES } from "../data/placeImages.ts";
import type { PointOfInterest } from "../types.ts";

interface PoiResultsProps {
  points: PointOfInterest[];
  /* the page owns it: the map above and these cards have to agree */
  selectedId: string | null;
  /* the place a url named, while nobody has picked on this page: that card flashes its own edge instead of wearing the tone — the tone is the page's own background colour, so it is what a reader's *pick* reads as, not where a link landed them (DESIGN.md §10) */
  flashId: string | null;
  onSelect: (id: string) => void;
  /* the empty state's way out, which only the page can define */
  onReset: () => void;
}

export default function PoiResults({
  points,
  selectedId,
  flashId,
  onSelect,
  onReset,
}: PoiResultsProps) {
  return (
    <section className="py-band">
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
            {points.map((point) => {
              const selected = point.id === selectedId;
              const flashing = point.id === flashId;
              const image = point.image ?? PLACE_IMAGES[point.id];

              return (
                <article
                  key={point.id}
                  /* the id a place's url names, so the home tiles can land on this card; scroll-mt clears the sticky bar the way an anchored section does (index.css) */
                  id={pointOfInterestAnchor(point.id)}
                  /* the tone is the reader's own pick; a card the url named lights its edge instead, and the outline it animates is transparent at rest, so a card that is not flashing is untouched. colour-only feedback, so never `motion-safe:` — the reduced-motion block re-applies the keyframe rather than dropping it (index.css, DESIGN.md §11) */
                  className={`s12 m6 l4 no-padding flex scroll-mt-20 flex-col overflow-hidden transition-colors ${
                    selected && !flashing ? "secondary-container" : ""
                  } ${
                    flashing
                      ? "outline-2 -outline-offset-2 outline-transparent animate-flash"
                      : ""
                  }`}
                >
                  {/* the place's own picture, in the same wide band the map's preview card uses; square, so it butts the card body and the panel's own clip draws the top corners (DESIGN.md §5) */}
                  {image && (
                    <img
                      src={image}
                      alt=""
                      aria-hidden="true"
                      className="aspect-[2/1] w-full rounded-none object-cover"
                      loading="lazy"
                    />
                  )}

                  <div className="flex flex-1 flex-col gap-3 rounded-none p-5">
                    <div className="flex items-center gap-3">
                      <span className="chip flex-none">
                        <Icon
                          name={poiCategoryIcon(point.category)}
                          className="text-base"
                        />
                        {point.category}
                      </span>

                      {/* the axis the whole site is built on: which half of "toen en nu" this place belongs to */}
                      <span className="chip flex-none">{point.era}</span>

                      <span className="ml-auto inline-flex flex-none items-center gap-1 text-sm font-semibold text-ink">
                        <Icon
                          name="star"
                          className="fill text-base text-accent"
                        />
                        {formatRating(point.rating)}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold">{point.name}</h3>

                    <p className="text-sm leading-relaxed text-ink-muted">
                      {point.description}
                    </p>

                    <div className="mt-auto flex flex-wrap items-center gap-3 border-t-2 border-line rounded-none pt-4">
                      <p className="inline-flex items-center gap-1 text-xs text-ink-muted">
                        <Icon name="place" className="text-base" />
                        {point.area} · {formatDistance(point.distanceKm)} vanaf
                        de Grote Markt
                      </p>

                      <div className="ml-auto flex flex-wrap items-center gap-2">
                        <button
                          type="button"
                          aria-pressed={selected}
                          onClick={() => onSelect(point.id)}
                          className="button border text-ink ripple tap-target"
                        >
                          {selected ? "Op de kaart" : "Toon op kaart"}
                        </button>

                        <Link
                          to={builderPath([point.id])}
                          className="button border text-ink ripple tap-target"
                        >
                          <Icon name="route" className="mr-1 text-base" />
                          In een route
                        </Link>
                      </div>
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Container>
    </section>
  );
}
