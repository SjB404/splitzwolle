/* the reviews band — score, breakdown and the written reviews; it owns its band and two column grid, and the breakdown is derived from route.reviews, never stored */

import SectionHeading from "../../shared/layout/sectionHeading.tsx";
import Container from "../../shared/layout/container.tsx";
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
    <section className="py-band">
      <Container>
        <SectionHeading
          title={`Reviews (${route.reviews})`}
          description="Wat andere wandelaars en fietsers van deze route vonden."
        />

        <div className="mt-10 grid gap-y-10 lg:gap-x-20">
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
      </Container>
    </section>
  );
}
