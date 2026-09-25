/* one written review; the avatar role always reads on its background, and stars plus the number stop 4 and 5 looking alike */

import StarRating from "../components/starRating.tsx";
import { formatRating } from "../format.ts";
import type { RouteReview } from "../types.ts";

interface ReviewCardProps {
  review: RouteReview;
}

export default function ReviewCard({ review }: ReviewCardProps) {
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

      <p className="mt-4 text-[15px] leading-relaxed text-ink-muted">
        {review.text}
      </p>
    </article>
  );
}
