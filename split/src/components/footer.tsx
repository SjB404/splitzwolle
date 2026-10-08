import { Link } from "react-router-dom";
import Icon from "./icon.tsx";
import Container from "./container.tsx";
import { CONTACT_DETAILS } from "../data/contact.ts";
import {
  HOME_PATH,
  LOGIN_PATH,
  POI_PATH,
  REGISTER_PATH,
  ROUTES_PATH,
} from "../data/navigation.ts";
import type { FooterColumn } from "../types.ts";

/* contact details live in data/contact.ts, shared with the contact page */
// oxlint-disable-next-line react/only-export-components
export const FOOTER_COLUMNS: FooterColumn[] = [
  {
    title: "Navigatie",
    links: [
      { label: "Home", to: HOME_PATH },
      { label: "Routes", to: ROUTES_PATH },
      { label: "Bezienswaardigheden", to: POI_PATH },
    ],
  },
  {
    title: "Account",
    links: [
      { label: "Inloggen", to: LOGIN_PATH },
      { label: "Registreren", to: REGISTER_PATH },
    ],
  },
];

/* re-exported so tests and other modules keep importing it from this file */
export { CONTACT_DETAILS };

export default function Footer() {
  return (
    /* px-0 cancels beerCSS footer padding; CONTAINER supplies the gutter */
    <footer id="contact" className="inverse-surface px-0 py-10">
      {/* w-full: beerCSS makes <footer> a grid; mx-auto shrinks grid items to content */}
      <Container className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-10 xl:flex-row xl:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-lg font-bold">Zwolle Routes</p>
            <p className="mt-2 text-sm text-ink-muted">
              Wandel en fiets door het Zwolle van toen en nu, met de historische
              kaartlaag naast de actuele plattegrond.
            </p>
          </div>

          {/* flex, not the 12-column grid: the grid multiplies its gap by 11 */}
          <div className="flex flex-wrap gap-x-12 gap-y-8 sm:gap-x-20">
            {FOOTER_COLUMNS.map((column) => (
              <nav
                key={column.title}
                aria-label={column.title}
                /* mt-0 cancels beerCSS's 1rem sibling margin; gap-y-8 spaces */
                className="mt-0 flex flex-col items-start gap-2"
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {column.title}
                </h2>
                {/* the div matters: beerCSS turns a <ul> under <nav> into an absolute menu overlay */}
                <div>
                  <ul className="flex flex-col gap-1 text-sm text-ink-muted">
                    {column.links.map((link) => (
                      <li key={link.label}>
                        <Link
                          to={link.to}
                          className="transition-colors hover:text-ink"
                        >
                          {link.label}
                        </Link>
                      </li>
                    ))}
                  </ul>
                </div>
              </nav>
            ))}

            <div className="flex flex-col items-start gap-2">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Contact
              </h2>
              <ul className="mt-0 flex flex-col gap-1 text-sm text-ink-muted">
                <li>
                  <a
                    href={`mailto:${CONTACT_DETAILS.email}`}
                    className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
                  >
                    <Icon name="mail" className="text-base" />
                    {CONTACT_DETAILS.email}
                  </a>
                </li>
                <li>
                  <a
                    href={`tel:${CONTACT_DETAILS.phoneHref}`}
                    className="transition-colors hover:text-ink"
                  >
                    {CONTACT_DETAILS.phone}
                  </a>
                </li>
                <li>{CONTACT_DETAILS.address}</li>
              </ul>
            </div>
          </div>
        </div>

        <div className="flex flex-col gap-2 border-t-2 border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
          <p>
            © {new Date().getFullYear()} Zwolle Routes — Alle rechten
            voorbehouden.
          </p>
          <p>Gemaakt voor wandelaars en fietsers in Zwolle.</p>
        </div>
      </Container>
    </footer>
  );
}
