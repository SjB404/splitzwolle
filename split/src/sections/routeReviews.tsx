/*
routereviews — the reviews band: the score, how it is built up, and what people
wrote.

it owns the band and the two column grid inside it, so the page above only has to
place it.

the breakdown is calculated here from the route's review count and never stored. a
second copy of "128 reviews" would be a second thing to keep in step, and how a
count spreads over the five star values belongs to the data module.
*/

import SectionHeading from "../components/sectionHeading.tsx";
import Container from "../components/container.tsx";
import RatingBreakdown from "./ratingBreakdown.tsx";
import ReviewCard from "./reviewCard.tsx";
import ReviewForm from "./reviewForm.tsx";
import { ROUTE_REVIEWS, buildReviewBreakdown } from "../data/routes.ts";
import type { Route } from "../types.ts";

interface RouteReviewsProps {
  route: Route;
}

export default function RouteReviews({ route }: RouteReviewsProps) {
  const breakdown = buildReviewBreakdown(route.reviews);

  return (
    <section className="py-16 sm:py-20">
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
