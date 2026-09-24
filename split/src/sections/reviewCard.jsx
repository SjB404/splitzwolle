/*
reviewcard — one written review.

the initials circle uses the avatar role, which is always the brand colour opposite
to what it sits on. so it reads on a card in both themes without this component
knowing which theme is on.

the rating shows stars and the number together: the stars are the glance, the number
is the fact, and together they stop 4 and 5 looking alike at a small size.
*/

import StarRating from "../components/starRating.jsx";
import { formatRating } from "../format.js";

export default function ReviewCard({ review }) {
  return (
    <article className="p-5">
      <div className="flex items-center gap-3">
        <span className="circle bg-avatar flex h-10 w-10 flex-none items-center justify-center text-sm font-semibold text-on-avatar">
          {review.initials}
        </span>

        <div className="min-w-0">
          <p className="font-semibold text-ink">{review.author}</p>
          <p className="text-xs text-ink-muted">{review.date}</p>
        </div>

        <span className="ml-auto inline-flex flex-none items-center gap-2">
          <StarRating value={review.rating} />
          <span className="text-sm font-semibold text-ink">
            {formatRating(review.rating)}
          </span>
        </span>
      </div>

      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">{review.text}</p>
    </article>
  );
}
