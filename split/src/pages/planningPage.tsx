/* build a plan out of the routes you saved — the page owns which routes are ticked; nothing is stored, it is a view over the shared route data */

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

/* the routes the planner starts with: ids into the shared data, so a planned route is the very route the overview lists */
const SAVED_ROUTE_IDS: string[] = [
  "historische-singel-route",
  "rondje-stadsgracht",
  "molenroute-langs-de-ijssel",
];

/* the ids above, looked up in the data; the type predicate is what satisfies typescript, since find() answers with Route | undefined */
const SAVED_ROUTES: Route[] = SAVED_ROUTE_IDS.map((id) =>
  ROUTES.find((route) => route.id === id),
).filter((route): route is Route => route !== undefined);

export default function PlanningPage() {
  const [selectedIds, setSelectedIds] = useState(SAVED_ROUTE_IDS);

  /* calculated, not stored: the selection is the ids, and everything the two columns print comes from this one list */
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
            <PlanMap
              routes={selectedRoutes}
              totalRouteCount={SAVED_ROUTES.length}
            />

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
