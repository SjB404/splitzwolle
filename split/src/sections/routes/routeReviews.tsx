/* the reviews themselves — the panel around them owns the heading and the fold, because this content only ever
   appears inside it */

import RatingBreakdown from "./ratingBreakdown.tsx";
import ReviewCard from "./reviewCard.tsx";
import ReviewForm from "./reviewForm.tsx";
import { ROUTE_REVIEWS, buildReviewBreakdown } from "../../data/routes.ts";
import type { Route } from "../../types.ts";

interface RouteReviewsProps {
  route: Route;
}

export default function RouteReviews({ route }: RouteReviewsProps) {
  const breakdown = buildReviewBreakdown(route.reviews);

  return (
    <div className="grid gap-y-8 lg:gap-x-10">
      <div className="s12 l4">
        <RatingBreakdown
          rating={route.rating}
          reviewCount={route.reviews}
          breakdown={breakdown}
        />
      </div>

      <div className="s12 l8">
        <ul className="flex flex-col gap-4">
          {ROUTE_REVIEWS.map((review) => (
            <li key={review.id}>
              <ReviewCard review={review} />
            </li>
          ))}
        </ul>

        <ReviewForm />
      </div>
    </div>
  );
}
