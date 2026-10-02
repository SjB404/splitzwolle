/* a beerCSS search box with an optional action — the magnifier must be the field's first child, or beerCSS puts it on the right */

import type { ReactNode } from "react";
import Icon from "./icon.tsx";

interface SearchFieldProps {
  /* the input's id, which the sr-only label points at */
  id: string;
  /* the accessible name: a placeholder alone is not one */
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  /* the caller's sizing: the hero's box is page copy, a panel's is a grid column */
  className?: string;
  /* a slotted link or icon, which beerCSS positions on the right of the field */
  action?: ReactNode;
}

export default function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
  className = "",
  action,
}: SearchFieldProps) {
  return (
    <div
      className={`field round border prefix ${action ? "suffix" : ""} ${className}`}
    >
      <Icon name="search" />

      <label htmlFor={id} className="sr-only">
        {label}
      </label>

      <input
        id={id}
        type="search"
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
        placeholder={placeholder}
      />

      {action}
    </div>
  );
}
