import type { ReactNode } from "react";

export const CONTAINER = "mx-auto max-w-[100rem] px-gutter";

interface ContainerProps {
  children: ReactNode;
  className?: string;
}

export default function Container({
  children,
  className = "",
}: ContainerProps) {
  return <div className={`${CONTAINER} ${className}`}>{children}</div>;
}
