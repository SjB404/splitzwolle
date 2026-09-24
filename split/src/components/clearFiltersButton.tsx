/*
clearfiltersbutton — the one way out of a filtered list.

three places offer it: the filter panel's own row, and the empty state of both
overviews. writing it once is what keeps the wording, the icon and the weight of the
action the same in all three — an empty list offering a differently worded way out
reads like a different app.

the caller decides where it sits (ml-auto in the panel, mt-2 under an empty state's
text) and whether to offer it at all: nothing filtered, nothing to clear.
*/

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
      className={`button border text-ink ripple ${className}`}
    >
      {/* the outlined button's default label colour is too light on white (2.5:1), so
          the ink comes from the theme — see the button recipe in DESIGN.md §7 */}
      <Icon name="close" className="mr-1.5 text-base" />
      Filters wissen
    </button>
  );
}
