/* assets must stay out of pointsOfInterest.ts's import graph: e2e reads it with plain node */

import annoStadsmuseum from "../assets/place_images/annostadsmuseum.webp";
import balletjeshuis from "../assets/place_images/balletjeshuis.webp";
import groteKerk from "../assets/place_images/grotekerk.webp";
import museumDeFundatie from "../assets/place_images/museumdefundatie.webp";
import peperbus from "../assets/place_images/peperbus.webp";
import sassenpoort from "../assets/place_images/sassenpoort.webp";
import thorbeckeGracht from "../assets/place_images/thorbeckegracht.webp";
import vanDerVelde from "../assets/place_images/vandervelde.webp";
import vrouwenhuis from "../assets/place_images/vrouwenhuis.webp";

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
