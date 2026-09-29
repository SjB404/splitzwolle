/* the home page's opening band — the headline over the map panel, both as wide as the page gutter allows */
/* the band is one screen tall: the map's height is capped by the viewport, and the picture is centre cropped when the band is wider than its own 1520:984 ratio */
/* id="home" because the top bar's Home link and the logo point at it */

import Container from "../../shared/layout/container.tsx";
import HeroMap from "./heroMap.tsx";

export default function Hero() {
  return (
    <section id="home" className="inverse-surface">
      {/* py-hero stands in for the section rhythm's py-band: this band is one screen tall, and the map is what the room is for */}
      <Container className="py-hero">
        {/* one headline in two spans: next to each other where the band is wide, on top of each other where it is not */}
        <h1 className="text-display font-bold">
          <span className="block lg:inline">Ontdek Zwolle</span>{" "}
          <span className="block lg:inline">toen en nu</span>
        </h1>

        <HeroMap className="mt-6 motion-safe:animate-rise sm:mt-8" />
      </Container>
    </section>
  );
}
