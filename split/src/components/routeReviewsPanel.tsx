import { useEffect, useState } from "react";
import type { FormEvent } from "react";
import { Link } from "react-router-dom";
import { AnimatePresence, m } from "motion/react";
import Icon from "./icon.tsx";
import StarRating from "./starRating.tsx";
import { COLLAPSE } from "../motion.ts";
import { buildReviewBreakdown } from "../data/routes.ts";
import { fetchReviews, postReview } from "../data/reviews.ts";
import { LOGIN_PATH } from "../data/navigation.ts";
import { formatRating } from "../format.ts";
import type { Route, RouteReview } from "../types.ts";

const RATING_SCALE_MAX = 5;

interface RouteReviewsPanelProps {
  route: Route;
}

export default function RouteReviewsPanel({ route }: RouteReviewsPanelProps) {
  const [open, setOpen] = useState(false);
  // null until the first time the panel is opened
  const [reviews, setReviews] = useState<RouteReview[] | null>(null);
  const breakdown = buildReviewBreakdown(route.reviews);

  // only load the reviews once someone actually opens the panel
  useEffect(() => {
    if (!open || reviews) return;

    let current = true;
    fetchReviews(route.id).then((result) => {
      if (current) setReviews(result.reviews);
    });

    return () => {
      current = false;
    };
  }, [open, reviews, route.id]);

  return (
    // same surface as the other cards, so it reads as a card and not as the page background
    <section className="surface-container-low overflow-hidden rounded-box border-2 border-line">
      {/* one 52px row, with the 28px corners it looks like a pill when closed and a card when open */}
      <div className="flex min-h-13 flex-wrap items-center gap-x-4 gap-y-2 rounded-none py-1.5 pl-6 pr-1.5">
        <h2 className="text-lg font-bold">Reviews</h2>
        {/* on a phone just one star and the score so the bar stays on one row */}
        <p className="flex items-center gap-x-2 text-sm text-ink-muted">
          <span className="hidden sm:inline-flex">
            <StarRating value={route.rating} />
          </span>
          <Icon name="star" className="fill text-base text-accent sm:hidden" />
          <span className="font-semibold text-ink">
            {formatRating(route.rating)}
          </span>
          <span className="hidden sm:inline">
            ({route.reviews} beoordelingen)
          </span>
        </p>

        <button
          type="button"
          aria-expanded={open}
          onClick={() => setOpen((current) => !current)}
          className="button border text-ink ripple tap-target ml-auto"
        >
          <span className="sm:hidden">{open ? "Verbergen" : "Bekijken"}</span>
          <span className="hidden sm:inline">
            {open ? "Reviews verbergen" : "Reviews bekijken"}
          </span>
          <Icon
            name="expand_more"
            className={`transition-[rotate] ${open ? "rotate-180" : ""}`}
          />
        </button>
      </div>

      <AnimatePresence initial={false}>
        {open && (
          <m.div {...COLLAPSE} className="overflow-hidden rounded-none">
            <div className="grid gap-6 rounded-none border-t-2 border-line p-5 sm:p-6">
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
                {reviews === null ? (
                  <p className="text-sm text-ink-muted">Reviews laden…</p>
                ) : reviews.length === 0 ? (
                  <p className="text-sm text-ink-muted">
                    Nog geen reviews. Schrijf de eerste!
                  </p>
                ) : (
                  <ul className="flex flex-col gap-4">
                    {reviews.map((review) => (
                      <li key={review.id}>
                        <ReviewCard review={review} />
                      </li>
                    ))}
                  </ul>
                )}

                <ReviewForm
                  routeId={route.id}
                  onPosted={(review) =>
                    setReviews((current) => [review, ...(current ?? [])])
                  }
                />
              </div>
            </div>
          </m.div>
        )}
      </AnimatePresence>
    </section>
  );
}

