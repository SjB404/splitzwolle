/* ---------------------------------------------------------------------------
 * Motion tokens — the JavaScript mirror of the CSS ones.
 *
 * Motion takes its easing as a cubic-bezier *array* rather than a CSS function,
 * so the Material 3 curve has to exist in both places. Keeping it in one module
 * means `--ease-standard` in index.css, Tailwind's default transition, and every
 * Motion animation in the app are the same 200ms on the same curve — a single
 * edit changes the app's motion everywhere (docs/DESIGN.md §10).
 * ------------------------------------------------------------------------- */

/** Material 3's standard easing curve. */
export const MOTION_EASE = [0.2, 0, 0, 1];

/** The default for anything entering, leaving or resizing: 200ms, standard curve. */
export const MOTION_TRANSITION = { duration: 0.2, ease: MOTION_EASE };

/** A faster swap, for a control that answers a click (the theme toggle). */
export const MOTION_SWAP = { duration: 0.15, ease: MOTION_EASE };
