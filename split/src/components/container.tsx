/*
container — the width and the gutter every band on every page shares.

1600px wide, centred, 20px of side padding and 32px from sm up. it is written down
once because fifteen files would otherwise each repeat it, and the day the app widens
they would all have to remember the same four classes.

two spellings of one recipe, both from this file:

  <Container>       the common case: a div that bounds what is inside it
  ${CONTAINER}      an element that has to be something else — the bar's <nav>, and
                    the hero, where the container is also the grid

the second spelling exists so that case cannot quietly become a copy of the first.
*/

import type { ReactNode } from "react";

export const CONTAINER = "mx-auto max-w-[100rem] px-5 sm:px-8";

interface ContainerProps {
  children: ReactNode;
  /** extra classes for the bands where the container is also a grid or a flex row */
  className?: string;
}

export default function Container({ children, className = "" }: ContainerProps) {
  return <div className={`${CONTAINER} ${className}`}>{children}</div>;
}
