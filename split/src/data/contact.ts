import type { ContactDetails } from "../types.ts";

/* canonical contact details: the footer band and the contact page both read these */
export const CONTACT_DETAILS: ContactDetails = {
  email: "info@zwolleroutes.nl",
  phone: "+31 38 421 6200",
  phoneHref: "+31384216200",
  address: "Grote Markt 20, 8011 LV Zwolle",
};

/* the contact page prints the address across two lines */
export const CONTACT_ADDRESS_LINE = "Grote Markt 20";
export const CONTACT_CITY_LINE = "8011 LV Zwolle, Nederland";
