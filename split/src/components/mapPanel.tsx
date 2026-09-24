/*
mappanel — the framed map that every page draws its own overlay on.

one surface, one hairline, one picture from data/maps.js, plus whatever svg the
page passes as children (a route, the planner's selection, the pins).

label is an optional chip in the top left that names what the overlay shows. it
is a sibling of the frame and not a child, because the frame is overflow-hidden
so the overlay crops with the picture, and a chip inside it would be clipped too.

decorative is for a map the surrounding text already explains, like the login
illustration, where an alt description would only repeat the heading.
*/

import type { ReactNode } from "react";
import { MapImage } from "./mapArtwork.tsx";
import MapChip from "./mapChip.tsx";
import type { MapPicture } from "../types.ts";

interface MapPanelProps {
  image: MapPicture;
  /* overrides the picture's own description, for a map that shows something specific
     (a named route, the current selection) */
  alt?: string;
  /* true for a map the surrounding text already explains, like the login illustration */
  decorative?: boolean;
  /**
   * what the overlay on this map is.
   *
   * it is drawn as a sibling of the frame and not inside it, on purpose: the frame is
   * overflow-hidden so the overlay crops with the picture, and a chip in there would be
   * clipped with it too.
   */
  label?: string;
  className?: string;
  /* the overlay to draw on the picture */
  children?: ReactNode;
}

export default function MapPanel({
  image,
  alt,
  decorative = false,
  label,
  className = "",
  children,
}: MapPanelProps) {
  return (
    <div className={`relative ${className}`}>
      <div className="surface relative overflow-hidden rounded-xl border border-line">
        <MapImage image={image} alt={alt} decorative={decorative} />
        {children}
      </div>

      {label && <MapChip label={label} className="absolute left-4 top-4" />}
    </div>
  );
}
