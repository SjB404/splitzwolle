/*
filterselect — a beerCSS select with a floating label and a chevron.

the label floats because it directly follows the select in the markup, which is what
beerCSS looks for. the chevron lands in the field's trailing slot because it is not
the first child: beerCSS puts the first icon on the left and every later one on the
right. suffix reserves the room it takes.

the grid span is the caller's, so the same control can be a different width on each
page.
*/

import Icon from "./icon.jsx";

export default function FilterSelect({
  id,
  label,
  value,
  options,
  onChange,
  className = "s12 m6 l3",
}) {
  return (
    <div className={`field round border label suffix ${className}`}>
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value)}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      <label htmlFor={id}>{label}</label>
      <Icon name="expand_more" />
    </div>
  );
}
