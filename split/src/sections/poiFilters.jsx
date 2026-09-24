/*
poifilters — the filter card above the points of interest.

the card is FilterPanel; this component owns the search box, the sort select and
the category chips.

the chips set a filter the select could set too, one tap instead of two. "medium"
makes them 40px, which is what lets tap-target reach the 48px minimum without
growing the visual. the active chip changes its fill and drops its border, so
selecting one never moves the layout.
*/

import FilterPanel from "../components/filterPanel.jsx";
import FilterSelect from "../components/filterSelect.jsx";
import Icon from "../components/icon.jsx";
import SearchField from "../components/searchField.jsx";
import {
  POI_CATEGORIES,
  POI_SORTS,
  poiCategoryIcon,
} from "../data/pointsOfInterest.js";

/* the category chips: "Alles" first, then one per category. the icons come from the
   same lookup the cards use, so a category looks the same in both places. */
const CATEGORY_FILTERS = [
  { id: "all", label: "Alles", icon: "apps" },
  ...POI_CATEGORIES.map(({ id }) => ({ id, label: id, icon: poiCategoryIcon(id) })),
];

export default function PoiFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}) {
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
          onChange={(value) => onFilterChange("query", value)}
          className="s12 l8"
        />

        <FilterSelect
          id="poi-sort"
          label="Sorteer op"
          value={filters.sort}
          options={POI_SORTS}
          onChange={(value) => onFilterChange("sort", value)}
          className="s12 m6 l4"
        />
      </div>

      <ul className="mt-4 flex flex-wrap gap-2">
        {CATEGORY_FILTERS.map((category) => {
          const active = filters.category === category.id;

          return (
            <li key={category.id}>
              <button
                type="button"
                aria-pressed={active}
                onClick={() => onFilterChange("category", category.id)}
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
