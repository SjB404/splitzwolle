import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import EmptyState from "./emptyState.tsx";
import ClearFiltersButton from "./clearFiltersButton.tsx";
import Container from "./container.tsx";
import SectionHeading from "./sectionHeading.tsx";
import Icon from "./icon.tsx";
import { formatDistance, formatRating } from "../format.ts";
import { builderPath } from "../data/navigation.ts";
import { poiCategoryIcon } from "../data/pointsOfInterest.ts";
import { PLACE_IMAGES } from "../data/placeImages.ts";
import { LIST_ITEM } from "../motion.ts";
import type { PointOfInterest } from "../types.ts";

interface PoiResultsProps {
  points: PointOfInterest[];
  selectedId: string | null;
  onShowOnMap: (id: string) => void;
  onReset: () => void;
}

export default function PoiResults({
  points,
  selectedId,
  onShowOnMap,
  onReset,
}: PoiResultsProps) {
  return (
    // not rendered while off screen, 80rem is about its height
    <section className="py-band [contain-intrinsic-size:auto_80rem] [content-visibility:auto]">
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
            <AnimatePresence initial={false} mode="popLayout">
              {points.map((point) => {
                const selected = point.id === selectedId;
                const image = point.image ?? PLACE_IMAGES[point.id];

                return (
                  <m.article
                    {...LIST_ITEM}
                    key={point.id}
                    aria-current={selected || undefined}
                    // an outline and not a border, because the overrides pin every article border with !important
                    className={`s12 m6 l4 no-padding flex flex-col overflow-hidden outline-2 -outline-offset-2 transition-colors ${
                      selected ? "outline-selected" : "outline-transparent"
                    }`}
                  >
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
                          {point.area} · {formatDistance(point.distanceKm)}{" "}
                          vanaf de Grote Markt
                        </p>

                        <div className="ml-auto flex flex-wrap items-center gap-2">
                          <button
                            type="button"
                            onClick={() => onShowOnMap(point.id)}
                            className="button border text-ink ripple tap-target"
                          >
                            <Icon
                              name="location_on"
                              className="mr-1 text-base"
                            />
                            Toon op kaart
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
                  </m.article>
                );
              })}
            </AnimatePresence>
          </div>
        )}
      </Container>
    </section>
  );
}
