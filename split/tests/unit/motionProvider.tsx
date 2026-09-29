import type { ReactNode } from "react";
import { LazyMotion, domAnimation } from "motion/react";

/* motion's `m` component refuses to render outside a LazyMotion tree, which is what App.tsx provides */
export default function MotionProvider({ children }: { children: ReactNode }) {
  return (
    <LazyMotion features={domAnimation} strict>
      {children}
    </LazyMotion>
  );
}
