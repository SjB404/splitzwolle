/* the home page's opening band — pitch, search and figures on the left, the map panel on the right; it owns the map position, because the layer buttons and the slider are two views of that one value */
/* whichever layer fills most of the panel is the lit button, so the two can never disagree — that is why layer is derived from position instead of stored */
/* id="home" because the top bar's Home link and the logo point at it */

import { useState } from "react";
import { Link } from "react-router-dom";
import Icon from "../components/icon.tsx";
import Container from "../components/container.tsx";
import SearchField from "../components/searchField.tsx";
import HeroMap from "./heroMap.tsx";
import { ROUTES_PATH } from "../data/navigation.ts";

/* the two map layers the hero can preview */
type MapLayer = "historical" | "current";

interface MapLayerOption {
  /* what the switch sends to the slider */
  id: MapLayer;
  label: string;
}

const MAP_LAYERS: MapLayerOption[] = [
  { id: "historical", label: "Historische kaart" },
  { id: "current", label: "Actuele kaart" },
];

/* headline figures under the search box */
interface HeroStat {
  value: string;
  label: string;
}

const HERO_STATS: HeroStat[] = [
  { value: "248", label: "routes" },
  { value: "1.9k", label: "gebruikers" },
  { value: "700 jaar", label: "stadsgeschiedenis" },
];

/* where the slider starts: 35% means mostly historic */
const INITIAL_MAP_POSITION = 35;

export default function Hero() {
  const [query, setQuery] = useState("");
  const [position, setPosition] = useState(INITIAL_MAP_POSITION);
  /* bumped only when a button moved the map, so the range re-mounts and takes the new value as its own */
  const [sliderKey, setSliderKey] = useState(0);

  const layer: MapLayer = position < 50 ? "historical" : "current";

  /* a layer button sends the slider to that end of its track; the range is uncontrolled, so it is re-mounted rather than written to, and BeerCSS is asked to repaint its filled track a frame later (a re-mounted input fires no event) */
  function showMapLayer(nextLayer: MapLayer) {
    setPosition(nextLayer === "historical" ? 0 : 100);
    setSliderKey((key) => key + 1);

    requestAnimationFrame(() =>
      globalThis.__BeerCssGlobals__?.slider?.updateAllSliders?.(),
    );
  }

  return (
    <section id="home" className="inverse-surface">
      {/* beerCSS's grid multiplies a gap by 11, so a big gap overflows a phone: row gap always, column gutter only from lg */}
      <Container className="grid items-center gap-y-10 py-16 sm:py-20 lg:gap-x-20">
        <div className="s12 l6 motion-safe:animate-rise">
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            Swolla <span aria-hidden="true">→</span> Zwolle
          </p>

          <h1 className="mt-5 text-4xl leading-[1.08] font-bold sm:text-5xl lg:text-6xl">
            Ontdek Zwolle <br /> toen en nu
          </h1>

          <p className="mt-6 max-w-lg text-[15px] leading-relaxed text-ink-muted">
            Maak je eigen wandel- of fietsroute, ontdek routes van andere
            gebruikers en beleef de stad met een historische kaartlaag naast de
            actuele plattegrond.
          </p>

          {/* the form only swallows Enter; the field's own action is the link */}
          <form
            onSubmit={(event) => event.preventDefault()}
            className="mt-8 max-w-lg"
          >
            <SearchField
              id="hero-search"
              label="Zoek een route, plek of wijk"
              placeholder="Zoek een route, plek of wijk…"
              value={query}
              onChange={setQuery}
              className="text-sm"
              action={
                <Link to={ROUTES_PATH} aria-label="Zoeken">
                  <Icon name="arrow_forward" />
                </Link>
              }
            />
          </form>

          {/* beerCSS's connected button group: one shared container with dividers and rounded outer corners, plus .active on the chosen segment; w-fit stops the nav stretching */}
          <nav className="group connected mt-6 w-fit" aria-label="Kaartlaag">
            {MAP_LAYERS.map(({ id, label }) => (
              <button
                key={id}
                type="button"
                onClick={() => showMapLayer(id)}
                aria-pressed={layer === id}
                className={`ripple text-sm ${layer === id ? "active" : ""}`}
              >
                {label}
              </button>
            ))}
          </nav>

          <dl className="mt-10 flex flex-wrap gap-x-10 gap-y-4 border-t border-line pt-6">
            {HERO_STATS.map(({ value, label }) => (
              <div key={label}>
                <dt className="font-display text-2xl font-bold text-heading">
                  {value}
                </dt>
                <dd className="text-xs uppercase tracking-wider text-ink-muted">
                  {label}
                </dd>
              </div>
            ))}
          </dl>
        </div>

        {/* the 120ms delay starts this just after the text, so the hero assembles instead of appearing at once */}
        <div className="s12 l6 motion-safe:animate-rise [animation-delay:120ms]">
          <HeroMap
            position={position}
            sliderKey={sliderKey}
            onPositionChange={setPosition}
          />
        </div>
      </Container>
    </section>
  );
}
