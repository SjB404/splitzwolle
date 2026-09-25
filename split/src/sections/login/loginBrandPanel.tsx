/* the brand half of the account screen: the page header band at a smaller scale, as a grid column — beside the form above 993px, on top of it below */
/* the display line is a p and not a heading: the page's only heading is the form's "Inloggen", and a marketing line above it would announce itself first */
/* the map is decorative, because the text beside it already says what the app is */

import { Link } from "react-router-dom";
import Icon from "../../shared/primitives/icon.tsx";
import MapPanel from "../../shared/map/mapPanel.tsx";
import { RouteOverlay } from "../../shared/map/mapArtwork.tsx";
import { MAP_IMAGES } from "../../data/maps.ts";
import { HOME_PATH } from "../../data/navigation.ts";
import type { MapPosition } from "../../types.ts";

/* the route drawn on the panel's map, in the artwork's 0-100 space */
const LOGIN_ROUTE: MapPosition[] = [
  [18, 34],
  [36, 58],
  [58, 40],
  [78, 62],
];

const LOGIN_BENEFITS: string[] = [
  "Je opgeslagen routes op elk apparaat",
  "Je planning verder afmaken waar je gebleven was",
  "Reviews schrijven en plekken bewaren",
];

export default function LoginBrandPanel() {
  return (
    <div className="s12 l6 inverse-surface flex flex-col gap-8 p-8 sm:p-12">
      {/* the logo links home, because this page is outside the shell and the bar's own way back is not on screen */}
      <Link
        to={HOME_PATH}
        className="font-display text-lg font-bold tracking-tight text-ink"
      >
        Zwolle Routes
      </Link>

      <div>
        <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
          Welkom terug
        </p>
        <p className="font-display mt-5 text-display font-bold text-heading">
          Ontdek Zwolle toen en nu
        </p>
        <p className="mt-6 max-w-md text-[15px] leading-relaxed text-ink-muted">
          Log in om je opgeslagen routes terug te vinden, je planning af te
          maken en je ervaringen met andere wandelaars te delen.
        </p>
      </div>

      <MapPanel image={MAP_IMAGES.satellite} decorative>
        <RouteOverlay path={LOGIN_ROUTE} />
      </MapPanel>

      <ul className="flex flex-col gap-3 text-sm text-ink-muted">
        {LOGIN_BENEFITS.map((benefit) => (
          <li key={benefit} className="flex items-start gap-2">
            <Icon name="check_circle" className="text-base text-accent" />
            <span>{benefit}</span>
          </li>
        ))}
      </ul>

      {/* mt-auto pins the copyright to the bottom, which makes this half read as a page of its own beside the form */}
      <p className="mt-auto text-xs text-ink-muted">
        © {new Date().getFullYear()} Zwolle Routes
      </p>
    </div>
  );
}
