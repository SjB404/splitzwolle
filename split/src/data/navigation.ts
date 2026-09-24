/*
navigation — the paths, the top bar's links and the footer's link groups.

they live in one module because the bar, the footer and the login page all point at the
same places, so renaming a path here re-points every link at once.
*/

import type { ContactDetails, FooterColumn, NavLink } from "../types.ts";

export const HOME_PATH = "/";
export const ROUTES_PATH = "/routes";
export const PLANNING_PATH = "/planning";
export const POI_PATH = "/points-of-interest";
export const LOGIN_PATH = "/inloggen";
/** the login page opens its registration form when the url carries this hash */
export const REGISTER_PATH = "/inloggen#registreren";

/* Contact is not a page: it points at the footer band, which is the contact block on
   every page (see components/footer.tsx). */
export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: HOME_PATH },
  { label: "Routes", to: ROUTES_PATH },
  { label: "Planning", to: PLANNING_PATH },
  { label: "Points of Interest", to: POI_PATH },
  { label: "Contact", to: `${HOME_PATH}#contact` },
];

/*
whether a nav link is the page you are on. the hash is ignored, because it only says
where on the page to land, and a sub page (/routes/historische-singel-route) keeps its
parent link active.
*/
export function isActiveLink(pathname: string, to: string): boolean {
  const path = to.split("#")[0];

  if (path === HOME_PATH) return pathname === HOME_PATH;
  return pathname === path || pathname.startsWith(`${path}/`);
}

/* The footer's link groups. Contact details are placeholders until the
   collaborator's API is wired up (DESIGN.md §15). */
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Navigatie",
    links: [
      { label: "Home", to: HOME_PATH },
      { label: "Routes", to: ROUTES_PATH },
      { label: "Planning", to: PLANNING_PATH },
      { label: "Points of Interest", to: POI_PATH },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Inloggen", to: LOGIN_PATH },
      { label: "Registreren", to: REGISTER_PATH },
      { label: "Mijn planning", to: PLANNING_PATH },
    ],
  },
];

export const CONTACT_DETAILS: ContactDetails = {
  email: "info@zwolleroutes.nl",
  phone: "+31 38 123 45 67",
  phoneHref: "+31381234567",
  address: "Grote Markt 1, 8011 PK Zwolle",
};
