import ClearFiltersButton from "./clearFiltersButton.tsx";
import FilterSelect from "./filterSelect.tsx";
import SearchField from "./searchField.tsx";
import { ROUTE_DIFFICULTIES, ROUTE_THEMES } from "../data/routes.ts";
import type {
  RouteDifficultyFilter,
  RouteDistanceFilter,
  RouteFilterState,
  RouteOwnershipFilter,
  RoutePopularityFilter,
  RouteThemeFilter,
  SelectOption,
} from "../types.ts";

const POPULARITY_OPTIONS: SelectOption<RoutePopularityFilter>[] = [
  { value: "all", label: "Alle routes" },
  { value: "popular", label: "Alleen populair" },
];

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
  onFilterChange: (patch: Partial<RouteFilterState>) => void;
  onReset?: () => void;
}

export default function RouteFilters({
  filters,
  matchCount,
  onFilterChange,
  onReset,
}: RouteFiltersProps) {
  return (
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

      <p
        aria-live="polite"
        className="basis-full text-sm text-ink-muted sm:basis-auto sm:ml-auto"
      >
        {matchCount} {matchCount === 1 ? "route" : "routes"} gevonden
      </p>

      {/* h-12 matches the field height in this row */}
      {onReset && <ClearFiltersButton onClick={onReset} className="h-12" />}
    </div>
  );
}
