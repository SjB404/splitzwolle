/* the home page's strip of the places worth a detour — its own search bar over the same sort the poi page uses, so "the five best" cannot drift */
/* the matches come from the search index (data/search.ts) and not from the data module, so this strip is already wired the way the api will be */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import { PoiCrop } from "../../shared/map/mapArtwork.tsx";
import EmptyState from "../../shared/content/emptyState.tsx";
import SectionHeading from "../../shared/layout/sectionHeading.tsx";
import SectionSearchBar from "../../shared/filters/sectionSearchBar.tsx";
import Container from "../../shared/layout/container.tsx";
import { MAP_IMAGES } from "../../data/maps.ts";
import { POI_PATH } from "../../data/navigation.ts";
import { searchIds } from "../../data/search.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
} from "../../data/pointsOfInterest.ts";

/* how many places the strip shows before it links to the full list */
const POI_PREVIEW_COUNT = 5;

export default function PointsOfInterestPreview() {
  const [query, setQuery] = useState("");

  /* the overview's own filter at its resting state, so the two pages agree on "the five best" */
  const matches = useMemo(() => {
    const ids = searchIds("poi", query);

    return filterPointsOfInterest(INITIAL_POI_FILTERS).filter((point) =>
      ids.has(point.id),
    );
  }, [query]);

  return (
    /* content-visibility keeps this band, which sits under the fold, out of the first paint and out of every resize until it is scrolled to; the intrinsic size is the band's own measured height, so the scrollbar does not move when it is rendered */
    <section className="py-band [contain-intrinsic-size:auto_32rem] [content-visibility:auto]">
      <Container>
        <SectionHeading
          title="Points of Interest in Zwolle"
          description="Van de Peperbus tot het Engelse Werk: de plekken die je onderweg tegenkomt."
        />

        <SectionSearchBar
          id="home-poi-search"
          label="Zoek in de bezienswaardigheden"
          placeholder="Zoek op naam, wijk of categorie…"
          value={query}
          onChange={setQuery}
          resultLabel={`${matches.length} ${
            matches.length === 1 ? "bezienswaardigheid" : "bezienswaardigheden"
          }`}
          action={
            <Link to={POI_PATH} className="button border text-ink ripple">
              Alle bezienswaardigheden bekijken
            </Link>
          }
        />

        {matches.length === 0 ? (
          <EmptyState
            icon="place"
            title="Geen bezienswaardigheden gevonden"
            titleLevel={3}
            description="Zoek op een andere naam, wijk of categorie, of bekijk alle plekken."
          />
        ) : (
          <ul className="mt-10 flex flex-wrap gap-x-6 gap-y-8">
            {matches.slice(0, POI_PREVIEW_COUNT).map((point) => (
              <li
                key={point.id}
                /* the tiles divide the row instead of sitting at a fixed 112px, so the strip fills the band at every width; flex and not a grid, because a bare `grid` class is beerCSS's 12 column grid (§2) */
                className="flex basis-[calc(50%-0.75rem)] flex-col items-center gap-2 text-center sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(20%-1.2rem)]"
              >
                <span className="surface h-20 w-20 overflow-hidden rounded-full border border-line">
                  <PoiCrop
                    position={point.position}
                    image={MAP_IMAGES.places}
                  />
                </span>
                {/* two lines reserved for the name, so the categories line up across the row */}
                <span className="min-h-10 text-sm font-semibold text-ink">
                  {point.name}
                </span>
                <span className="text-xs text-ink-muted">{point.category}</span>
              </li>
            ))}
          </ul>
        )}
      </Container>
    </section>
  );
}
