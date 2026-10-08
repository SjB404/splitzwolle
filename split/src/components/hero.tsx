/* the range is uncontrolled: a controlled one writes the value back and the thumb jumps on a missed render */

import { memo, useState } from "react";
import type { CSSProperties } from "react";
import "./hero.css";
import Container from "./container.tsx";
import { MAP_IMAGES, MAP_SIZE } from "../data/maps.ts";
import type { MapPicture } from "../types.ts";

type MapLayer = "historic" | "current";

const MAP_LAYER_LABELS: Record<MapLayer, string> = {
  historic: "Toen",
  current: "Nu",
};

const RAIL_ENDS: MapLayer[] = ["current", "historic"];

const INITIAL_MAP_POSITION = 0;

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
  /* bump remounts the range: writing to the node leaves React's value tracker stale */
  const [sliderKey, setSliderKey] = useState(0);

  const layer: MapLayer = position < 50 ? "historic" : "current";

  const historicOpacity = (1 - position / 100).toFixed(2);

  /* the css reads --historic-opacity; a drag patches one style instead of re-rendering */
  const fadeStyle = { "--historic-opacity": historicOpacity } as CSSProperties;

  /* beerCSS repaints the filled track only on events: remount and update in rAF (none fires) */
  function showMapLayer(nextLayer: MapLayer) {
    setPosition(nextLayer === "historic" ? 0 : 100);
    setSliderKey((key) => key + 1);

    requestAnimationFrame(() =>
      globalThis.__BeerCssGlobals__?.slider?.updateAllSliders?.(),
    );
  }

  return (
    <section id="home" className="inverse-surface">
      <Container className="py-hero">
        <h1 className="text-display font-bold">
          <span className="block lg:inline">Ontdek Zwolle</span>{" "}
          <span className="block lg:inline">toen en nu</span>
        </h1>

        <div
          /* contain: resizing the map must not invalidate the page; the stacked pictures are heavy to re-raster */
          className="surface [contain:layout_paint] mx-auto mt-6 flex w-fit flex-col overflow-hidden rounded-box border-2 border-line motion-safe:animate-rise sm:mt-8 sm:flex-row"
          style={fadeStyle}
        >
          {/* rounded-none: the panel clips its own corner, so children stay square */}
          <div className="relative rounded-none sm:min-w-0">
            <MapImage
              image={MAP_IMAGES.satellite}
              className="mx-auto h-auto max-h-[calc(100svh-14rem)] w-auto max-w-full object-contain"
              priority
            />
            <MapImage
              image={MAP_IMAGES.historic}
              className="historic-layer absolute inset-0 h-full w-full object-contain"
            />
          </div>

          <div className="flex w-full items-center gap-3 rounded-none border-t-2 border-line px-gutter py-3 sm:w-16 sm:flex-none sm:flex-col sm:gap-1 sm:border-t-0 sm:border-l-2 sm:px-2">
            {RAIL_ENDS.map((id, index) => (
              <button
                key={id}
                type="button"
                onClick={() => showMapLayer(id)}
                aria-pressed={layer === id}
                /* bg-transparent is tailwind; beerCSS .transparent forces color: inherit !important */
                /* h-10 everywhere: sm:h-9 + tap-target measured 44px, under material 3's 48px */
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
                  /* input takes the label's full 40px hit area; a 16px track is too thin to hit */
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
