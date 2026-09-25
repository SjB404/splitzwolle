/* the bar that opens a section which previews a longer list — the section's own search field, how many things it found, and the way to the whole list */
/* one row on the baseline, so the field's text, the count and the action share a line instead of stacking into three unrelated pieces; centring them leaves the count sitting 4px low, because a beerCSS field reserves room above its text for a floating label */
/* the section owns the query; this file only owns how the three pieces sit together */

import type { ReactNode } from "react";
import SearchField from "./searchField.tsx";

interface SectionSearchBarProps {
  /* the input's id, which the field's sr-only label points at */
  id: string;
  /* the accessible name: a placeholder alone is not one */
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /* the caller builds the sentence because it is Dutch and inflects ("1 route" vs "2 routes") */
  resultLabel: string;
  /* the way to the whole list, as a link dressed as a button */
  action: ReactNode;
}

export default function SectionSearchBar({
  id,
  label,
  placeholder,
  value,
  onChange,
  resultLabel,
  action,
}: SectionSearchBarProps) {
  return (
    <div className="mt-8 flex flex-wrap items-baseline gap-x-4 gap-y-3">
      <SearchField
        id={id}
        label={label}
        placeholder={placeholder}
        value={value}
        onChange={onChange}
        className="w-full text-sm sm:max-w-sm"
      />

      <p className="text-sm text-ink-muted" aria-live="polite">
        {resultLabel}
      </p>

      <div className="ml-auto">{action}</div>
    </div>
  );
}
