/*
pointsofinterestpreview — the home page's strip of places worth a detour.

the best rated places, as round crops of the illustrated map. it sorts with the
same filterPointsOfInterest the points of interest page uses, so "the five best"
cannot drift between the two pages.
*/

import { Link } from "react-router-dom";
import { PoiCrop } from "../components/mapArtwork.tsx";
import SectionHeading from "../components/sectionHeading.tsx";
import Container from "../components/container.tsx";
import { MAP_IMAGES } from "../data/maps.ts";
import { POI_PATH } from "../data/navigation.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
} from "../data/pointsOfInterest.ts";

/* how many places the strip shows before it links to the full list */
const POI_PREVIEW_COUNT = 5;

export default function PointsOfInterestPreview() {
  /* the overview's own filter at its resting state, sorted by rating. going through it
     is what stops "the five best" drifting between the two pages. */
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
              {/* two lines are reserved for the name, so the categories line up
                  across the row whether a name wraps or not */}
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
