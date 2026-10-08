/* chip medium = 40px; tap-target gives the 48px minimum hit area without growing the visual */

import ClearFiltersButton from "./clearFiltersButton.tsx";
import FilterSelect from "./filterSelect.tsx";
import Icon from "./icon.tsx";
import SearchField from "./searchField.tsx";
import {
  CATEGORIES,
  POI_SORTS,
  poiCategoryIcon,
} from "../data/pointsOfInterest.ts";
import type { PoiCategoryFilter, PoiFilterState } from "../types.ts";

interface CategoryChip {
  id: PoiCategoryFilter;
  label: string;
  icon: string;
}

const CATEGORY_CHIPS: CategoryChip[] = [
  { id: "all", label: "Alles", icon: "apps" },
  ...CATEGORIES.map(({ id }) => ({
    id,
    label: id,
    icon: poiCategoryIcon(id),
  })),
];

interface PoiFiltersProps {
  filters: PoiFilterState;
  matchCount: number;
  onFilterChange: (patch: Partial<PoiFilterState>) => void;
  onReset?: () => void;
}

export default function PoiFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}: PoiFiltersProps) {
  return (
    <article className="p-5">
      <div className="grid gap-y-4 lg:gap-x-4">
        <SearchField
          id="poi-search"
          label="Zoek op naam, wijk of categorie"
          placeholder="Zoek op naam, wijk of categorie…"
          value={filters.query}
          onChange={(value) => onFilterChange({ query: value })}
          className="s12 l8"
        />

        <FilterSelect
          id="poi-sort"
          label="Sorteer op"
          value={filters.sort}
          options={POI_SORTS}
          onChange={(value) => onFilterChange({ sort: value })}
          className="s12 m6 l4"
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {CATEGORY_CHIPS.map((category) => {
          const active = filters.category === category.id;

          return (
            <li key={category.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange({ category: category.id })}
                className={`chip medium tap-target ripple ${
                  active ? "bg-selected text-on-selected border-transparent" : ""
                }`}
              >
                <Icon name={category.icon} className="text-base" />
                {category.label}
              </button>
            </li>
          );
        })}
      </ul>

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t-2 border-line rounded-none pt-5">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {`${matchCount} ${
            matchCount === 1 ? "bezienswaardigheid" : "bezienswaardigheden"
          }`}
        </p>

        {onReset && <ClearFiltersButton onClick={onReset} className="ml-auto" />}
      </div>
    </article>
  );
}
