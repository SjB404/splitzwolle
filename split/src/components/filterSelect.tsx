/* a beerCSS select with a floating label and a chevron — the chevron lands in the field's trailing slot because it is not the first child, and suffix reserves its room */

import type { SelectOption } from "../types.ts";
import Icon from "./icon.tsx";

/* the value is the caller's union, so a typo in an option is a compile error instead of a list that silently filters nothing */
interface FilterSelectProps<Value extends string> {
  id: string;
  label: string;
  value: Value;
  options: SelectOption<Value>[];
  onChange: (value: Value) => void;
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
      {/* a <select> hands back a plain string; the options are the only values it can hold, so this is the one dom boundary that needs telling */}
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