function ReviewCard({ review }: { review: RouteReview }) {
  return (
    <article className="p-5">
      <div className="flex flex-wrap items-center gap-3">
        <span className="circle bg-avatar flex h-10 w-10 flex-none items-center justify-center text-sm font-semibold text-on-avatar">
          {review.initials}
        </span>

        <div className="min-w-0">
          <p className="font-semibold text-ink">{review.author}</p>
          {review.date && (
            <p className="text-xs text-ink-muted">{review.date}</p>
          )}
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

type FormStatus = "idle" | "sending" | "sent" | "login" | "error";

// form for a new review, posting needs a login (the api answers 401 otherwise)
function ReviewForm({
  routeId,
  onPosted,
}: {
  routeId: string;
  onPosted: (review: RouteReview) => void;
}) {
  const [rating, setRating] = useState(0);
  const [text, setText] = useState("");
  const [status, setStatus] = useState<FormStatus>("idle");

  async function submit(event: FormEvent) {
    event.preventDefault();
    if (rating === 0 || text.trim() === "") return;

    setStatus("sending");
    const result = await postReview(routeId, rating, text.trim());

    if (result === "ok") {
      onPosted({
        id: `new-${Date.now()}`,
        author: "Jij",
        initials: "J",
        date: "Zojuist",
        rating,
        text: text.trim(),
      });
      setRating(0);
      setText("");
      setStatus("sent");
      return;
    }

    setStatus(result);
  }

  return (
    <form className="mt-8 flex flex-col gap-5" onSubmit={submit}>
      <div>
        <h3 className="text-lg font-bold">Schrijf een review</h3>
        <p className="mt-1 text-sm text-ink-muted">
          Deel je ervaring met andere wandelaars en fietsers.
        </p>
      </div>

      <StarPicker value={rating} onChange={setRating} />

      <div className="field border label textarea">
        <textarea
          id="review-text"
          placeholder=" "
          value={text}
          onChange={(event) => setText(event.target.value)}
        />
        <label htmlFor="review-text">Jouw ervaring</label>
      </div>

      <div className="flex flex-wrap items-center gap-4">
        <button
          type="submit"
          className="ripple tap-target"
          disabled={rating === 0 || text.trim() === "" || status === "sending"}
        >
          {status === "sending" ? "Bezig…" : "Review plaatsen"}
        </button>

        <p aria-live="polite" className="text-sm text-ink-muted">
          {status === "sent" && "Bedankt voor je review!"}
          {status === "error" &&
            "Er ging iets mis bij het plaatsen. Probeer het later opnieuw."}
          {status === "login" && (
            <>
              <Link
                to={LOGIN_PATH}
                className="font-semibold text-accent underline"
              >
                Log in
              </Link>{" "}
              om een review te plaatsen.
            </>
          )}
        </p>
      </div>
    </form>
  );
}

// five star buttons that work like radio buttons (arrow keys aren't needed, each star is a tab stop)
function StarPicker({
  value,
  onChange,
}: {
  value: number;
  onChange: (value: number) => void;
}) {
  const [hover, setHover] = useState(0);
  const shown = hover || value;

  return (
    <div>
      <p id="review-rating-label" className="text-sm font-medium text-ink">
        Beoordeling
      </p>
      <div
        role="radiogroup"
        aria-labelledby="review-rating-label"
        className="mt-1 flex"
        onMouseLeave={() => setHover(0)}
      >
        {Array.from({ length: RATING_SCALE_MAX }, (_, index) => index + 1).map(
          (star) => (
            <button
              key={star}
              type="button"
              role="radio"
              aria-checked={value === star}
              aria-label={`${star} van ${RATING_SCALE_MAX} sterren`}
              onClick={() => onChange(star)}
              onMouseEnter={() => setHover(star)}
              className="circle transparent ripple tap-target text-accent"
            >
              <Icon
                name="star"
                className={`text-2xl transition-transform ${
                  star <= shown ? "fill scale-110" : "text-ink-muted"
                }`}
              />
            </button>
          ),
        )}
      </div>
    </div>
  );
}
