/* the "title + explanation + one action" row that opens a section; four pages need it, so it lives here */

import type { ReactNode } from "react";

interface SectionHeadingProps {
  title: string;
  description?: string;
  /* the small all-caps line above the title */
  eyebrow?: string;
  /* the one action this section offers, usually a link dressed as a button */
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
