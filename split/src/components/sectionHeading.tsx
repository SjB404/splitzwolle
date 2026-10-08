import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  eyebrow?: string;
  action?: ReactNode;
}

export default function SectionHeading({
  eyebrow,
  title,
  description,
  action,
}: SectionHeadingProps) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
        )}

        <h2 className={`text-title font-bold ${eyebrow ? "mt-3" : ""}`}>
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-[15px] text-ink-muted">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
