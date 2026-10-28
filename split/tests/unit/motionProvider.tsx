import type { ReactNode } from "react";
import { LazyMotion, domMax } from "motion/react";

/* motion's `m` refuses to render outside a LazyMotion tree */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domMax} strict>
      {children}
    </LazyMotion>
  );
}
