import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "motion/react";

/* motion's `m` refuses to render outside a LazyMotion tree */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
