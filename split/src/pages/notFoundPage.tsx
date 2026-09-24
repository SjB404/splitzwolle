/*
notfoundpage — the catch all page.

it is a normal page inside the shell, so the bar and the footer still work. a route
page renders it too when its :routeId matches nothing, which is why the text comes in
as props instead of being hardcoded here.
*/

import { Link } from "react-router-dom";
import PageHeader from "../components/pageHeader.tsx";
import { HOME_PATH, ROUTES_PATH } from "../data/navigation.ts";

/* every prop is optional: the page catches unknown urls, and a route page renders it
   when its id matches nothing — and that caller passes wording of its own */
interface NotFoundPageProps {
  title?: string;
  description?: string;
}

export default function NotFoundPage({
  title = "Deze pagina bestaat niet",
  description = "De link klopt niet of de pagina is verplaatst. Ga terug naar de homepagina of bekijk alle routes.",
}: NotFoundPageProps) {
  return (
    <>
      <PageHeader eyebrow="404" title={title} description={description} />

      <section className="py-16 sm:py-20">
        <div className="mx-auto flex max-w-[100rem] flex-wrap gap-3 px-5 sm:px-8">
          <Link to={HOME_PATH} className="button ripple">
            Terug naar home
          </Link>
          <Link to={ROUTES_PATH} className="button border text-ink ripple">
            Alle routes bekijken
          </Link>
        </div>
      </section>
    </>
  );
}
