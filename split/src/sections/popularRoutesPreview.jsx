/*
popularroutespreview — the home page's strip of the route overview.

it shows only the first few routes and links to the full list instead of growing
here, so the preview and the overview always describe a route the same way.

"how many routes is a preview" lives in data/routes.js, not here.
*/

import { Link } from "react-router-dom";
import RouteCard from "../components/routeCard.jsx";
import SectionHeading from "../components/sectionHeading.jsx";
import { ROUTES_PATH } from "../data/navigation.js";
import { ROUTES, ROUTE_PREVIEW_COUNT } from "../data/routes.js";

export default function PopularRoutesPreview() {
  return (
    <section className="py-16 sm:py-20">
      <div className="mx-auto max-w-[100rem] px-5 sm:px-8">
        <SectionHeading
          title="Populaire routes"
          description="De hoogst gewaardeerde routes van deze maand, gekozen door de community."
          action={
            /* border is beerCSS's outlined button, and it defaults to primary text,
               which is too light on white (2.5:1). so the label takes the theme's
               ink instead. a link dressed as a button also needs the .button class:
               a bare <a> has no button box. */
            <Link to={ROUTES_PATH} className="button border text-ink ripple">
              Alle routes bekijken
            </Link>
          }
        />

        <div className="mt-10 grid gap-6">
          {ROUTES.slice(0, ROUTE_PREVIEW_COUNT).map((route) => (
            <RouteCard key={route.id} route={route} />
          ))}
        </div>
      </div>
    </section>
  );
}
