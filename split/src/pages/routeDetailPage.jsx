/*
routedetailpage — one route in full: the map, the facts, the story, the reviews and
what to walk next.

the file has two components on purpose. RouteDetailPage looks up the :routeId, so it
can render its own 404, and RouteDetail holds the rest. the other way round would
mean reading a route before knowing whether there is one, which is how a hook ends up
being called conditionally.

RouteDetail is the page's table of contents: the header band, then the sections in
order. each section owns its own markup and grid column, so this file is only the
order and the shared route.
*/

import { useParams } from "react-router-dom";
import Breadcrumb from "../components/breadcrumb.jsx";
import Icon from "../components/icon.jsx";
import MapPanel from "../components/mapPanel.jsx";
import PageHeader from "../components/pageHeader.jsx";
import StarRating from "../components/starRating.jsx";
import { RouteOverlay } from "../components/mapArtwork.jsx";
import RelatedRoutes from "../sections/relatedRoutes.jsx";
import RouteFacts from "../sections/routeFacts.jsx";
import RouteReviews from "../sections/routeReviews.jsx";
import RouteStory from "../sections/routeStory.jsx";
import RouteStops from "../sections/routeStops.jsx";
import RouteSummary from "../sections/routeSummary.jsx";
import NotFoundPage from "./notFoundPage.jsx";
import { MAP_IMAGES } from "../data/maps.js";
import { ROUTES_PATH } from "../data/navigation.js";
import { ROUTES, getRelatedRoutes } from "../data/routes.js";
import { formatRating } from "../format.js";

function RouteDetail({ route }) {
  const relatedRoutes = getRelatedRoutes(route);

  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumb to={ROUTES_PATH} label="Alle routes" current={route.title} />
        }
        eyebrow={route.theme}
        title={route.title}
        description={route.description}
      >
        {/* the lead row: where the route is, and how it scores. it is children of the
            header because it belongs to the band, not to a section. */}
        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3">
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <Icon name="place" className="text-base" />
            {route.area}
          </span>
          <span className="inline-flex items-center gap-2 text-sm text-ink-muted">
            <StarRating value={route.rating} />
            {formatRating(route.rating)} · {route.reviews} beoordelingen
          </span>
        </div>
      </PageHeader>

      {/* map and summary. the artwork is the shared map with this route's own points,
          so a route never needs a second illustration. the two columns belong to the
          page, because each holds more than one section. */}
      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 sm:px-8 lg:gap-x-20">
          <div className="s12 l8">
            <MapPanel
              image={MAP_IMAGES.roads}
              alt={`Kaart van Zwolle met de route ${route.title}`}
            >
              <RouteOverlay path={route.path} />
            </MapPanel>

            <RouteFacts route={route} />
          </div>

          <div className="s12 l4">
            <RouteSummary route={route} />
          </div>
        </div>
      </section>

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 sm:px-8 lg:gap-x-20">
          <RouteStory route={route} />
          <RouteStops route={route} />
        </div>
      </section>

      <RouteReviews route={route} />

      <RelatedRoutes routes={relatedRoutes} />
    </>
  );
}

export default function RouteDetailPage() {
  const { routeId } = useParams();
  const route = ROUTES.find((item) => item.id === routeId);

  if (!route) {
    return (
      <NotFoundPage
        title="Route niet gevonden"
        description="Deze route bestaat niet (meer). Bekijk alle routes om er een te kiezen."
      />
    );
  }

  return <RouteDetail route={route} />;
}
