/*
relatedroutes — the "Vergelijkbare routes" strip that closes a route's page.

the routes arrive already chosen by getRelatedRoutes, because what counts as
comparable (same theme, same area) is a fact about the data and not about this
layout.

it reuses RouteCard, so the third place a route is listed is still the same card.
*/

import { Link } from "react-router-dom";
import RouteCard from "../components/routeCard.jsx";
import SectionHeading from "../components/sectionHeading.jsx";
import { ROUTES_PATH } from "../data/navigation.js";

export default function RelatedRoutes({ routes }) {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <SectionHeading
          title="Vergelijkbare routes"
          description="Routes met hetzelfde thema of dezelfde omgeving."
          action={
            <Link to={ROUTES_PATH} className="button border text-ink ripple">
              Alle routes bekijken
            </Link>
          }
        />

        <div className="mt-10 grid gap-6">
          {routes.map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>
    </section>
  );
}
