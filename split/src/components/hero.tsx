/* the home page's opening band — the headline over the map panel, both as wide as the page gutter allows */
/* the band is one screen tall: the map's height is capped by the viewport, and the picture is centre cropped when the band is wider than its own 1520:984 ratio */
/* id="home" because the top bar's Home link and the logo point at it */

/* the panel itself: the 1652 engraving stacked on the satellite photo, with the cross-fade slider and its two layer words in a rail beside the picture from sm up */
/* the panel owns the position, because the slider and the two words are three views of one value */
/* the range is uncontrolled: a controlled one writes the value back on every render, and the thumb jumps backwards when a render misses the pointer */
/* sliderKey re-mounts the input when a word moved the map, because writing to the node leaves React's value tracker stale and swallows the next drag onto that number */
/* the historic map fades through --historic-opacity read by inheritance, so a drag patches one style instead of re-rendering two multi-megabyte pictures */
/* the rail is the same markup turned with its container: beside the map it is a column and the slider is a quarter turn away from horizontal, and on a phone it is a row under the map, because a strip 190px tall cannot hold a vertical track */
/* the turn needs no measured length: the slider's width is `100cqh`, the height of the box it stands in, which the rail's own layout decides */

import { memo, useState } from "react";
import type { CSSProperties } from "react";
import Container from "./container.tsx";
import { MAP_IMAGES, MAP_SIZE } from "../data/maps.ts";
import type { MapPicture } from "../types.ts";

/* the two ends of the slider, which are also the words that send it there; the words are short because the rail is a strip, and "toen en nu" is what the headline above the map already says */
type MapLayer = "historical" | "current";

const MAP_LAYER_LABELS: Record<MapLayer, string> = {
  historical: "Toen",
  current: "Nu",
};

/* top to bottom: the past sits at the bottom of the track and the present at the top, the way a timeline is read */
const RAIL_ENDS: MapLayer[] = ["current", "historical"];

/* where the slider starts: 0 is the historic map at full strength, which is the half of the pairing the page leads with */
const INITIAL_MAP_POSITION = 0;

/* width and height are declared so the page cannot reflow while a multi-megabyte picture arrives; the hero's current map is part of the first screen and loads eagerly, the historic one lazily */
const MapImage = memo(function MapImage({
  image,
  className,
  priority = false,
}: {
  image: MapPicture;
  className: string;
  priority?: boolean;
}) {
  return (
    <img
      src={image.src}
      alt={image.alt}
      width={MAP_SIZE.width}
      height={MAP_SIZE.height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`block ${className}`}
    />
  );
});

