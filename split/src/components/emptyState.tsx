import type { ReactNode } from "react";
import Icon from "./icon.tsx";

interface EmptyStateProps {
  icon: string;
  title: string;
  description: string;
  /* 3 when nested under a SectionHeading (h2): skipping a level breaks the outline */
  titleLevel?: 2 | 3;
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
