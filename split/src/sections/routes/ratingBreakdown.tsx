/* how a rating is built up — each bar's max is the total reviews, so the bars read as shares of one whole; they are aria-hidden because the same numbers sit beside them */

import StarRating from "../../shared/primitives/starRating.tsx";
import { formatRating } from "../../format.ts";
import type { StarBucket } from "../../types.ts";

interface RatingBreakdownProps {
  rating: number;
  /* the total the bars are a share of, and the figure beside the score */
  reviewCount: number;
  breakdown: StarBucket[];
}

export default function RatingBreakdown({
  rating,
  reviewCount,
  breakdown,
}: RatingBreakdownProps) {
  return (
    <article className="p-5">
      <p className="font-display text-4xl font-bold text-heading">
        {formatRating(rating)}
      </p>
      <StarRating value={rating} className="mt-2" />
      <p className="mt-2 text-sm text-ink-muted">{reviewCount} beoordelingen</p>

      <ul className="mt-5 flex flex-col gap-2">
        {breakdown.map(({ stars, count }) => (
          <li key={stars} className="flex items-center gap-3">
            <span className="w-3 text-xs text-ink-muted">{stars}</span>
            <progress
              className="medium flex-1"
              value={count}
              max={reviewCount}
              aria-hidden="true"
            />
            <span className="w-8 text-right text-xs text-ink-muted">
              {count}
            </span>
          </li>
        ))}
      </ul>
    </article>
  );
}