export default function Hero() {
  const [position, setPosition] = useState(INITIAL_MAP_POSITION);
  /* bumped only when a word moved the map, so the range re-mounts and takes the new value as its own */
  const [sliderKey, setSliderKey] = useState(0);

  const layer: MapLayer = position < 50 ? "historical" : "current";

  const historicOpacity = (1 - position / 100).toFixed(2);

  /* the one inline style in the app, and the design allows it: the css reads this custom property, so a drag patches one style instead of re-creating two pictures */
  const fadeStyle = { "--historic-opacity": historicOpacity } as CSSProperties;

  /* a word sends the slider to that end of its track; the range is uncontrolled, so it is re-mounted rather than written to, and BeerCSS is asked to repaint its filled track a frame later (a re-mounted input fires no event) */
  function showMapLayer(nextLayer: MapLayer) {
    setPosition(nextLayer === "historical" ? 0 : 100);
    setSliderKey((key) => key + 1);

    requestAnimationFrame(() =>
      globalThis.__BeerCssGlobals__?.slider?.updateAllSliders?.(),
    );
  }

  return (
    <section id="home" className="inverse-surface">
      {/* py-hero stands in for the section rhythm's py-band: this band is one screen tall, and the map is what the room is for */}
      <Container className="py-hero">
        {/* one headline in two spans: next to each other where the band is wide, on top of each other where it is not */}
        <h1 className="text-display font-bold">
          <span className="block lg:inline">Ontdek Zwolle</span>{" "}
          <span className="block lg:inline">toen en nu</span>
        </h1>

        <div
          /* contain keeps a resize of the map inside the panel instead of invalidating the page around it, and the two stacked pictures are the heaviest thing on the page to re-raster while a window is dragged */
          className="surface [contain:layout_paint] mt-6 flex flex-col overflow-hidden rounded-box border-2 border-line motion-safe:animate-rise sm:mt-8 sm:flex-row"
          style={fadeStyle}
        >
          {/* the current map sets the frame and the historic one is stacked on top of it; the frame is as tall as the band can afford, so the picture keeps the height the rail no longer costs it */}
          <div className="relative w-full flex-none sm:min-w-0 sm:flex-1">
            <MapImage
              image={MAP_IMAGES.satellite}
              className="h-auto max-h-[calc(100svh-14rem)] w-full object-cover"
              priority
            />
            <MapImage
              image={MAP_IMAGES.historic}
              className="historic-layer absolute inset-0 h-full w-full object-cover"
            />
          </div>

          {/* the rail: the words are the track's two ends, so picking a side and dragging to it are the same action */}
          <div className="flex w-full items-center gap-3 border-t-2 border-line px-gutter py-3 sm:w-16 sm:flex-none sm:flex-col sm:gap-1 sm:border-t-0 sm:border-l-2 sm:px-2">
            {RAIL_ENDS.map((id, index) => (
              <button
                key={id}
                type="button"
                onClick={() => showMapLayer(id)}
                aria-pressed={layer === id}
                /* the words are the track's two ends: "Nu" leads a left-to-right track on a phone and sits at the top of the rail above sm; px-0 takes back beerCSS's 1rem button padding, which would make a two letter word wider than the rail, and bg-transparent is a tailwind utility and not beerCSS's .transparent, whose `color: inherit !important` would take the muted ink away from the quiet word */
                /* h-10 at every width: a word was `sm:h-9`, and `tap-target` only adds 4px a side, so the 36px it became above sm left a 44px hit area — under material 3's 48px */
                className={`tap-target ripple flex h-10 flex-none items-center bg-transparent px-0 text-xs ${
                  index === 0 ? "order-3 sm:order-1" : "order-1 sm:order-3"
                } ${
                  layer === id
                    ? "font-semibold text-ink"
                    : "font-medium text-ink-muted hover:text-ink"
                }`}
              >
                {MAP_LAYER_LABELS[id]}
              </button>
            ))}

            {/* the track stands in a box whose long axis is the rail's, so the same label turns with the box; the 40px height is the phone row's, and above sm the box's height comes from the flex line instead */}
            <div className="relative order-2 h-10 min-w-0 flex-1 [container-type:size] sm:h-auto sm:w-full">
              {/* mx-0 cancels beerCSS's inline margins on .slider */}
              <label className="slider mx-0 w-full sm:absolute sm:left-1/2 sm:top-1/2 sm:w-[100cqh] sm:-translate-x-1/2 sm:-translate-y-1/2 sm:-rotate-90">
                <span className="sr-only">
                  Schakel tussen de historische kaart van 1652 en de actuele
                  plattegrond
                </span>
                <input
                  key={sliderKey}
                  type="range"
                  min="0"
                  max="100"
                  defaultValue={position}
                  onChange={(event) =>
                    setPosition(Number(event.currentTarget.value))
                  }
                  /* the track is 16px thick and a rail is narrow, so the input takes all 40px of the label as its hit area — a 16px strip is a fiddly thing to hit with a thumb */
                  className="[block-size:100%]"
                />
                {/* the empty span is the filled part of the slider track */}
                <span />
              </label>
            </div>
          </div>
        </div>
      </Container>
    </section>
  );
}
