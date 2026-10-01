/* the route list's search box and its five filters — one row, next to each other, so the list below is what the eye lands on */
/* the option lists live here and not in data/routes.ts because they are labels, not data; every list rests on "all", which is why an untouched row filters nothing out */

import ClearFiltersButton from "../../shared/filters/clearFiltersButton.tsx";
import FilterSelect from "../../shared/filters/filterSelect.tsx";
import SearchField from "../../shared/filters/searchField.tsx";
import { ROUTE_DIFFICULTIES, ROUTE_THEMES } from "../../data/routes.ts";
import type {
  RouteDifficultyFilter,
  RouteDistanceFilter,
  RouteFilterState,
  RouteOwnershipFilter,
  RoutePopularityFilter,
  RouteThemeFilter,
  SelectOption,
} from "../../types.ts";

const POPULARITY_OPTIONS: SelectOption<RoutePopularityFilter>[] = [
  { value: "all", label: "Alle routes" },
  { value: "popular", label: "Alleen populair" },
];

/* whose route it is: the ones the reader saved in this browser, or the community's ready-made ones */
const OWNERSHIP_OPTIONS: SelectOption<RouteOwnershipFilter>[] = [
  { value: "all", label: "Iedereens routes" },
  { value: "community", label: "Van de community" },
  { value: "saved", label: "Opgeslagen door jou" },
];

const DISTANCE_OPTIONS: SelectOption<RouteDistanceFilter>[] = [
  { value: "all", label: "Alle afstanden" },
  { value: "short", label: "Tot 1,5 km" },
  { value: "medium", label: "1,5 – 2,5 km" },
  { value: "long", label: "Meer dan 2,5 km" },
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
  /* undefined while nothing is filtered, which is what keeps the reset button away */
  onReset?: () => void;
}

export default function RouteFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}: RouteFiltersProps) {
  return (
    /* a search landmark, so the field and the filters that belong to it are one region rather than six loose controls */
    <div
      role="search"
      aria-label="Routes zoeken en filteren"
      className="mt-8 flex flex-wrap items-end gap-x-4 gap-y-3"
    >
      <SearchField
        id="route-search"
        label="Zoek op titel, wijk of thema"
        placeholder="Zoek op titel, wijk of thema…"
        value={filters.query}
        onChange={(value) => onFilterChange({ query: value })}
        className="min-w-0 grow basis-56 text-sm"
      />

      <FilterSelect
        id="route-popularity"
        label="Populariteit"
        value={filters.popularity}
        options={POPULARITY_OPTIONS}
        onChange={(value) => onFilterChange({ popularity: value })}
        className="min-w-0 grow basis-48"
      />
      <FilterSelect
        id="route-distance"
        label="Afstand"
        value={filters.distance}
        options={DISTANCE_OPTIONS}
        onChange={(value) => onFilterChange({ distance: value })}
        className="min-w-0 grow basis-48"
      />
      <FilterSelect
        id="route-theme"
        label="Type route"
        value={filters.theme}
        options={THEME_OPTIONS}
        onChange={(value) => onFilterChange({ theme: value })}
        className="min-w-0 grow basis-48"
      />
      <FilterSelect
        id="route-difficulty"
        label="Moeilijkheid"
        value={filters.difficulty}
        options={DIFFICULTY_OPTIONS}
        onChange={(value) => onFilterChange({ difficulty: value })}
        className="min-w-0 grow basis-48"
      />
      <FilterSelect
        id="route-ownership"
        label="Van wie"
        value={filters.ownership}
        options={OWNERSHIP_OPTIONS}
        onChange={(value) => onFilterChange({ ownership: value })}
        className="min-w-0 grow basis-48"
      />

      {/* the count takes its own line on a phone, so it never squeezes the last filter beside it */}
      <p
        aria-live="polite"
        className="basis-full text-sm text-ink-muted sm:basis-auto sm:ml-auto"
      >
        {matchCount} {matchCount === 1 ? "route" : "routes"} gevonden
      </p>

      {/* h-12 matches the fields in this row, so the row reads as one line of controls and not five fields with a shorter button after them (§7) */}
      {onReset && <ClearFiltersButton onClick={onReset} className="h-12" />}
    </div>
  );
}
