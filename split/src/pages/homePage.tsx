/* the landing page — hero plus two previews; its bands live in src/sections, and it sets its own title because it has no header band */

import PageTitle from "../components/pageTitle.tsx";
import Hero from "../sections/hero.tsx";
import PointsOfInterestPreview from "../sections/pointsOfInterestPreview.tsx";
import PopularRoutesPreview from "../sections/popularRoutesPreview.tsx";

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
