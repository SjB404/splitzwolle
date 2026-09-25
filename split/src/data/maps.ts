/* the map pictures — imported rather than served from public/, so Vite fingerprints them and a redeploy cannot serve a stale map; all six are 1520 x 984 and ~3.5 MB, since Vite copies assets without re-encoding them */

/* the exports differ only in what is burned into the picture: historic (the hero's 1652 layer), satellite (decoration), places (round crops), terrain (the poi map, so its pins are only ours), roads (anything with an app drawn route) */

import type { MapImageId, MapPicture } from "../types.ts";

import historic1652 from "../assets/maps/zwolle-historic-1652.png";
import satellite from "../assets/maps/zwolle-satellite.png";
import satellitePlaces from "../assets/maps/zwolle-satellite-places.png";
import satelliteTerrain from "../assets/maps/zwolle-satellite-places-terrain.png";
import satelliteRoads from "../assets/maps/zwolle-satellite-places-terrain-roads.png";

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

/* the hero's "Actuele kaart": point this at a richer export once that file is in src/assets/maps — one line, no other change */
export const HERO_CURRENT_IMAGE: MapPicture = MAP_IMAGES.roads;
