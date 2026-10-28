/* items-baseline: beerCSS fields reserve label room, so centring sits the count too low */

import type { ReactNode } from "react";
import SearchField from "./searchField.tsx";

interface SectionSearchBarProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  resultLabel: string;
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
