/*
poicard — one place in the points of interest grid.

the card is what selects the place, and the map above shows that selection. a
selected card gets the secondary-container fill, the same one a selected chip uses,
so "this one is chosen" looks the same everywhere.

the picture is a crop of the illustrated map and not a photo: one real picture per
place would be a hundred images to keep in step with the data.
*/

import Icon from "../components/icon.tsx";
import { formatDistance, formatRating } from "../format.ts";
import { poiCategoryIcon } from "../data/pointsOfInterest.ts";
import type { PointOfInterest } from "../types.ts";

interface PoiCardProps {
  point: PointOfInterest;
  /* whether this is the place the map above is highlighting */
  selected: boolean;
  onSelect: (id: string) => void;
}

export default function PoiCard({ point, selected, onSelect }: PoiCardProps) {
  return (
    <article
      className={`s12 m6 l4 no-padding flex flex-col transition-colors ${
        selected ? "secondary-container" : ""
      }`}
    >
      <div className="flex flex-1 flex-col gap-3 p-5">
        <div className="flex items-center gap-3">
          <span className="chip flex-none">
            <Icon name={poiCategoryIcon(point.category)} className="text-base" />
            {point.category}
          </span>

          <span className="ml-auto inline-flex flex-none items-center gap-1 text-sm font-semibold text-ink">
            <Icon name="star" className="fill text-base text-accent" />
            {formatRating(point.rating)}
          </span>
        </div>

        <h3 className="text-xl font-bold">{point.name}</h3>

        <p className="text-sm leading-relaxed text-ink-muted">{point.description}</p>

        <div className="mt-auto flex flex-wrap items-center gap-3 border-t border-line pt-4">
          <p className="inline-flex items-center gap-1 text-xs text-ink-muted">
            <Icon name="place" className="text-base" />
            {point.area} · {formatDistance(point.distanceKm)} vanaf de Grote Markt
          </p>

          <button
            type="button"
            aria-pressed={selected}
            onClick={() => onSelect(point.id)}
            className="button border text-ink ripple tap-target ml-auto"
          >
            {selected ? "Op de kaart" : "Toon op kaart"}
          </button>
        </div>
      </div>
    </article>
  );
}
