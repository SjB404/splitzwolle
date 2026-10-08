/* the two hero artworks are imported (not public/) so vite fingerprints them; 1520x984 webp, 400-570 kB each */

import type { MapImageId, MapPicture } from "../types.ts";

import historic1652 from "../assets/maps/zwolle-historic-1652.webp";
import satellite from "../assets/maps/zwolle-satellite.webp";

export const MAP_SIZE = { width: 1520, height: 984 };

export const MAP_IMAGES: Record<MapImageId, MapPicture> = {
  historic: {
    src: historic1652,
    alt: "Historische kaart van Zwolle (Swolla) uit 1652",
  },
  satellite: { src: satellite, alt: "Luchtfoto van Zwolle" },
};
