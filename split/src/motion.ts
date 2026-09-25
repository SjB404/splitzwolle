/* the css motion tokens in js form: motion takes the easing as four numbers, so one module keeps both in sync */

import type { Transition } from "motion/react";

/** the app's one easing curve, shared with the css */
export const MOTION_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

/** the default for anything entering, leaving or resizing: 200ms on that curve */
export const MOTION_TRANSITION: Transition = {
  duration: 0.2,
  ease: MOTION_EASE,
};

/** a faster swap, for a control that answers a click (the theme toggle) */
export const MOTION_SWAP: Transition = { duration: 0.15, ease: MOTION_EASE };
