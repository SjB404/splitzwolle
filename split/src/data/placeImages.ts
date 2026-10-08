/* the pictures of the places, imported here and not on the place data: tests/e2e reads data/pointsOfInterest.ts with plain node, which cannot import a .jpg, so no module in that import graph may pull an asset in */
/* a component reads `point.image` first (the collaborator's api can still answer with a url) and this map second; the files and the places they belong to are listed in docs/place-images.md */

import annoStadsmuseum from "../assets/place_images/annostadsmuseum.jpg";
import balletjeshuis from "../assets/place_images/balletjeshuis.jpg";
import groteKerk from "../assets/place_images/grotekerk.jpg";
import museumDeFundatie from "../assets/place_images/museumdefundatie.webp";
import peperbus from "../assets/place_images/peperbus.png";
import sassenpoort from "../assets/place_images/sassenpoort.png";
import thorbeckeGracht from "../assets/place_images/thorbeckegracht.webp";
import vanDerVelde from "../assets/place_images/vandervelde.jpg";
import vrouwenhuis from "../assets/place_images/vrouwenhuis.jpg";

/** the picture of a place, by its id — the places that have one are exactly the keys of this map */
export const PLACE_IMAGES: Record<string, string> = {
  "anno-stadsmuseum": annoStadsmuseum,
  balletjeshuis,
  "grote-kerk": groteKerk,
  "museum-de-fundatie": museumDeFundatie,
  peperbus,
  sassenpoort,
  thorbeckegracht: thorbeckeGracht,
  "van-der-velde-in-de-broeren": vanDerVelde,
  vrouwenhuis,
};
