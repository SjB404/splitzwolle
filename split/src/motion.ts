/* keep in sync with the easing tokens in index.css */

import type { Transition } from "motion/react";

const MOTION_EASE: [number, number, number, number] = [0.2, 0, 0, 1];

export const MOTION_TRANSITION: Transition = {
  duration: 0.2,
  ease: MOTION_EASE,
};

export const MOTION_SWAP: Transition = { duration: 0.15, ease: MOTION_EASE };
