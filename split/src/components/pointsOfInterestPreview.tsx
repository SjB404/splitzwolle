/* the home page's strip of the places worth a detour — its own search bar over the same sort the poi page uses, so "the five best" cannot drift */
/* the matches come from the search index (data/search.ts) and not from the data module, so this strip is already wired the way the api will be */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import Icon from "./icon.tsx";
import EmptyState from "./emptyState.tsx";
import SectionHeading from "./sectionHeading.tsx";
import SectionSearchBar from "./sectionSearchBar.tsx";
import Container from "./container.tsx";
import { POI_PATH, pointOfInterestPath } from "../data/navigation.ts";
import { searchIds } from "../data/search.ts";
import {
  INITIAL_POI_FILTERS,
  filterPointsOfInterest,
  poiCategoryIcon,
} from "../data/pointsOfInterest.ts";
import { PLACE_IMAGES } from "../data/placeImages.ts";

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
          title="Bezienswaardigheden in Zwolle"
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
            /* h-12 is the field's own 48px, so the action sits in the row at the field's height (§7) */
            <Link to={POI_PATH} className="button border text-ink ripple h-12">
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
            {matches.slice(0, POI_PREVIEW_COUNT).map((point) => {
              const image = point.image ?? PLACE_IMAGES[point.id];

              return (
                <li
                  key={point.id}
                  /* the tiles divide the row instead of sitting at a fixed 112px, so the strip fills the band at every width; flex and not a grid, because a bare `grid` class is beerCSS's 12 column grid (§2) */
                  className="flex basis-[calc(50%-0.75rem)] sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(20%-1.2rem)]"
                >
                  {/* the whole tile is one link: the strip shows the name and the category, and the rest of the place lives on the card its url names — the places page opens with that card chosen (DESIGN.md §7) */}
                  <Link
                    to={pointOfInterestPath(point.id)}
                    className="group flex w-full flex-col items-center gap-2 text-center"
                  >
                    {/* the place's own picture, and its category glyph until there is one: the hand-placed artwork crop went with the rest of the artwork layer */}
                    <span className="surface-container flex h-20 w-20 items-center justify-center overflow-hidden rounded-full border-2 border-line">
                      {image ? (
                        <img
                          src={image}
                          alt=""
                          aria-hidden="true"
                          className="h-full w-full object-cover"
                          loading="lazy"
                        />
                      ) : (
                        <Icon
                          name={poiCategoryIcon(point.category)}
                          className="text-2xl text-ink-muted"
                        />
                      )}
                    </span>
                    {/* two lines reserved for the name, so the categories line up across the row; the hover is the bar's own recipe, an underline and the muted line coming up to full ink */}
                    <span className="min-h-10 text-sm font-semibold text-ink group-hover:underline">
                      {point.name}
                    </span>
                    <span className="text-xs text-ink-muted transition-colors group-hover:text-ink">
                      {point.category}
                    </span>
                  </Link>
                </li>
              );
            })}
          </ul>
        )}
      </Container>
    </section>
  );
}
