/*
reviewform — the form under the reviews.

nothing is submitted: there is no api yet, and the backend belongs to somebody
else. the submit handler only stops the page reloading.

the comment box is uncontrolled, because nothing reads it back. the rating is
controlled, because the text under it has to show the value while it is dragged.
*/

import { useState } from "react";

/* the rating scale, used by the slider, its label and the hidden description */
const RATING_SCALE_MAX = 5;

export default function ReviewForm() {
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

        {/* mx-0 max-w-sm cancels the inline margins beerCSS puts on .slider, so the
            track lines up with the fields above and stops growing on a wide column */}
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
          {/* the empty span is the filled part of the slider track */}
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
        <button type="submit" className="ripple">
          Review plaatsen
        </button>
      </div>
    </form>
  );
}
