/* five material symbols stars — empty ones use muted ink (never a faded accent), and a filled one is beerCSS's i.fill, since colour alone is too subtle at this size */

import Icon from "./icon.tsx";
import { formatRating } from "../../format.ts";

/* the values a rating can take, as a list so the key is the star itself */
const STARS = [1, 2, 3, 4, 5];

interface StarRatingProps {
  /* the average score, 0 to 5; a 3.5 rounds up to four filled stars */
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
