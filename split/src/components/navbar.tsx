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
  POI_PATH,
  ROUTES_PATH,
  isActiveLink,
} from "../data/navigation.ts";
import type { NavLink } from "../types.ts";

/* exported so tests can pin them; the only place that reads them */
// oxlint-disable-next-line react/only-export-components
export const NAV_LINKS: NavLink[] = [
  { label: "Home", to: HOME_PATH },
  { label: "Routes", to: ROUTES_PATH },
  { label: "Bezienswaardigheden", to: POI_PATH },
  { label: "Contact", to: CONTACT_PATH },
];

export default function Navbar() {
  const { pathname } = useLocation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <header className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0">
      {/* px-0 cancels beerCSS header padding; .max is beerCSS's spacer pushing the actions right */}
      <nav className={`${CONTAINER} w-full gap-2 sm:gap-6`}>
        <Link
          to="/"
          className="font-display py-1.5 text-lg font-bold tracking-tight text-on-bar sm:text-xl"
        >
          Zwolle Routes
        </Link>

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

        {/* .circle only rounds the box; an icon link needs .button for size */}
        <Link
          to={ROUTES_PATH}
          className="button circle transparent ripple tap-target hidden text-on-bar sm:inline-flex"
          aria-label="Zoek een route"
        >
          <Icon name="search" />
        </Link>

        <Link
          to={LOGIN_PATH}
          className="button circle bg-avatar ripple tap-target text-xs font-semibold text-on-avatar"
          aria-label="Inloggen op je account"
        >
          JB
        </Link>

        {/* -me-2 offsets the glyph's 8px inset in its 40px circle, lining the icon up with the gutter */}
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
              {/* not an inverted pill: bar text is white in light mode, an inversion would be orange on white */}
              <div className="flex flex-col gap-1">
                {NAV_LINKS.map((link, index) => {
                  const active = isActiveLink(pathname, link.to);

                  return (
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

/* the key is also read by index.html's pre-paint script: keep the two in step */
export const THEME_STORAGE_KEY = "zwolle-routes:theme";

type Theme = "light" | "dark";

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
    return "light"; // storage can be blocked (private mode), so fall back to light
  }
}

function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const isDark = theme === "dark";

  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* remembering the choice is optional; the toggle works without it */
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
      {/* App sets reducedMotion="user": the rotation is dropped but the fade stays */}
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
