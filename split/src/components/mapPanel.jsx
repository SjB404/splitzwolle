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

import { MapImage } from "./mapArtwork.jsx";

export default function MapPanel({
  image,
  alt,
  decorative = false,
  label,
  className = "",
  children,
}) {
  return (
    <div className={`relative ${className}`}>
      <div className="surface relative overflow-hidden rounded-xl border border-line">
        <MapImage image={image} alt={alt} decorative={decorative} />
        {children}
      </div>

      {label && (
        <span className="chip surface-container-lowest border border-line absolute left-4 top-4 text-xs font-semibold">
          {/* The dot wears the artwork's own route colour, which is the one place
              fixed palette values are correct (§8). */}
          <span
            className="mr-1.5 inline-block h-2 w-2 rounded-full bg-orange-500"
            aria-hidden="true"
          />
          {label}
        </span>
      )}
    </div>
  );
}
