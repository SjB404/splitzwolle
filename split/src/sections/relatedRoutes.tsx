/*
relatedroutes — the "Vergelijkbare routes" strip that closes a route's page.

the routes arrive already chosen by getRelatedRoutes, because what counts as
comparable (same theme, same area) is a fact about the data and not about this
layout.

it reuses RouteCard, so the third place a route is listed is still the same card.
*/

import { Link } from "react-router-dom";
import RouteGrid from "../components/routeGrid.tsx";
import SectionHeading from "../components/sectionHeading.tsx";
import Container from "../components/container.tsx";
import { ROUTES_PATH } from "../data/navigation.ts";
import type { Route } from "../types.ts";

interface RelatedRoutesProps {
  /* already chosen by getRelatedRoutes: what counts as comparable is a fact about the
     data, not about this layout */
  routes: Route[];
}

export default function RelatedRoutes({ routes }: RelatedRoutesProps) {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="Vergelijkbare routes"
          description="Routes met hetzelfde thema of dezelfde omgeving."
          action={
            <Link to={ROUTES_PATH} className="button border text-ink ripple">
              Alle routes bekijken
            </Link>
          }
        />

        <RouteGrid routes={routes} />
      </Container>
    </section>
  );
}
