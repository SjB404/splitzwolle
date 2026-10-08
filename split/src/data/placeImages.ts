/* assets must stay out of pointsOfInterest.ts's import graph: e2e reads it with plain node */

import annoStadsmuseum from "../assets/place_images/annostadsmuseum.jpg";
import balletjeshuis from "../assets/place_images/balletjeshuis.jpg";
import groteKerk from "../assets/place_images/grotekerk.jpg";
import museumDeFundatie from "../assets/place_images/museumdefundatie.webp";
import peperbus from "../assets/place_images/peperbus.png";
import sassenpoort from "../assets/place_images/sassenpoort.png";
import thorbeckeGracht from "../assets/place_images/thorbeckegracht.webp";
import vanDerVelde from "../assets/place_images/vandervelde.jpg";
import vrouwenhuis from "../assets/place_images/vrouwenhuis.jpg";

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
