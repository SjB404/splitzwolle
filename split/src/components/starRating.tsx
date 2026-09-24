/*
starrating — five material symbols stars that show a rating.

empty stars use the muted ink and never a faded accent, because this project does not
dim text with opacity. muted ink stays readable in both themes.

a filled star is beerCSS's i.fill, which flips the FILL axis of the icon font.
colour alone would leave filled and empty stars differing only in lightness, and a
3,5 rating has to read correctly.
*/

import Icon from "./icon.tsx";
import { formatRating } from "../format.ts";

/*
the five values a rating can take.

a list of the stars themselves and not a count, because the list is keyed by what a
star is: an index would be re-created by any change to the rating, and the rule here is
that a list is keyed by the thing itself.
*/
const STARS = [1, 2, 3, 4, 5];

interface StarRatingProps {
  /* the average score, 0 to 5. a 3.5 rounds up to four filled stars */
  value: number;
  className?: string;
}

export default function StarRating({ value, className = "" }: StarRatingProps) {
  const filled = Math.round(value);

  return (
    <span
      className={`inline-flex items-center gap-0.5 ${className}`}
      role="img"
      aria-label={`${formatRating(value)} van ${STARS.length} sterren`}
    >
      {STARS.map((star) => (
        <Icon
          key={star}
          name="star"
          className={`text-base ${
            star <= filled ? "fill text-accent" : "text-ink-muted"
          }`}
        />
      ))}
    </span>
  );
}
