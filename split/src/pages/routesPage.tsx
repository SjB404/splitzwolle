/* the overview: build a route out of the places, or take a ready-made one — the url *is* the state, so a built
   route and a ready-made one are both shareable links and the back button always works */
/* the filters are state and not url parameters: they are a view of one list, not a destination */

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

/* the places a route may use do not depend on a filter: they are the ones inside the covered area (data/area.ts) */
const AREA_POINTS = pointsInArea(POINTS_OF_INTEREST);

/* what the builder's map draws, in the order the legend reads it */
const AREA_MAP_LEGEND: MapLegendItem[] = [
  { shape: "route", label: "Route" },
  { shape: "historic", label: "Plek van toen" },
  { shape: "current", label: "Plek van nu" },
];

export default function RoutesPage() {
  const navigate = useNavigate();
  /* the two url shapes this page answers: /routes/custom/<ids> and /routes/public/<id> (see data/navigation.ts) */
  const { placeIds, routeId } = useParams<{
    placeIds?: string;
    routeId?: string;
  }>();
  const [filters, setFilters] = useState(INITIAL_ROUTE_FILTERS);
  const [showAll, setShowAll] = useState(false);
  /* the way of travelling is the reader's own choice; until they make one, a bicycle route opens in bicycle mode, so the numbers on arrival are the ones the route was made for */
  const [chosenMode, setChosenMode] = useState<TravelMode | null>(null);
  /* the reader's own saved routes live in the browser, so the page reads them as state and passes them on */
  const savedIds = useSavedRouteIds();

  /* a ready-made route is in the url by id, a built one by its places — both are read here, never stored */
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

  /* the map prints the visit order beside each dot, so the list, the map and the summary read the same */
  const order = useMemo(
    () => new Map(pickedIds.map((id, index) => [id, index + 1])),
    [pickedIds],
  );

  /* every change of the picked places is a url change, which is what makes the share button, a copied link and
     the back button agree without anything being synced by hand */
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

  /* a filter change collapses the list, so "Toon meer" cannot leave the reader on a list nobody asked for */
  function updateFilter(patch: Partial<RouteFilterState>) {
    setFilters((current) => ({ ...current, ...patch }));
    setShowAll(false);
  }

  function resetFilters() {
    setFilters(INITIAL_ROUTE_FILTERS);
    setShowAll(false);
  }

  /* an id that is not in the data is a dead link, and says so */
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
            /* the trail a sub page opens with; only this page has one, so it is written out here */
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
          {/* the picker's groups are h3, so the band owes them an h2: a page may not jump a heading level */}
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
            {/* relative, so the share action can sit in the map's own corner */}
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

              {/* the corner a thumb reaches on a phone, and the one the share action belongs in: the map's own
                  zoom control is moved to the top-right in `mapOptions` (§8) so the two can never stack, and the
                  chip at the top-left still names the map */}
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

          {/* the search box first, then the four filters beside it: one row, so the list below is what the eye lands on */}
          <RouteFilters
            filters={filters}
            matchCount={results.length}
            onFilterChange={updateFilter}
            /* onReset stays undefined while nothing is filtered, which is how "Filters wissen" stays away */
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
