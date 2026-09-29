/* the framed map every page draws its own overlay on — one surface, one hairline, one picture plus whatever svg the page passes as children */

import type { ReactNode } from "react";
import { MapImage } from "./mapArtwork.tsx";
import MapChip from "./mapChip.tsx";
import type { MapPicture } from "../../types.ts";

interface MapPanelProps {
  image: MapPicture;
  /* overrides the picture's description, for a map that shows something specific */
  alt?: string;
  /* true for a map the surrounding text already explains, like the login illustration */
  decorative?: boolean;
  /** what the overlay is — a sibling of the frame, because the frame is overflow-hidden for the overlay's sake and would clip a chip inside it */
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
