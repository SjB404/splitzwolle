/* the home page's strip of the route overview; how many routes a preview holds lives in data/routes.ts */

import { Link } from "react-router-dom";
import RouteGrid from "../../shared/content/routeGrid.tsx";
import SectionHeading from "../../shared/layout/sectionHeading.tsx";
import Container from "../../shared/layout/container.tsx";
import { ROUTES_PATH } from "../../data/navigation.ts";
import { ROUTES, ROUTE_PREVIEW_COUNT } from "../../data/routes.ts";

export default function PopularRoutesPreview() {
  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="Populaire routes"
          description="De hoogst gewaardeerde routes van deze maand, gekozen door de community."
          action={
            /* a link dressed as a button needs .button (a bare <a> has no button box), and border defaults to primary text — 2.5:1 on white — so the ink comes from the theme */
            <Link to={ROUTES_PATH} className="button border text-ink ripple">
              Alle routes bekijken
            </Link>
          }
        />

        <RouteGrid routes={ROUTES.slice(0, ROUTE_PREVIEW_COUNT)} />
      </Container>
    </section>
  );
}
