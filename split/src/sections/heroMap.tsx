/* the hero's map panel — two maps stacked, a route over them, the historic/current slider and the stop count; it holds no state, because position comes from Hero */
/* the range is uncontrolled: a controlled one writes the value back on every render, and the thumb jumps backwards when a render misses the pointer */
/* sliderKey re-mounts the input when a layer button moved the map, because writing to the node leaves React's value tracker stale and swallows the next drag onto that number */
/* the historic map fades through --historic-opacity read by inheritance, so a drag patches one style instead of re-rendering two multi-megabyte pictures */

import type { CSSProperties } from "react";
import { MapImage, RouteOverlay } from "../components/mapArtwork.tsx";
import MapChip from "../components/mapChip.tsx";
import { HERO_CURRENT_IMAGE, MAP_IMAGES } from "../data/maps.ts";
import type { MapPosition } from "../types.ts";

/* the route drawn on the hero map, in the artwork's own 0-100 space */
const HERO_ROUTE: MapPosition[] = [
  [32.8, 26],
  [39.7, 20],
  [58, 34],
  [70, 50],
  [36, 58],
];

interface HeroMapProps {
  /* 0 = fully historic, 100 = present day; Hero owns it, because the layer buttons and the slider are two views of one value */
  position: number;
  /* bumped when a layer button moved the map, so the range re-mounts instead of being written to */
  sliderKey: number;
  /* the slider reports a drag back up, because Hero owns the value */
  onPositionChange: (position: number) => void;
}

export default function HeroMap({
  position,
  sliderKey,
  onPositionChange,
}: HeroMapProps) {
  const historicOpacity = (1 - position / 100).toFixed(2);

  /* the one inline style in the app, and the design allows it: the css reads this custom property, so a drag patches one style instead of re-creating two pictures */
  const fadeStyle = { "--historic-opacity": historicOpacity } as CSSProperties;

  return (
    <div
      className="overflow-hidden rounded-xl surface border border-line"
      style={fadeStyle}
    >
      {/* the current map sets the frame and the historic one is stacked exactly on top; both are the same export of the same view, so they line up pixel for pixel */}
      <div className="relative">
        <MapImage image={HERO_CURRENT_IMAGE} priority />
        <MapImage
          image={MAP_IMAGES.historic}
          className="historic-layer absolute inset-0 h-full w-full object-cover"
        />

        {/* our own layer: the route the app drew, on top of whichever map shows */}
        <RouteOverlay path={HERO_ROUTE} />

        {/* inside the picture frame, so it cannot spill over the card edge when the column narrows */}
        <div className="pointer-events-none absolute left-4 top-4">
          <MapChip label={`${HERO_ROUTE.length} stopplaatsen`} />
        </div>
      </div>

      {/* on a phone the switcher sits under the map: as an overlay it covered a third of the picture and hid the thing it controls */}
      <div className="surface px-5 py-3 sm:absolute sm:inset-x-0 sm:bottom-0 sm:pb-4 sm:pt-3">
        {/* mx-0 w-full cancel beerCSS's inline margins on .slider, so the track lines up with the padding */}
        <label className="slider mx-0 w-full">
          <span className="sr-only">
            Schakel tussen de historische en de actuele kaart
          </span>
          <input
            key={sliderKey}
            type="range"
            min="0"
            max="100"
            defaultValue={position}
            onChange={(event) =>
              onPositionChange(Number(event.currentTarget.value))
            }
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
