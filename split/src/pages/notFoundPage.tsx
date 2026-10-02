/* the catch all page — a normal page inside the shell, also rendered by a route page whose :routeId matches nothing */

import { Link } from "react-router-dom";
import PageHeader from "../components/pageHeader.tsx";
import Container from "../components/container.tsx";
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

      <section className="py-band">
        <Container className="flex flex-wrap gap-3">
          <Link to={HOME_PATH} className="button ripple tap-target">
            Terug naar home
          </Link>
          <Link
            to={ROUTES_PATH}
            className="button border text-ink ripple tap-target"
          >
            Alle routes bekijken
          </Link>
        </Container>
      </section>
    </>
  );
}
