/* the filter card above the places — FilterPanel is the card, this file owns the search box, the sort select and the category chips */
/* "medium" makes the chips 40px, which lets tap-target reach the 48px minimum without growing the visual; the active chip changes fill and drops its border, so selecting never moves the layout */

import FilterPanel from "../../shared/filters/filterPanel.tsx";
import FilterSelect from "../../shared/filters/filterSelect.tsx";
import Icon from "../../shared/primitives/icon.tsx";
import SearchField from "../../shared/filters/searchField.tsx";
import {
  POI_CATEGORIES,
  POI_SORTS,
  poiCategoryIcon,
} from "../../data/pointsOfInterest.ts";
import type { PoiCategoryFilter, PoiFilterState } from "../../types.ts";

/* the category chips: "Alles" first, then one per category — chips and not filters, because they are one tap on a value the sort select could also set */
interface CategoryChip {
  id: PoiCategoryFilter;
  label: string;
  icon: string;
}

const CATEGORY_CHIPS: CategoryChip[] = [
  { id: "all", label: "Alles", icon: "apps" },
  ...POI_CATEGORIES.map(({ id }) => ({
    id,
    label: id,
    icon: poiCategoryIcon(id),
  })),
];

interface PoiFiltersProps {
  filters: PoiFilterState;
  matchCount: number;
  /* a patch and not a (key, value) pair, so the page always stores a whole, valid filter set */
  onFilterChange: (patch: Partial<PoiFilterState>) => void;
  /* undefined while nothing is filtered, which is what keeps the panel's button away */
  onReset?: () => void;
}

export default function PoiFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}: PoiFiltersProps) {
  return (
    <FilterPanel
      resultLabel={`${matchCount} ${
        matchCount === 1 ? "bezienswaardigheid" : "bezienswaardigheden"
      }`}
      onReset={onReset}
    >
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
                  active ? "secondary-container border-transparent" : ""
                }`}
              >
                <Icon name={category.icon} className="text-base" />
                {category.label}
              </button>
            </li>
          );
        })}
      </ul>
    </FilterPanel>
  );
}
