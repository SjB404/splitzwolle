/*
motion tokens — the javascript twin of the css ones.

motion wants its easing as an array of four numbers and not a css function, so the
same curve has to exist in both places. keeping it in one module means the css
variable, tailwind's default transition and every motion animation in the app stay on
the same curve, and one edit changes them all.
*/

/** the app's one easing curve, shared with the css */
export const MOTION_EASE = [0.2, 0, 0, 1];

/** the default for anything entering, leaving or resizing: 200ms on that curve */
export const MOTION_TRANSITION = { duration: 0.2, ease: MOTION_EASE };

/** a faster swap, for a control that answers a click (the theme toggle) */
export const MOTION_SWAP = { duration: 0.15, ease: MOTION_EASE };
