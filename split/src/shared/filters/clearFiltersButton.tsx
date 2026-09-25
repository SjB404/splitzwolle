/* the one way out of a filtered list — three places offer it, so the wording and the icon stay identical in all three */

import Icon from "../primitives/icon.tsx";

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
      className={`button border text-ink ripple ${className}`}
    >
      {/* outlined buttons default to primary text (2.5:1 on white), so the ink comes from the theme — DESIGN.md §7 */}
      <Icon name="close" className="mr-1.5 text-base" />
      Filters wissen
    </button>
  );
}
