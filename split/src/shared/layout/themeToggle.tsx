import { useEffect, useState } from "react";
import { AnimatePresence, m } from "motion/react";
import Icon from "../primitives/icon.tsx";
import { MOTION_SWAP } from "../../motion.ts";

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

export default function ThemeToggle() {
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
