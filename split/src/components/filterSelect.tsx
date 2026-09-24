/*
filterselect — a beerCSS select with a floating label and a chevron.

the label floats because it directly follows the select in the markup, which is what
beerCSS looks for. the chevron lands in the field's trailing slot because it is not
the first child: beerCSS puts the first icon on the left and every later one on the
right. suffix reserves the room it takes.

the grid span is the caller's, so the same control can be a different width on each
page.
*/

import type { SelectOption } from "../types.ts";
import Icon from "./icon.tsx";

/*
the value is the caller's type.

that is what stops the options and the current value describing different things: a
select over the route themes is handed the themes' own union, so a typo in an option is
a compile error and not a list that silently filters nothing.
*/
interface FilterSelectProps<Value extends string> {
  id: string;
  label: string;
  value: Value;
  options: SelectOption<Value>[];
  onChange: (value: Value) => void;
  /* the grid span is the caller's, so the same control can be a different width on
     each page */
  className?: string;
}

export default function FilterSelect<Value extends string>({
  id,
  label,
  value,
  options,
  onChange,
  className = "s12 m6 l3",
}: FilterSelectProps<Value>) {
  return (
    <div className={`field round border label suffix ${className}`}>
      {/* a <select> hands back a plain string. the options above are the only values it
          can hold, so this is the one place the dom boundary has to be told so. */}
      <select
        id={id}
        value={value}
        onChange={(event) => onChange(event.currentTarget.value as Value)}
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
