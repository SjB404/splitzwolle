/* the filter card above the route overview — FilterPanel is the card, this file owns what goes in it (the search box and the four selects) */
/* the option lists live here and not in data/routes.ts because they are labels, not data; every list rests on "all", which is why an untouched panel filters nothing out */

import FilterPanel from "../components/filterPanel.tsx";
import FilterSelect from "../components/filterSelect.tsx";
import SearchField from "../components/searchField.tsx";
import { ROUTE_DIFFICULTIES, ROUTE_THEMES } from "../data/routes.ts";
import type {
  RouteDifficultyFilter,
  RouteDistanceFilter,
  RouteFilterState,
  RoutePopularityFilter,
  RouteThemeFilter,
  SelectOption,
} from "../types.ts";

const POPULARITY_OPTIONS: SelectOption<RoutePopularityFilter>[] = [
  { value: "all", label: "Alle routes" },
  { value: "popular", label: "Alleen populair" },
];

const DISTANCE_OPTIONS: SelectOption<RouteDistanceFilter>[] = [
  { value: "all", label: "Alle afstanden" },
  { value: "short", label: "Tot 4 km" },
  { value: "medium", label: "4 – 7 km" },
  { value: "long", label: "Meer dan 7 km" },
];

const THEME_OPTIONS: SelectOption<RouteThemeFilter>[] = [
  { value: "all", label: "Alle thema's" },
  ...ROUTE_THEMES.map((theme) => ({ value: theme, label: theme })),
];

const DIFFICULTY_OPTIONS: SelectOption<RouteDifficultyFilter>[] = [
  { value: "all", label: "Alle niveaus" },
  ...ROUTE_DIFFICULTIES.map((level) => ({ value: level, label: level })),
];

interface RouteFiltersProps {
  filters: RouteFilterState;
  matchCount: number;
  /* a patch and not a (key, value) pair, so the page always stores a whole, valid filter set */
  onFilterChange: (patch: Partial<RouteFilterState>) => void;
  /* undefined while nothing is filtered, which is what keeps the panel's button away */
  onReset?: () => void;
}

export default function RouteFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}: RouteFiltersProps) {
  return (
    <FilterPanel
      resultLabel={`${matchCount} ${matchCount === 1 ? "route" : "routes"} gevonden`}
      /* no reset button while nothing is filtered */
      onReset={onReset}
    >
      {/* the 12 column grid does the layout; the row gap is safe on a phone, but the column gutter is gated behind lg because beerCSS multiplies a gap by 11 tracks */}
      <div className="grid gap-y-4 lg:gap-x-4">
        <SearchField
          id="route-search"
          label="Zoek op titel, wijk of thema"
          placeholder="Zoek op titel, wijk of thema…"
          value={filters.query}
          onChange={(value) => onFilterChange({ query: value })}
          className="s12"
        />

        <FilterSelect
          id="route-popularity"
          label="Populariteit"
          value={filters.popularity}
          options={POPULARITY_OPTIONS}
          onChange={(value) => onFilterChange({ popularity: value })}
        />
        <FilterSelect
          id="route-distance"
          label="Afstand"
          value={filters.distance}
          options={DISTANCE_OPTIONS}
          onChange={(value) => onFilterChange({ distance: value })}
        />
        <FilterSelect
          id="route-theme"
          label="Type route"
          value={filters.theme}
          options={THEME_OPTIONS}
          onChange={(value) => onFilterChange({ theme: value })}
        />
        <FilterSelect
          id="route-difficulty"
          label="Moeilijkheid"
          value={filters.difficulty}
          options={DIFFICULTY_OPTIONS}
          onChange={(value) => onFilterChange({ difficulty: value })}
        />
      </div>
    </FilterPanel>
  );
}
