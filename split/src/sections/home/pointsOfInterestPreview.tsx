/* the home page's strip of the places worth a detour — it sorts through the same filterPointsOfInterest the poi page uses, so "the five best" cannot drift */

import { Link } from "react-router-dom";
import { PoiCrop } from "../../shared/map/mapArtwork.tsx";
import SectionHeading from "../../shared/layout/sectionHeading.tsx";
import Container from "../../shared/layout/container.tsx";
import { MAP_IMAGES } from "../../data/maps.ts";
import { POI_PATH } from "../../data/navigation.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
} from "../../data/pointsOfInterest.ts";

/* how many places the strip shows before it links to the full list */
const POI_PREVIEW_COUNT = 5;

export default function PointsOfInterestPreview() {
  /* the overview's own filter at its resting state, so the two pages agree on "the five best" */
  const highlights = filterPointsOfInterest(INITIAL_POI_FILTERS).slice(
    0,
    POI_PREVIEW_COUNT,
  );

  return (
    <section className="py-16 sm:py-20">
      <Container>
        <SectionHeading
          title="Points of Interest in Zwolle"
          description="Van de Peperbus tot het Engelse Werk: de plekken die je onderweg tegenkomt."
          action={
            <Link to={POI_PATH} className="button border text-ink ripple">
              Alle bezienswaardigheden bekijken
            </Link>
          }
        />

        <ul className="mt-10 flex flex-wrap gap-x-8 gap-y-6">
          {highlights.map((point) => (
            <li
              key={point.id}
              className="flex w-28 flex-col items-center gap-2 text-center"
            >
              <span className="surface h-20 w-20 overflow-hidden rounded-full border border-line">
                <PoiCrop position={point.position} image={MAP_IMAGES.places} />
              </span>
              {/* two lines reserved for the name, so the categories line up across the row */}
              <span className="min-h-10 text-sm font-semibold text-ink">
                {point.name}
              </span>
              <span className="text-xs text-ink-muted">{point.category}</span>
            </li>
          ))}
        </ul>
      </Container>
    </section>
  );
}
