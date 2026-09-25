/* the "Vergelijkbare routes" strip that closes a route's page; what counts as comparable is getRelatedRoutes' job, not this layout's */

import { Link } from "react-router-dom";
import RouteGrid from "../../shared/content/routeGrid.tsx";
import SectionHeading from "../../shared/layout/sectionHeading.tsx";
import Container from "../../shared/layout/container.tsx";
import { ROUTES_PATH } from "../../data/navigation.ts";
import type { Route } from "../../types.ts";

interface RelatedRoutesProps {
  routes: Route[];
}

export default function RelatedRoutes({ routes }: RelatedRoutesProps) {
  return (
    <section className="py-band">
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
