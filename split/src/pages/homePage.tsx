/* the landing page — hero plus two previews; its bands live in src/sections, and it sets its own title because it has no header band */

import PageTitle from "../shared/layout/pageTitle.tsx";
import Hero from "../sections/home/hero.tsx";
import PointsOfInterestPreview from "../sections/home/pointsOfInterestPreview.tsx";
import PopularRoutesPreview from "../sections/home/popularRoutesPreview.tsx";

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
