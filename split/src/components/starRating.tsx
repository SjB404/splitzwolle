/* empty stars: muted ink, never a faded accent; selection uses beerCSS's i.fill, not colour alone */

import Icon from "./icon.tsx";
import { formatRating } from "../format.ts";

const STARS = [1, 2, 3, 4, 5];

interface StarRatingProps {
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
