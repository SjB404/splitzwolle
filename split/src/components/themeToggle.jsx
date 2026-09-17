import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import Icon from "./icon.jsx";
import { MOTION_SWAP } from "../motion.js";

/* ---------------------------------------------------------------------------
 * ThemeToggle — switches the app between the light and dark Material 3 palettes.
 *
 * Both palettes live in src/index.css (`:root, body.light` and `body.dark`), so
 * the only job here is to keep the <body> class and the saved preference in
 * sync. index.html applies the stored theme before the first paint with the same
 * key, which is what stops a dark-mode visitor from seeing a flash of light.
 * ------------------------------------------------------------------------- */

export const THEME_STORAGE_KEY = "zwolle-routes:theme";

/* Kept as a plain function so the effect below stays a one-liner. */
function applyTheme(theme) {
  document.body.classList.toggle("dark", theme === "dark");
  document.body.classList.toggle("light", theme !== "dark");
}

function readStoredTheme() {
  try {
    return localStorage.getItem(THEME_STORAGE_KEY) === "dark" ? "dark" : "light";
  } catch {
    return "light"; // Storage can be blocked (private mode); light is the default.
  }
}

export default function ThemeToggle() {
  const [theme, setTheme] = useState(readStoredTheme);
  const isDark = theme === "dark";

  /* <body> lives outside the React tree, so the class is written here rather
     than rendered. This is a sync with an external system, not derived state. */
  useEffect(() => {
    applyTheme(theme);

    try {
      localStorage.setItem(THEME_STORAGE_KEY, theme);
    } catch {
      /* Remembering the choice is a nice-to-have; the toggle still works. */
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
      {/* The icon shows what you get, not what you have.

          It also spins out and in, so the switch reads as a change of state rather
          than a silent swap. `mode="wait"` finishes the exit before the enter, and
          `MotionConfig reducedMotion="user"` (App.tsx) drops the rotation for a
          visitor who asked for less motion while keeping the fade. */}
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
