/*
navbar — the app bar every page in the shell wears.

it moved here once more than one page needed it, and it reads the router instead of
page state: the links are routes, so which one is active comes from useLocation.

the bar leads with the brand and flips with the theme. light mode is the deltion
orange with white text, dark mode is the desaturated navy with light text.
*/

import { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import Icon from "./icon.jsx";
import ThemeToggle from "./themeToggle.jsx";
import { MOTION_TRANSITION } from "../motion.js";
import {
  LOGIN_PATH,
  NAV_LINKS,
  ROUTES_PATH,
  isActiveLink,
} from "../data/navigation.js";

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0">
      {/* `gap-2 sm:gap-6` keeps the bar inside a 320px viewport; the `max`
          spacer pushes the actions to the trailing edge. `px-0` cancels
          BeerCSS's header padding so this gutter matches the page sections. */}
      <nav className="mx-auto w-full max-w-[100rem] gap-2 px-5 sm:gap-6 sm:px-8">
        <Link
          to="/"
          className="font-display py-1.5 text-lg font-bold tracking-tight text-on-bar sm:text-xl"
        >
          Zwolle Routes
        </Link>

        {/* the active link is marked with weight and an underline, never by dimming the
            others. dimming text with opacity is the one thing this project never
            does. */}
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

        {/* the search box is hidden on phones, because the hero has one.
            an icon link needs .button next to .circle: the circle alone only rounds
            the box, and a bare <a> has no size of its own. */}
        <Link
          to={ROUTES_PATH}
          className="button circle transparent ripple tap-target hidden text-on-bar sm:inline-flex"
          aria-label="Zoek een route"
        >
          <Icon name="search" />
        </Link>

        {/* the avatar wears the brand colour opposite to the bar it sits on: deltion
            blue on the light theme's orange bar, deltion orange on the dark theme's
            navy one. it is also the way into the account screen. */}
        <Link
          to={LOGIN_PATH}
          className="button circle bg-avatar ripple tap-target text-xs font-semibold text-on-avatar"
          aria-label="Inloggen op je account"
        >
          JB
        </Link>

        {/* -me-2 pulls the trailing button back by the 8px the glyph is inset inside
            its 40px circle, so the icon lines up with the gutter even though the
            circle does not. that matches the logo on the left. */}
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

      {/* the mobile menu is one of the few places a real enter/exit earns its keep:
          it changes the page height, so without an animation it just appears.
          MotionConfig reducedMotion="user" in App.tsx drops the height animation for
          anyone who asked for less motion, and the menu still opens instantly. */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={MOTION_TRANSITION}
            className="overflow-hidden lg:hidden"
          >
            <div className="mx-auto w-full max-w-[100rem] px-5 pb-4">
              {/* the active row is a see through layer over the bar's own colour, not an
                  inverted pill. the bar's text is white in light mode, so an inverted
                  row would be orange text on white, which is unreadable. the layer
                  works in both themes because the bar's text colour always contrasts
                  with the bar. */}
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
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}
