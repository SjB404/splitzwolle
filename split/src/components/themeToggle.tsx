import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import Icon from "./icon.tsx";
import { MOTION_SWAP } from "../motion.ts";

/*
themetoggle — switches between the light and dark palettes.

both palettes live in index.css (:root, body.light and body.dark), so the only job
here is keeping the <body> class and the saved choice in step. index.html applies the
stored theme before the first paint with the same storage key, which is what stops a
dark mode visitor seeing a flash of light.
*/

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
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light"; // storage can be blocked (private mode), and light is the default
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>(readStoredTheme);
  const isDark = theme === "dark";

  /* <body> lives outside the React tree, so the class is written here instead of being
     rendered. this is syncing with something external, not calculated state. */
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
      aria-label={isDark ? "Schakel naar licht thema" : "Schakel naar donker thema"}
    >
      {/* the icon shows what you get, not what you have. it also spins out and in, so
          the switch reads as a change of state instead of a silent swap. mode="wait"
          lets the exit finish first, and reducedMotion="user" in App.tsx drops the
          rotation for anyone who asked for less motion while keeping the fade. */}
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
