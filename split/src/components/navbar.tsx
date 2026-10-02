/* the app bar every page in the shell wears — it reads the router and not page state, so the active link comes from useLocation */

import { useEffect, useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import Icon from "./icon.tsx";
import Container, { CONTAINER } from "./container.tsx";
import { MOTION_SWAP, MOTION_TRANSITION } from "../motion.ts";
import {
  CONTACT_PATH,
  HOME_PATH,
  LOGIN_PATH,
  PLANNING_PATH,
  POI_PATH,
  ROUTES_PATH,
  isActiveLink,
} from "../data/navigation.ts";
import type { NavLink } from "../types.ts";

/* the bar's own links, declared here because this is the only place that reads them; the export is what lets a test pin them */
// oxlint-disable-next-line react/only-export-components
export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: HOME_PATH },
  { label: "Routes", to: ROUTES_PATH },
  { label: "Planning", to: PLANNING_PATH },
  { label: "Points of Interest", to: POI_PATH },
  { label: "Contact", to: CONTACT_PATH },
];

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
        {/* the glyph turns as it swaps, so the button answers the press itself: without it the icon just blinks from one name to the other */}
        <button
          type="button"
          className="circle transparent ripple tap-target -me-2 text-on-bar lg:hidden"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <AnimatePresence initial={false} mode="wait">
            <m.span
              key={menuOpen ? "close" : "menu"}
              initial={{ opacity: 0, rotate: -90, scale: 0.6 }}
              animate={{ opacity: 1, rotate: 0, scale: 1 }}
              exit={{ opacity: 0, rotate: 90, scale: 0.6 }}
              transition={MOTION_SWAP}
              className="inline-flex"
            >
              <Icon name={menuOpen ? "close" : "menu"} />
            </m.span>
          </AnimatePresence>
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
                {NAV_LINKS.map((link, index) => {
                  const active = isActiveLink(pathname, link.to);

                  return (
                    /* the rows arrive one after another: opacity only, so the cascade still reads when the reader has asked for less motion and the panel's own height is skipped */
                    <m.div
                      key={link.label}
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ ...MOTION_SWAP, delay: index * 0.03 }}
                    >
                      <Link
                        to={link.to}
                        onClick={() => setMenuOpen(false)}
                        aria-current={active ? "page" : undefined}
                        className={`button left-align min-h-12 w-full ripple ${
                          active
                            ? "bg-on-bar/20 text-on-bar"
                            : "transparent text-on-bar"
                        }`}
                      >
                        {link.label}
                      </Link>
                    </m.div>
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

/* switches the light and dark palettes; both live in index.css, so the only job here is keeping the <body> class and the stored choice in step with index.html's pre-paint script */
export const THEME_STORAGE_KEY = "zwolle-routes:theme";

/* the two palettes index.css declares. a third value would leave <body> without one */
type Theme = "light" | "dark";

/* a plain function so the effect below stays a one liner */
function applyTheme(theme: Theme) {
  document.body.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("light", theme !== "dark");
}

function readStoredTheme(): Theme {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark"
      ? "dark"
      : "light";
  } catch {
    return "light"; // storage can be blocked (private mode), and light is the default
  }
}

/* the bar's own theme switch: light and dark are the bar's business, so it is not a component of its own */
function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const isDark = theme === "dark";

  /* <body> lives outside the React tree, so the class is written here — syncing with something external, not calculated state */
  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* remembering the choice is a nice to have, and the toggle works without it */
    }
  }, [theme]);

  return (
    <button
      type="button"
      className="circle transparent ripple tap-target text-on-bar"
      onClick={() => setTheme(isDark ? "light" : "dark")}
      aria-pressed={isDark}
      aria-label={
        isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"
      }
    >
      {/* the icon shows what you get, not what you have; mode="wait" lets the exit finish, and App's reducedMotion="user" drops the rotation but keeps the fade */}
      <AnimatePresence initial={false} mode="wait">
        <m.span
          key={isDark ? "light" : "dark"}
          initial={{ rotate: -90, scale: 0.6, opacity: 0 }}
          animate={{ rotate: 0, scale: 1, opacity: 1 }}
          exit={{ rotate: 90, scale: 0.6, opacity: 0 }}
          transition={MOTION_SWAP}
          className="inline-flex"
        >
          <Icon name={isDark ? "light_mode" : "dark_mode"} />
        </m.span>
      </AnimatePresence>
    </button>
  );
}
