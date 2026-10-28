// beercss only puts the chevron at the end because it isn't the first child

import "./filterSelect.css";
import type { SelectOption } from "../types.ts";
import Icon from "./icon.tsx";

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
  // the first option is the default, anything else means the filter is on
  const resting = options[0]?.value;
  const active = value !== resting;

  return (
    <div
      className={`field round border label suffix ${active ? "primary fill" : ""} ${className}`}
    >
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
