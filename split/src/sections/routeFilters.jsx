/*
routefilters — the filter card above the route overview.

the card is FilterPanel; this file owns what goes in it: the search box, the four
selects, and the lists they offer.

the option lists live here and not in data/routes.js because they are labels, not
data. "Tot 4 km" is only how the design words the "short" bucket that
filterRoutes compares against. every list rests on "all", which is why an
untouched panel filters nothing out.

the page holds the filter state, so a change is reported as a (key, value) pair.
*/

import FilterPanel from "../components/filterPanel.jsx";
import FilterSelect from "../components/filterSelect.jsx";
import SearchField from "../components/searchField.jsx";
import { ROUTE_DIFFICULTIES, ROUTE_THEMES } from "../data/routes.js";

const POPULARITY_OPTIONS = [
  { value: "all", label: "Alle routes" },
  { value: "popular", label: "Alleen populair" },
];

const DISTANCE_OPTIONS = [
  { value: "all", label: "Alle afstanden" },
  { value: "short", label: "Tot 4 km" },
  { value: "medium", label: "4 – 7 km" },
  { value: "long", label: "Meer dan 7 km" },
];

const THEME_OPTIONS = [
  { value: "all", label: "Alle thema's" },
  ...ROUTE_THEMES.map((theme) => ({ value: theme, label: theme })),
];

const DIFFICULTY_OPTIONS = [
  { value: "all", label: "Alle niveaus" },
  ...ROUTE_DIFFICULTIES.map((level) => ({ value: level, label: level })),
];

export default function RouteFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}) {
  return (
    <FilterPanel
      resultLabel={`${matchCount} ${matchCount === 1 ? "route" : "routes"} gevonden`}
      /* no reset button while nothing is filtered: the panel only draws the button
         when it is given something to do */
      onReset={onReset}
    >
      {/* the 12 column grid does the layout. the row gap is safe on a phone, but the
          column gutter is gated behind lg because beerCSS multiplies a gap by 11
          tracks. */}
      <div className="grid gap-y-4 lg:gap-x-4">
        <SearchField
          id="route-search"
          label="Zoek op titel, wijk of thema"
          placeholder="Zoek op titel, wijk of thema…"
          value={filters.query}
          onChange={(value) => onFilterChange("query", value)}
          className="s12"
        />

        <FilterSelect
          id="route-popularity"
          label="Populariteit"
          value={filters.popularity}
          options={POPULARITY_OPTIONS}
          onChange={(value) => onFilterChange("popularity", value)}
        />
        <FilterSelect
          id="route-distance"
          label="Afstand"
          value={filters.distance}
          options={DISTANCE_OPTIONS}
          onChange={(value) => onFilterChange("distance", value)}
        />
        <FilterSelect
          id="route-theme"
          label="Type route"
          value={filters.theme}
          options={THEME_OPTIONS}
          onChange={(value) => onFilterChange("theme", value)}
        />
        <FilterSelect
          id="route-difficulty"
          label="Moeilijkheid"
          value={filters.difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => onFilterChange("difficulty", value)}
        />
      </div>
    </FilterPanel>
  );
}
