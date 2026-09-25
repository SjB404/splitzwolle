/* the catch all page — a normal page inside the shell, also rendered by a route page whose :routeId matches nothing */

import { Link } from "react-router-dom";
import PageHeader from "../components/pageHeader.tsx";
import { HOME_PATH, ROUTES_PATH } from "../data/navigation.ts";

/* both props are optional: the route page caller passes wording of its own */
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
