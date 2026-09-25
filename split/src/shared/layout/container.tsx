/* the width and gutter every band shares — CONTAINER for elements that must be another tag (the bar's <nav>, the hero grid) */

import type { ReactNode } from "react";

export const CONTAINER = "mx-auto max-w-[100rem] px-5 sm:px-8";

interface ContainerProps {
  children: ReactNode;
  /** extra classes for the bands where the container is also a grid or a flex row */
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return <div className={`${CONTAINER} ${className}`}>{children}</div>;
}
