/* the card above a list that holds its controls and its count; onReset is optional, so the panel never decides whether a filter can be reset */

import type { ReactNode } from "react";
import ClearFiltersButton from "./clearFiltersButton.tsx";

interface FilterPanelProps {
  children: ReactNode;
  /* the caller builds the sentence because it is Dutch and inflects (“1 route” vs “2 routes”) */
  resultLabel: string;
  onReset?: () => void;
}

export default function FilterPanel({
  children,
  resultLabel,
  onReset,
}: FilterPanelProps) {
  return (
    <article className="p-5">
      {children}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line rounded-none pt-5">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {resultLabel}
        </p>

        {onReset && (
          <ClearFiltersButton onClick={onReset} className="ml-auto" />
        )}
      </div>
    </article>
  );
}
