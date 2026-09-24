/*
homepage — the landing page: the hero, a preview of the route overview and a
preview of the points of interest.

the page is only that list. every band is its own file in src/sections, so the hero's
map or a route card can be changed without scrolling through a page first.

the bar, the footer and the shell belong to components/appLayout. the document title
is set here and not by a PageHeader, because the home page has no header band: its
hero is the band.
*/

import PageTitle from "../components/pageTitle.jsx";
import Hero from "../sections/hero.jsx";
import PointsOfInterestPreview from "../sections/pointsOfInterestPreview.jsx";
import PopularRoutesPreview from "../sections/popularRoutesPreview.jsx";

export default function HomePage() {
  return (
    <>
      <PageTitle title="Ontdek Zwolle toen en nu" />

      <Hero />
      <PopularRoutesPreview />
      <PointsOfInterestPreview />
    </>
  );
}
