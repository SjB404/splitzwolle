/*
emptystate — the card a list shows when it has nothing to show.

used by the route overview and the points of interest. the way out of the empty
state comes in as action, because only the page knows what resetting means for
its own filters.

titleLevel matters: on its own the heading is an h2, but under a SectionHeading
it has to be an h3 or the document outline skips a level.
*/

import type { ReactNode } from "react";
import Icon from "./icon.tsx";

interface EmptyStateProps {
  /* a material symbols name, usually the one the missing thing would have worn */
  icon: string;
  title: string;
  description: string;
  /* 2 on its own, 3 under a SectionHeading: a skipped level breaks the outline */
  titleLevel?: 2 | 3;
  /* what the reader can do about it. only the page knows, so it is handed in */
  action?: ReactNode;
}

export default function EmptyState({
  icon,
  title,
  description,
  titleLevel = 2,
  action,
}: EmptyStateProps) {
  const Title: "h2" | "h3" = titleLevel === 3 ? "h3" : "h2";

  return (
    <article className="mt-10 flex flex-col items-center gap-3 p-10 text-center">
      <Icon name={icon} className="text-3xl text-ink-muted" />
      <Title className="text-xl font-bold">{title}</Title>
      <p className="max-w-md text-sm text-ink-muted">{description}</p>
      {action}
    </article>
  );
}
