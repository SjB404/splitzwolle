/* the hero's two pictures and the one component that draws a picture — every other map in the app is google maps (docs/DESIGN.md §8) */
/* the historic/current cross fade is not here: the caller stacks the two pictures and fades the top one with the inherited --historic-opacity */

import { memo } from "react";
import { MAP_SIZE } from "../../data/maps.ts";
import type { MapPicture } from "../../types.ts";

interface MapImageProps {
  image: MapPicture;
  /* sizing. the default lets the picture decide its own height */
  className?: string;
  /* true for the one image that is part of the first screen (the hero's) */
  priority?: boolean;
  /* true when the text around it already describes the map */
  decorative?: boolean;
  /* overrides the picture's own description, for a picture that shows something specific */
  alt?: string;
}

/* width and height are declared so the page cannot reflow while a multi-megabyte picture arrives; priority marks the one image on the first screen (the hero's), the rest load lazily */
export const MapImage = memo(function MapImage({
  image,
  className = "h-auto w-full",
  priority = false,
  decorative = false,
  alt,
}: MapImageProps) {
  return (
    <img
      src={image.src}
      alt={decorative ? "" : (alt ?? image.alt)}
      aria-hidden={decorative ? "true" : undefined}
      width={MAP_SIZE.width}
      height={MAP_SIZE.height}
      decoding="async"
      loading={priority ? "eager" : "lazy"}
      fetchPriority={priority ? "high" : "auto"}
      className={`block ${className}`}
    />
  );
});
