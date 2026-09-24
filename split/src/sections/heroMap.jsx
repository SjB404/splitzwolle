/*
heromap — the hero's map panel: two maps stacked, a route drawn over them, the
historic/current slider, and the stop count.

it holds no state. position (0 = fully historic, 100 = present day) comes from
Hero, because the layer buttons and the slider are two views of one value.

three things here are deliberate:

the range is uncontrolled. a controlled one makes React write the value back on
every render, and the thumb jumps backwards when a render misses the pointer.

sliderKey re-mounts the input when a layer button moved the map. writing to the
node instead leaves React's value tracker stale, and the next drag onto that same
number gets ignored.

the historic map fades through --historic-opacity, set on the card and read by
inheritance (.historic-layer in index.css). that is one style patch per drag
instead of re-rendering two multi-megabyte pictures.

no shadow, as everywhere in this app: tone and hairlines separate surfaces.
surface (not surface-container-lowest) is what lifts the card off the band in
both themes.
*/

import { MapImage, RouteOverlay } from "../components/mapArtwork.jsx";
import { HERO_CURRENT_IMAGE, MAP_IMAGES } from "../data/maps.js";

/* the route drawn on the hero map, in the artwork's own 0-100 space
   (see components/mapArtwork.jsx) */
const HERO_ROUTE = [
  [32.8, 26],
  [39.7, 20],
  [58, 34],
  [70, 50],
  [36, 58],
];

export default function HeroMap({ position, sliderKey, onPositionChange }) {
  const historicOpacity = (1 - position / 100).toFixed(2);

  return (
    <div
      className="overflow-hidden rounded-xl surface border border-line"
      style={{ "--historic-opacity": historicOpacity }}
    >
      {/* the current map sets the frame. the historic one is stacked exactly on top
          and faded out as the slider moves to Actueel. both are the same export of
          the same view, so they line up pixel for pixel. */}
      <div className="relative">
        <MapImage image={HERO_CURRENT_IMAGE} priority />
        <MapImage
          image={MAP_IMAGES.historic}
          className="historic-layer absolute inset-0 h-full w-full object-cover"
        />

        {/* our own layer: the route the app drew, on top of whichever map shows */}
        <RouteOverlay path={HERO_ROUTE} />

        {/* inside the picture frame, so it cannot spill over the card edge when the
            column narrows */}
        <div className="pointer-events-none absolute left-4 top-4">
          <span className="chip surface-container-lowest border border-line text-xs font-semibold">
            <span
              className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500"
              aria-hidden="true"
            />
            {HERO_ROUTE.length} stopplaatsen
          </span>
        </div>
      </div>

      {/* the historic/current switcher. on a phone it sits under the map instead of
          over it, because as an overlay it covered a third of the picture and hid
          the thing it controls. from sm up there is room to lie across the bottom
          of the map again. */}
      <div className="surface px-5 py-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:pb-4 sm:pt-3">
        {/* mx-0 w-full cancels the inline margins beerCSS puts on .slider, so the
            track lines up with the padding and the labels below it */}
        <label className="slider mx-0 w-full">
          <span className="sr-only">Schakel tussen de historische en de actuele kaart</span>
          <input
            key={sliderKey}
            type="range"
            min="0"
            max="100"
            defaultValue={position}
            onChange={(event) => onPositionChange(Number(event.currentTarget.value))}
          />
          {/* the empty span is the filled part of the slider track */}
          <span />
        </label>

        <div className="flex items-center justify-between text-[11px] font-medium tracking-wide text-ink-muted">
          <span>Historisch</span>
          <span aria-hidden="true">⇄</span>
          <span>Actueel</span>
        </div>
      </div>
    </div>
  );
}
