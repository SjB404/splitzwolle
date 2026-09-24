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

import Icon from "./icon.jsx";

export default function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
  className = "",
  action,
}) {
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
