import Icon from "./icon.tsx";

interface ClearFiltersButtonProps {
  onClick: () => void;
  className?: string;
}

export default function ClearFiltersButton({
  onClick,
  className = "",
}: ClearFiltersButtonProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`button border text-ink ripple tap-target ${className}`}
    >
      {/* beercss's default primary text has too little contrast on white */}
      <Icon name="close" className="mr-1.5 text-base" />
      Filters wissen
    </button>
  );
}
