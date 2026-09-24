/*
starrating — five material symbols stars that show a rating.

empty stars use the muted ink and never a faded accent, because this project does not
dim text with opacity. muted ink stays readable in both themes.

a filled star is beerCSS's i.fill, which flips the FILL axis of the icon font.
colour alone would leave filled and empty stars differing only in lightness, and a
3,5 rating has to read correctly.
*/

import Icon from "./icon.jsx";
import { formatRating } from "../format.js";

const STAR_COUNT = 5;

export default function StarRating({ value, className = "" }) {
  const filled = Math.round(value);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${formatRating(value)} van ${STAR_COUNT} sterren`}
    >
      {Array.from({ length: STAR_COUNT }, (_, index) => (
        <Icon
          key={index}
          name="star"
          className={`text-base ${
            index < filled ? "fill text-accent" : "text-ink-muted"
          }`}
        />
      ))}
    </span>
  );
}
