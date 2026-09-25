/* the closing band and the page's contact block — id="contact" is what the top bar's Contact link points at (data/navigation.ts) */

import { Link } from "react-router-dom";
import Icon from "../primitives/icon.tsx";
import Container from "./container.tsx";
import { CONTACT_DETAILS, FOOTER_COLUMNS } from "../../data/navigation.ts";

export default function Footer() {
  return (
    <footer id="contact" className="inverse-surface py-10">
      {/* w-full matters: beerCSS makes <footer> a grid, and a grid item with mx-auto shrinks to its content */}
      <Container className="flex w-full flex-col gap-10">
        <div className="flex flex-col gap-10 lg:flex-row lg:justify-between">
          <div className="max-w-sm">
            <p className="font-display text-lg font-bold">Zwolle Routes</p>
            <p className="mt-2 text-sm text-ink-muted">
              Wandel en fiets door het Zwolle van toen en nu, met de historische
              kaartlaag naast de actuele plattegrond.
            </p>
          </div>

          {/* flex, not the 12 column grid: a wrapping row of link groups is one dimensional, and the grid multiplies its gap by 11 */}
          <div className="flex flex-wrap gap-x-12 gap-y-8 sm:gap-x-20">
            {FOOTER_COLUMNS.map((column) => (
              <nav
                key={column.title}
                aria-label={column.title}
                className="flex flex-col items-start gap-1"
              >
                <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                  {column.title}
                </h2>
                <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-muted">
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
              </nav>
            ))}

            <div className="flex flex-col items-start gap-1">
              <h2 className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
                Contact
              </h2>
              <ul className="mt-2 flex flex-col gap-1 text-sm text-ink-muted">
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

        <div className="flex flex-col gap-2 border-t border-line pt-6 text-xs text-ink-muted sm:flex-row sm:items-center sm:justify-between">
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
