import { useState } from "react";
import { m } from "motion/react";
import Icon from "./icon.tsx";
import StarRating from "./starRating.tsx";
import { MOTION_TRANSITION } from "../motion.ts";
import { ROUTE_REVIEWS, buildReviewBreakdown } from "../data/routes.ts";
import { formatRating } from "../format.ts";
import type { Route } from "../types.ts";

const RATING_SCALE_MAX = 5;

interface RouteReviewsPanelProps {
  route: Route;
}

export default function RouteReviewsPanel({ route }: RouteReviewsPanelProps) {
  const [open, setOpen] = useState(false);
  const breakdown = buildReviewBreakdown(route.reviews);

  return (
    <section className="surface mt-6 overflow-hidden rounded-box border-2 border-line">
      {/* transparent: beerCSS fills a bare button with the brand colour, but this row is not an action */}
      <button
        type="button"
        aria-expanded={open}
        onClick={() => setOpen((current) => !current)}
        className="flex w-full flex-wrap items-center gap-x-3 gap-y-2 rounded-none p-4 text-left ripple transparent"
      >
        <StarRating value={route.rating} />
        <span className="text-sm font-semibold text-ink">
          {formatRating(route.rating)}
        </span>
        <span className="text-xs text-ink-muted">
          ({route.reviews} beoordelingen)
        </span>

        <span className="ml-auto inline-flex items-center gap-1 text-sm font-semibold text-accent">
          {open ? "Reviews verbergen" : "Reviews bekijken"}
          <Icon
            name={open ? "expand_less" : "expand_more"}
            className="text-base"
          />
        </span>
      </button>

      {/* open animates height; closing is instant by design, so no exit animation */}
      {open && (
        <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={MOTION_TRANSITION}
          className="overflow-hidden rounded-none"
        >
          <div className="border-t-2 border-line rounded-none p-4">
            <h2 className="mb-4 text-lg font-bold">
              Reviews ({route.reviews})
            </h2>

            <div className="grid gap-y-8 lg:gap-x-10">
              <div className="s12 l4">
                <article className="p-5">
                  <p className="font-display text-4xl font-bold text-heading">
                    {formatRating(route.rating)}
                  </p>
                  <StarRating value={route.rating} className="mt-2" />
                  <p className="mt-2 text-sm text-ink-muted">
                    {route.reviews} beoordelingen
                  </p>

                  <ul className="mt-5 flex flex-col gap-2">
                    {breakdown.map(({ stars, count }) => (
                      <li key={stars} className="flex items-center gap-3">
                        <span className="w-3 text-xs text-ink-muted">
                          {stars}
                        </span>
                        <progress
                          className="medium flex-1"
                          value={count}
                          max={route.reviews}
                          aria-hidden="true"
                        />
                        <span className="w-8 text-right text-xs text-ink-muted">
                          {count}
                        </span>
                      </li>
                    ))}
                  </ul>
                </article>
              </div>

              <div className="s12 l8">
                <ul className="flex flex-col gap-4">
                  {ROUTE_REVIEWS.map((review) => (
                    <li key={review.id}>
                      <article className="p-5">
                        <div className="flex items-center gap-3">
                          <span className="circle bg-avatar flex h-10 w-10 flex-none items-center justify-center text-sm font-semibold text-on-avatar">
                            {review.initials}
                          </span>

                          <div className="min-w-0">
                            <p className="font-semibold text-ink">
                              {review.author}
                            </p>
                            <p className="text-xs text-ink-muted">
                              {review.date}
                            </p>
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
                    </li>
                  ))}
                </ul>

                <ReviewForm />
              </div>
            </div>
          </div>
        </m.div>
      )}
    </section>
  );
}

function ReviewForm() {
  const [rating, setRating] = useState(RATING_SCALE_MAX);

  return (
    <form
      className="mt-8 flex flex-col gap-5"
      onSubmit={(event) => event.preventDefault()}
    >
      <div>
        <h3 className="text-lg font-bold">Schrijf een review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Deel je ervaring met andere wandelaars en fietsers.
        </p>
      </div>

      <div>
        <p className="text-sm font-medium text-ink">Beoordeling</p>

        {/* mx-0 cancels beerCSS's inline margins on .slider */}
        <label className="slider mx-0 mt-1 w-full max-w-sm">
          <span className="sr-only">
            Kies een beoordeling tussen 1 en {RATING_SCALE_MAX} sterren
          </span>
          <input
            type="range"
            min="1"
            max={RATING_SCALE_MAX}
            step="1"
            defaultValue={RATING_SCALE_MAX}
            onChange={(event) => setRating(Number(event.currentTarget.value))}
          />
          {/* the empty span is the filled part of the beerCSS slider track */}
          <span />
        </label>

        <p className="mt-1 text-xs text-ink-muted">
          {rating} van {RATING_SCALE_MAX} sterren
        </p>
      </div>

      <div className="field border label">
        <textarea id="review-text" placeholder=" " />
        <label htmlFor="review-text">Jouw ervaring</label>
      </div>

      <div>
        <button type="submit" className="ripple tap-target">
          Review plaatsen
        </button>
      </div>
    </form>
  );
}
