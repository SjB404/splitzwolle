/* the app bar every page in the shell wears — it reads the router and not page state, so the active link comes from useLocation */

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import Icon from "../primitives/icon.tsx";
import ThemeToggle from "./themeToggle.tsx";
import Container, { CONTAINER } from "./container.tsx";
import { MOTION_TRANSITION } from "../../motion.ts";
import {
  LOGIN_PATH,
  NAV_LINKS,
  ROUTES_PATH,
  isActiveLink,
} from "../../data/navigation.ts";

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0">
      {/* the gutter comes from CONTAINER, so the bar lines up with the sections below; px-0 cancels BeerCSS's own header padding, and the .max spacer pushes the actions to the trailing edge */}
      <nav className={`${CONTAINER} w-full gap-2 sm:gap-6`}>
        <Link
          to="/"
          className="font-display py-1.5 text-lg font-bold tracking-tight text-on-bar sm:text-xl"
        >
          Zwolle Routes
        </Link>

        {/* the active link is marked with weight and an underline, never by dimming the others */}
        {NAV_LINKS.map((link) => {
          const active = isActiveLink(pathname, link.to);

          return (
            <Link
              key={link.label}
              to={link.to}
              aria-current={active ? "page" : undefined}
              className={`hidden py-2.5 text-sm text-on-bar lg:inline-flex ${
                active
                  ? "font-semibold underline decoration-2 underline-offset-8"
                  : "hover:underline hover:underline-offset-8"
              }`}
            >
              {link.label}
            </Link>
          );
        })}

        <div className="max" />

        <ThemeToggle />

        {/* an icon link needs .button next to .circle: the circle only rounds the box, and a bare <a> has no size of its own */}
        <Link
          to={ROUTES_PATH}
          className="button circle transparent ripple tap-target hidden text-on-bar sm:inline-flex"
          aria-label="Zoek een route"
        >
          <Icon name="search" />
        </Link>

        {/* the avatar wears the brand colour opposite its bar, and it is the way into the account screen */}
        <Link
          to={LOGIN_PATH}
          className="button circle bg-avatar ripple tap-target text-xs font-semibold text-on-avatar"
          aria-label="Inloggen op je account"
        >
          JB
        </Link>

        {/* -me-2 pulls the trailing button back by the 8px the glyph is inset in its 40px circle, so the icon lines up with the gutter */}
        <button
          type="button"
          className="circle transparent ripple tap-target -me-2 text-on-bar lg:hidden"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <Icon name={menuOpen ? "close" : "menu"} />
        </button>
      </nav>

      {/* the mobile menu is one of the few places a real enter/exit earns its keep: it changes the page height, so without it the menu just appears */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={MOTION_TRANSITION}
            className="overflow-hidden lg:hidden"
          >
            <Container className="w-full pb-4">
              {/* the active row is a see through layer over the bar, not an inverted pill: the bar's text is white in light mode, so an inversion would be orange on white */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link) => {
                  const active = isActiveLink(pathname, link.to);

                  return (
                    <Link
                      key={link.label}
                      to={link.to}
                      onClick={() => setMenuOpen(false)}
                      aria-current={active ? "page" : undefined}
                      className={`button left-align min-h-12 ripple ${
                        active
                          ? "bg-on-bar/20 text-on-bar"
                          : "transparent text-on-bar"
                      }`}
                    >
                      {link.label}
                    </Link>
                  );
                })}
              </div>
            </Container>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
