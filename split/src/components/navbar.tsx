import { useEffect, useRef, useState } from "react";
import { flushSync } from "react-dom";
import { Link, useLocation } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import Icon from "./icon.tsx";
import Container, { CONTAINER } from "./container.tsx";
import { COLLAPSE, MOTION_SWAP } from "../motion.ts";
import {
  CONTACT_PATH,
  HOME_PATH,
  LOGIN_PATH,
  POI_PATH,
  ROUTES_PATH,
  ROUTE_SEARCH_ID,
  isActiveLink,
} from "../data/navigation.ts";
import { useSessionUser, userInitials } from "../data/session.ts";
import type { NavLink } from "../types.ts";

// exported for tests
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
  const user = useSessionUser();
  const header = useRef<HTMLElement>(null);

  // close the menu with escape or a click/tap anywhere outside the bar
  useEffect(() => {
    if (!menuOpen) return;

    function onKeyDown(event: KeyboardEvent) {
      if (event.key === "Escape") setMenuOpen(false);
    }
    function onPointerDown(event: PointerEvent) {
      if (!header.current?.contains(event.target as Node)) setMenuOpen(false);
    }

    document.addEventListener("keydown", onKeyDown);
    document.addEventListener("pointerdown", onPointerDown);

    return () => {
      document.removeEventListener("keydown", onKeyDown);
      document.removeEventListener("pointerdown", onPointerDown);
    };
  }, [menuOpen]);

  return (
    <header
      ref={header}
      className="app-bar sticky top-0 z-50 bg-bar text-on-bar px-0"
    >
      {/* px-0 cancels the beercss header padding, .max pushes the buttons to the right */}
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

        {/* .circle only rounds the box, an icon link also needs .button for the size */}
        {/* jumps to the route search box, ScrollToTop in App.tsx focuses it */}
        <Link
          to={{ pathname: ROUTES_PATH, hash: ROUTE_SEARCH_ID }}
          onClick={() => document.getElementById(ROUTE_SEARCH_ID)?.focus()}
          className="button circle transparent ripple tap-target hidden text-on-bar sm:inline-flex"
          aria-label="Zoek een route"
        >
          <Icon name="search" />
        </Link>

        {user ? (
          <Link
            to={LOGIN_PATH}
            className="button circle bg-avatar ripple tap-target text-xs font-semibold text-on-avatar"
            aria-label={`Je account (${user.email})`}
          >
            {userInitials(user.email)}
          </Link>
        ) : (
          <Link
            to={LOGIN_PATH}
            className="button circle transparent ripple tap-target text-on-bar"
            aria-label="Inloggen"
          >
            <Icon name="person" />
          </Link>
        )}

        {/* -me-2 lines the icon up with the page gutter */}
        <button
          type="button"
          className="circle transparent ripple tap-target -me-2 text-on-bar lg:hidden"
          aria-label="Menu"
          aria-expanded={menuOpen}
          onClick={() => setMenuOpen((open) => !open)}
        >
          <IconSwap name={menuOpen ? "close" : "menu"} />
        </button>
      </nav>

      {/* absolute so the menu drops over the page instead of pushing everything down */}
      <AnimatePresence initial={false}>
        {menuOpen && (
          <m.div
            {...COLLAPSE}
            className="absolute inset-x-0 top-full overflow-hidden rounded-none bg-bar lg:hidden"
          >
            <Container className="flex w-full flex-col gap-1 pb-4">
              {/* not inverted, that would be orange on white in light mode */}
              {NAV_LINKS.map((link) => {
                const active = isActiveLink(pathname, link.to);

                return (
                  <Link
                    key={link.label}
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
                );
              })}
            </Container>
          </m.div>
        )}
      </AnimatePresence>
    </header>
  );
}

// crossfades between two icons stacked in one grid cell
// (inline-grid, because beercss's "grid" class is a 12 column grid)
function IconSwap({ name }: { name: string }) {
  return (
    <span className="inline-grid">
      <AnimatePresence initial={false}>
        <m.span
          key={name}
          initial={{ opacity: 0, rotate: -45, scale: 0.8 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 45, scale: 0.8 }}
          transition={MOTION_SWAP}
          className="inline-flex [grid-area:1/1]"
        >
          <Icon name={name} />
        </m.span>
      </AnimatePresence>
    </span>
  );
}

// index.html reads this key too (before the page paints) so keep them the same
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
      // remembering the choice is optional, the toggle still works without it
    }
  }, [theme]);

  function toggleTheme() {
    const next: Theme = isDark ? "light" : "dark";
    const update = () => {
      applyTheme(next);
      flushSync(() => setTheme(next));
    };

    // view transitions give a quick crossfade; other browsers just switch instantly
    if (document.startViewTransition) {
      document.startViewTransition(update);
    } else {
      update();
    }
  }

  return (
    <button
      type="button"
      className="circle transparent ripple tap-target text-on-bar"
      onClick={toggleTheme}
      aria-pressed={isDark}
      aria-label={
        isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"
      }
    >
      <IconSwap name={isDark ? "light_mode" : "dark_mode"} />
    </button>
  );
}
