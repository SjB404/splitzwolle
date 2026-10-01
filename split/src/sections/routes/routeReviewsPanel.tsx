/* the reviews, folded away — a reader sees the average and how many people gave it, and opens the rest on demand.
   it sits under the map of a ready-made route, which is why it is collapsed: the route itself comes first */

import { useState } from "react";
import { m } from "motion/react";
import Icon from "../../shared/primitives/icon.tsx";
import StarRating from "../../shared/primitives/starRating.tsx";
import RouteReviews from "./routeReviews.tsx";
import { MOTION_TRANSITION } from "../../motion.ts";
import { formatRating } from "../../format.ts";
import type { Route } from "../../types.ts";

interface RouteReviewsPanelProps {
  route: Route;
}

export default function RouteReviewsPanel({ route }: RouteReviewsPanelProps) {
  const [open, setOpen] = useState(false);

  return (
    <section className="surface mt-6 overflow-hidden rounded-box border-2 border-line">
      {/* one button for the whole row: it is the only control here, and aria-expanded is what a screen reader reads.
          transparent, because beerCSS fills a bare button with the brand colour and this is a row, not an action */}
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

      {/* the panel grows the page under it, so it slides open instead of blinking into place; folding it away is instant, so the fold is always the reader's to undo */}
      {open && (
        <m.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: "auto", opacity: 1 }}
          transition={MOTION_TRANSITION}
          className="overflow-hidden"
        >
          <div className="border-t-2 border-line rounded-none p-4">
            <h2 className="mb-4 text-lg font-bold">
              Reviews ({route.reviews})
            </h2>
            <RouteReviews route={route} />
          </div>
        </m.div>
      )}
    </section>
  );
}
