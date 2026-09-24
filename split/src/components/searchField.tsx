/*
searchfield — a beerCSS search box, with an optional action on the right.

the magnifier has to be the field's first child. that is how BeerCSS knows to put
it on the left instead of the right.

the action is a node because the hero's is a link to the route overview and the
filter panels have none. it must be a slotted a/i for BeerCSS to position it,
which is the caller's business.

the label is sr-only rather than missing: a search box with only a placeholder
has no accessible name.

className is the caller's: the hero's box is page copy, the others are columns of
a filter grid, and they are not the same size.
*/

import type { ReactNode } from "react";
import Icon from "./icon.tsx";

interface SearchFieldProps {
  /* the input's id, which is also what the sr-only label points at */
  id: string;
  /* the accessible name. a placeholder alone is not one */
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
