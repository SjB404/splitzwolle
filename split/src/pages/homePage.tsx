/* the landing page — hero plus two previews; its bands live in src/sections, and it sets its own title because it has no header band */

import PageTitle from "../components/pageTitle.tsx";
import Hero from "../components/hero.tsx";
import PointsOfInterestPreview from "../components/pointsOfInterestPreview.tsx";
import PopularRoutesPreview from "../components/popularRoutesPreview.tsx";

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
