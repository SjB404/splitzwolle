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

const POI_PREVIEW_COUNT = 5;

export default function PointsOfInterestPreview() {
  const [query, setQuery] = useState("");

  const matches = useMemo(() => {
    const ids = searchIds("poi", query);

    return filterPointsOfInterest(INITIAL_POI_FILTERS).filter((point) =>
      ids.has(point.id),
    );
  }, [query]);

  return (
    /* content-visibility:auto keeps this band out of the first paint; 32rem is its measured height */
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
                  /* flex not grid: a bare `grid` class is beerCSS's 12 column grid */
                  className="flex basis-[calc(50%-0.75rem)] sm:basis-[calc(33.333%-1rem)] lg:basis-[calc(20%-1.2rem)]"
                >
                  <Link
                    to={pointOfInterestPath(point.id)}
                    className="group flex w-full flex-col items-center gap-2 text-center"
                  >
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
                    {/* min-h-10 reserves two name lines so the category labels line up across the row */}
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
