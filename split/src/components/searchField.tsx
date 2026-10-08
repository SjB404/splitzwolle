/* beerCSS: the magnifier must be the field's first child, or it renders on the right */

import Icon from "./icon.tsx";

interface SearchFieldProps {
  id: string;
  label: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

export default function SearchField({
  id,
  label,
  placeholder,
  value,
  onChange,
  className = "",
}: SearchFieldProps) {
  return (
    <div className={`field round border prefix ${className}`}>
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
    </div>
  );
}
