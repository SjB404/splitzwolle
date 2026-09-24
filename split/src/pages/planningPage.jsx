/*
planningpage — build a plan out of the routes you saved.

the page owns what the sections share: which routes are ticked. the left column
lists them and adds them up, the right column draws the result on the same map
language as everywhere else.

nothing is stored. the planner is a view over the shared route data, which is why a
planned route is the very route the overview lists. the starting selection is a set
of ids into that data for the same reason.
*/

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Breadcrumb from "../components/breadcrumb.jsx";
import PageHeader from "../components/pageHeader.jsx";
import PlanMap from "../sections/planMap.jsx";
import PlanSummary from "../sections/planSummary.jsx";
import SavedRouteList from "../sections/savedRouteList.jsx";
import { ROUTES_PATH } from "../data/navigation.js";
import { ROUTES } from "../data/routes.js";

/* the routes the planner starts with: ids into the shared data, so a planned route is
   the very route the overview lists and not a copy of it */
const SAVED_ROUTE_IDS = [
  "historische-singel-route",
  "rondje-stadsgracht",
  "molenroute-langs-de-ijssel",
];

const SAVED_ROUTES = SAVED_ROUTE_IDS.map((id) =>
  ROUTES.find((route) => route.id === id),
).filter(Boolean);

export default function PlanningPage() {
  const [selectedIds, setSelectedIds] = useState(SAVED_ROUTE_IDS);

  /* calculated, not stored: the selection is the ids, and everything the two columns
     print comes from this one list */
  const selectedRoutes = useMemo(
    () => SAVED_ROUTES.filter((route) => selectedIds.includes(route.id)),
    [selectedIds],
  );

  function toggleRoute(id) {
    setSelectedIds((current) =>
      current.includes(id)
        ? current.filter((item) => item !== id)
        : [...current, id],
    );
  }

  return (
    <>
      <PageHeader
        breadcrumb={
          <Breadcrumb to={ROUTES_PATH} label="Alle routes" current="Planning" />
        }
        eyebrow="Planning"
        title="Stel je route samen"
        description="Kies de routes die je wilt lopen of fietsen. De kaart en het overzicht rekenen de afstand en de duur voor je uit."
      />

      <section className="py-16 sm:py-20">
        <div className="mx-auto grid max-w-[100rem] gap-y-10 px-5 sm:px-8 lg:gap-x-20">
          <div className="s12 l5">
            <SavedRouteList
              routes={SAVED_ROUTES}
              selectedIds={selectedIds}
              onToggle={toggleRoute}
            />

            <PlanSummary routes={selectedRoutes} />
          </div>

          <div className="s12 l7">
            <PlanMap routes={selectedRoutes} totalRouteCount={SAVED_ROUTES.length} />

            <p className="mt-6 text-sm text-ink-muted">
              Zoek je nog een route om toe te voegen?{" "}
              <Link
                to={ROUTES_PATH}
                className="font-semibold text-accent transition-colors hover:underline"
              >
                Bekijk alle routes
              </Link>
              .
            </p>
          </div>
        </div>
      </section>
    </>
  );
}
