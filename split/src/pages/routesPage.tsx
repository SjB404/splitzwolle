import { useMemo, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import Container from "../components/container.tsx";
import PageHeader from "../components/pageHeader.tsx";
import SectionHeading from "../components/sectionHeading.tsx";
import Icon from "../components/icon.tsx";
import StarRating from "../components/starRating.tsx";
import AreaMap from "../components/areaMap.tsx";
import MapLegend from "../components/mapLegend.tsx";
import type { MapLegendItem } from "../components/mapLegend.tsx";
import { usePlannedRoute } from "../data/usePlannedRoute.ts";
import NotFoundPage from "./notFoundPage.tsx";
import PoiPicker from "../components/poiPicker.tsx";
import RouteFilters from "../components/routeFilters.tsx";
import RoutePlanSummary from "../components/routePlanSummary.tsx";
import RouteResults from "../components/routeResults.tsx";
import RouteReviewsPanel from "../components/routeReviewsPanel.tsx";
import RouteShareButton from "../components/routeShareButton.tsx";
import { AREA_NAME, pointsInArea } from "../data/area.ts";
import {
  POINTS_OF_INTEREST,
  getPointOfInterest,
} from "../data/pointsOfInterest.ts";
import {
  INITIAL_ROUTE_FILTERS,
  ROUTES,
  filterRoutes,
  hasActiveRouteFilters,
} from "../data/routes.ts";
import { ROUTES_PATH, builderPath, parsePlaceIds } from "../data/navigation.ts";
import { useSavedRouteIds, toggleSavedRoute } from "../data/savedRoutes.ts";
import { formatRating } from "../format.ts";
import type {
  PointOfInterest,
  RouteFilterState,
  TravelMode,
} from "../types.ts";

/* the picker's points are all in-area points, not the filtered list */
const AREA_POINTS = pointsInArea(POINTS_OF_INTEREST);

const AREA_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

export default function RoutesPage() {
  const navigate = useNavigate();
  const { placeIds, routeId } = useParams<{
    placeIds?: string;
    routeId?: string;
  }>();
  const [filters, setFilters] = useState(INITIAL_ROUTE_FILTERS);
  const [showAll, setShowAll] = useState(false);
  const [chosenMode, setChosenMode] = useState<TravelMode | null>(null);
  const savedIds = useSavedRouteIds();

  const publicRoute = routeId
    ? (ROUTES.find((route) => route.id === routeId) ?? null)
    : null;
  const pickedIds = useMemo(
    () =>
      publicRoute
        ? publicRoute.poiIds
        : parsePlaceIds(placeIds).filter(
            (id) => getPointOfInterest(id) !== undefined,
          ),
    [publicRoute, placeIds],
  );

  const results = useMemo(
    () => filterRoutes(filters, savedIds),
    [filters, savedIds],
  );

  const mode =
    chosenMode ?? (publicRoute?.theme === "Fiets" ? "bicycling" : "walking");

  const pickedPoints = useMemo(
    () =>
      pickedIds
        .map((id) => getPointOfInterest(id))
        .filter((point): point is PointOfInterest => point !== undefined),
    [pickedIds],
  );

  const plan = usePlannedRoute(pickedPoints, mode);

  const order = useMemo(
    () => new Map(pickedIds.map((id, index) => [id, index + 1])),
    [pickedIds],
  );

  function setPicked(next: string[]) {
    navigate(next.length > 0 ? builderPath(next) : ROUTES_PATH);
  }

  function togglePoint(id: string) {
    setPicked(
      pickedIds.includes(id)
        ? pickedIds.filter((item) => item !== id)
        : [...pickedIds, id],
    );
  }

  function updateFilter(patch: Partial<RouteFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
    setShowAll(false);
  }

  function resetFilters() {
    setFilters(INITIAL_ROUTE_FILTERS);
    setShowAll(false);
  }

  if (routeId && !publicRoute) {
    return (
      <NotFoundPage
        title="Route niet gevonden"
        description="Deze route bestaat niet (meer). Bekijk alle routes om er een te kiezen."
      />
    );
  }

  return (
    <>
      {publicRoute ? (
        <PageHeader
          breadcrumb={
            <nav
              aria-label="Kruimelpad"
              className="flex flex-wrap items-center gap-2 text-sm text-ink-muted"
            >
              <Link
                to={ROUTES_PATH}
                className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
              >
                <Icon name="arrow_back" className="text-base" />
                Alle routes
              </Link>

              <Icon name="chevron_right" className="text-base" />

              <span className="text-ink">{publicRoute.title}</span>
            </nav>
          }
          eyebrow={publicRoute.theme}
          title={publicRoute.title}
          description={publicRoute.description}
        >
          <div className="mt-6 flex flex-wrap items-center gap-x-6 gap-y-3">
            <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <Icon name="place" className="text-base" />
              {publicRoute.area}
            </span>
            <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
              <StarRating value={publicRoute.rating} />
              {formatRating(publicRoute.rating)} · {publicRoute.reviews}{" "}
              beoordelingen
            </span>
          </div>
        </PageHeader>
      ) : (
        <PageHeader title="Stel je route samen" />
      )}

      <section className="py-band">
        <Container className="grid gap-y-8 lg:gap-x-8">
          {/* picker groups are h3, so this band must supply an h2 (no skipped heading levels) */}
          <div className="s12">
            <SectionHeading
              title={publicRoute ? "Deze route op de kaart" : "Bouw je route"}
              description={
                publicRoute
                  ? "De plekken van deze route staan al in de kaart. Haal er een weg of zet er een bij om je eigen versie te maken."
                  : `Kies de plekken die je wilt zien, in de volgorde die jij wilt — alles binnen ${AREA_NAME}.`
              }
            />
          </div>

          <div className="s12 l4">
            <PoiPicker
              points={AREA_POINTS}
              pickedIds={pickedIds}
              mode={mode}
              onToggle={togglePoint}
              onModeChange={setChosenMode}
              onReset={() => setPicked([])}
            />

            <RoutePlanSummary plan={plan} onReset={() => setPicked([])} />
          </div>

          <div className="s12 l8">
            <div className="relative">
              <AreaMap
                points={AREA_POINTS}
                line={plan}
                order={order}
                onClickPoint={togglePoint}
                clickHint="Klik om deze plek aan je route toe te voegen"
                heightClassName="h-[clamp(24rem,56vh,40rem)]"
                label={
                  pickedIds.length > 0
                    ? `${pickedIds.length} van ${AREA_POINTS.length} plekken`
                    : `${AREA_POINTS.length} plekken in de binnenstad`
                }
                description={`Kaart van ${AREA_NAME} met ${AREA_POINTS.length} plekken. De gekozen plekken en hun volgorde staan in de lijst naast de kaart.`}
              />

              {/* map's own zoom control sits top-right (mapOptions §8), so this corner stays free for share */}
              <div className="absolute bottom-4 right-4 z-20">
                <RouteShareButton placeIds={pickedIds} />
              </div>
            </div>

            <MapLegend items={AREA_MAP_LEGEND} />

            {publicRoute && <RouteReviewsPanel route={publicRoute} />}
          </div>
        </Container>
      </section>

      <section className="py-band">
        <Container>
          <SectionHeading
            eyebrow="Kant-en-klaar"
            title="Routes door de binnenstad"
            description="Rondjes die anderen al liepen of fietsten, met dezelfde plekken als hierboven. Klik een kaart om de route te openen, of het bookmark om hem te bewaren."
          />

          <RouteFilters
            filters={filters}
            matchCount={results.length}
            onFilterChange={updateFilter}
            onReset={hasActiveRouteFilters(filters) ? resetFilters : undefined}
          />

          <RouteResults
            routes={results}
            showAll={showAll}
            onShowAll={() => setShowAll(true)}
            onReset={resetFilters}
            savedIds={savedIds}
            onToggleSave={(route) => {
              toggleSavedRoute(route.id);
            }}
          />
        </Container>
      </section>
    </>
  );
}
