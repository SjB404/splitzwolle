/* the home page's strip of the route overview — its own search bar and the cards that matched; how many routes a preview holds lives in data/routes.ts */
/* the matches come from the search index (data/search.ts) and not from the data module, so this strip is already wired the way the api will be */

import { useMemo, useState } from "react";
import { Link } from "react-router-dom";
import EmptyState from "../../shared/content/emptyState.tsx";
import RouteGrid from "../../shared/content/routeGrid.tsx";
import SectionHeading from "../../shared/layout/sectionHeading.tsx";
import SectionSearchBar from "../../shared/filters/sectionSearchBar.tsx";
import Container from "../../shared/layout/container.tsx";
import { ROUTES_PATH } from "../../data/navigation.ts";
import { ROUTES, ROUTE_PREVIEW_COUNT } from "../../data/routes.ts";
import { searchIds } from "../../data/search.ts";

export default function PopularRoutesPreview() {
  const [query, setQuery] = useState("");

  /* the search answers with ids, so the strip keeps rendering the routes the rest of the app renders */
  const matches = useMemo(() => {
    const ids = searchIds("route", query);
    return ROUTES.filter((route) => ids.has(route.id));
  }, [query]);

  return (
    /* content-visibility keeps this band, which sits under the fold, out of the first paint and out of every resize until it is scrolled to; the intrinsic size is the band's own measured height, so the scrollbar does not move when it is rendered */
    <section className="py-band [contain-intrinsic-size:auto_48rem] [content-visibility:auto]">
      <Container>
        <SectionHeading
          title="Populaire routes"
          description="De hoogst gewaardeerde routes van deze maand, gekozen door de community."
        />

        <SectionSearchBar
          id="home-route-search"
          label="Zoek in de populaire routes"
          placeholder="Zoek op titel, wijk of thema…"
          value={query}
          onChange={setQuery}
          resultLabel={`${matches.length} ${
            matches.length === 1 ? "route" : "routes"
          }`}
          action={
            /* a link dressed as a button needs .button (a bare <a> has no button box), and border defaults to primary text — 2.5:1 on white — so the ink comes from the theme */
            <Link to={ROUTES_PATH} className="button border text-ink ripple">
              Alle routes bekijken
            </Link>
          }
        />

        {matches.length === 0 ? (
          <EmptyState
            icon="search"
            title="Geen routes gevonden"
            titleLevel={3}
            description="Zoek op een andere wijk, titel of thema, of bekijk alle routes."
          />
        ) : (
          /* a preview keeps showing a strip of what matched, and the cards carry no "Populair" tag: the section title already says it */
          <RouteGrid
            routes={matches.slice(0, ROUTE_PREVIEW_COUNT)}
            showPopular={false}
          />
        )}
      </Container>
    </section>
  );
}
