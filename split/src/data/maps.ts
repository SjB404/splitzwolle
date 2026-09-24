/*
map imagery — the pictures every map is built on.

six exports of the same view of zwolle, each with a different amount burned into the
picture. they live in src/assets/maps/ and are imported rather than referenced as
public urls: an imported asset gets a fingerprinted filename, so a redeployed map can
never be served from a stale cache. that is the whole reason an asset belongs in src/
instead of public/.

which surface uses which is a readability choice, not a taste one:

  historic  - the 1652 "Swolla" engraving: the hero's historic layer
  satellite - plain imagery: decoration (the login panel)
  places    - plus place markers: the small round crops, where one marker says which
              place it is
  terrain   - plus relief shading: the points of interest map, so the only pins on it
              are the app's own
  roads     - plus markers and roads: anything with a route drawn over it, because
              burnt in labels would fight the line the app draws itself

all six are 1520 x 984. declaring that size on the img is what stops the page
reflowing while a multi-megabyte png is on its way in.

these are big files, about 3.5 mb each. vite copies assets and does not re-encode
them, so they are served as they are. converting them to webp at the same size would
cut that to roughly a tenth with no visible difference, but that is a job for whoever
owns the imagery.
*/

import type { MapImageId, MapPicture } from "../types.ts";

import historic1652 from "../assets/maps/zwolle-historic-1652.png";
import satellite from "../assets/maps/zwolle-satellite.png";
import satellitePlaces from "../assets/maps/zwolle-satellite-places.png";
import satelliteTerrain from "../assets/maps/zwolle-satellite-places-terrain.png";
import satelliteRoads from "../assets/maps/zwolle-satellite-places-terrain-roads.png";

export const MAP_SIZE = { width: 1520, height: 984 };

/* `alt` describes the picture itself; a caller that uses it as decoration passes
   `decorative` and the text is dropped (the surrounding card or heading already
   says what the map shows — see components/mapArtwork.tsx). */
export const MAP_IMAGES: Record<MapImageId, MapPicture> = {
  historic: { src: historic1652, alt: "Historische kaart van Zwolle (Swolla) uit 1652" },
  satellite: { src: satellite, alt: "Luchtfoto van Zwolle" },
  places: { src: satellitePlaces, alt: "Luchtfoto van Zwolle met plaatsaanduidingen" },
  terrain: { src: satelliteTerrain, alt: "Luchtfoto van Zwolle met reliëf" },
  roads: {
    src: satelliteRoads,
    alt: "Luchtfoto van Zwolle met wegen en plaatsaanduidingen",
  },
};

/* What the hero shows behind the "Actuele kaart" of its slider. Point this at a
   richer export (the same view with roads, borders *and* labels) once that file is
   in `src/assets/maps/` — one line, no other change. */
export const HERO_CURRENT_IMAGE: MapPicture = MAP_IMAGES.roads;
