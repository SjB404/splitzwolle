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
import Breadcrumb from "../components/breadcrumb.tsx";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
import PlanMap from "../sections/planMap.tsx";
import PlanSummary from "../sections/planSummary.tsx";
import SavedRouteList from "../sections/savedRouteList.tsx";
import { ROUTES_PATH } from "../data/navigation.ts";
import { ROUTES } from "../data/routes.ts";
import type { Route } from "../types.ts";

/* the routes the planner starts with: ids into the shared data, so a planned route is
   the very route the overview lists and not a copy of it */
const SAVED_ROUTE_IDS: string[] = [
  "historische-singel-route",
  "rondje-stadsgracht",
  "molenroute-langs-de-ijssel",
];

/*
the ids above, looked up in the data.

the type predicate is what tells typescript what the filter does: find() answers with
`Route | undefined`, and an id that is not in the data would otherwise leave an
undefined in a list the planner draws.
*/
const SAVED_ROUTES: Route[] = SAVED_ROUTE_IDS.map((id) =>
  ROUTES.find((route) => route.id === id),
).filter((route): route is Route => route !== undefined);

export default function PlanningPage() {
  const [selectedIds, setSelectedIds] = useState(SAVED_ROUTE_IDS);

  /* calculated, not stored: the selection is the ids, and everything the two columns
     print comes from this one list */
  const selectedRoutes = useMemo(
    () => SAVED_ROUTES.filter((route) => selectedIds.includes(route.id)),
    [selectedIds],
  );

  function toggleRoute(id: string) {
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
        <Container className="grid gap-y-10 lg:gap-x-20">
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
        </Container>
      </section>
    </>
  );
}
