/* the map pictures — imported rather than served from public/, so Vite fingerprints them and a redeploy cannot serve a stale map; all five are 1520 x 984 WebP at 400-570 kB (they were 3.3-3.6 MB PNGs: the browser re-encodes nothing, so the weight is whatever the export is) */

/* the exports differ only in what is burned into the picture: historic (one half of the hero's cross-fade), satellite (the other half, and decoration), places (round crops), terrain (the poi map, so its pins are only ours), roads (anything with an app drawn route) */

import type { MapImageId, MapPicture } from "../types.ts";

import historic1652 from "../assets/maps/zwolle-historic-1652.webp";
import satellite from "../assets/maps/zwolle-satellite.webp";
import satellitePlaces from "../assets/maps/zwolle-satellite-places.webp";
import satelliteTerrain from "../assets/maps/zwolle-satellite-places-terrain.webp";
import satelliteRoads from "../assets/maps/zwolle-satellite-places-terrain-roads.webp";

export const MAP_SIZE = { width: 1520, height: 984 };

/* alt describes the picture; a caller using it as decoration passes `decorative` and the text is dropped (see shared/map/mapArtwork.tsx) */
export const MAP_IMAGES: Record<MapImageId, MapPicture> = {
  historic: {
    src: historic1652,
    alt: "Historische kaart van Zwolle (Swolla) uit 1652",
  },
  satellite: { src: satellite, alt: "Luchtfoto van Zwolle" },
  places: {
    src: satellitePlaces,
    alt: "Luchtfoto van Zwolle met plaatsaanduidingen",
  },
  terrain: { src: satelliteTerrain, alt: "Luchtfoto van Zwolle met reliëf" },
  roads: {
    src: satelliteRoads,
    alt: "Luchtfoto van Zwolle met wegen en plaatsaanduidingen",
  },
};
