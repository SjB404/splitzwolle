// shared timings for the motion components, same curve as --ease-standard in index.css
// everything is kept short on purpose: animation should never make you wait

import type { Transition } from "motion/react";

const EASE: [number, number, number, number] = [0.2, 0, 0, 1];

// things opening, appearing or moving into place
export const MOTION_TRANSITION: Transition = { duration: 0.2, ease: EASE };

// things closing or leaving, a bit quicker than opening
export const MOTION_EXIT: Transition = { duration: 0.15, ease: EASE };

// small swaps like an icon changing
export const MOTION_SWAP: Transition = { duration: 0.12, ease: EASE };

// open/close for anything that folds out (menus, accordions)
export const COLLAPSE = {
  initial: { height: 0 },
  animate: { height: "auto", transition: MOTION_TRANSITION },
  exit: { height: 0, transition: MOTION_EXIT },
};

// cards in a filtered list: new ones fade in, removed ones fade out of the way,
// and `layout` lets the remaining cards slide to their new spot instead of jumping
export const LIST_ITEM = {
  layout: true,
  initial: { opacity: 0, scale: 0.97 },
  animate: { opacity: 1, scale: 1 },
  exit: { opacity: 0, scale: 0.97, transition: MOTION_EXIT },
  transition: MOTION_TRANSITION,
} as const;

// small popups and hints: pop out of the thing that opened them
export const POPUP = {
  initial: { opacity: 0, scale: 0.9 },
  animate: { opacity: 1, scale: 1, transition: MOTION_TRANSITION },
  exit: { opacity: 0, scale: 0.9, transition: MOTION_EXIT },
};
