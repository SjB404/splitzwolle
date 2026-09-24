/*
filterpanel — the card above a list that holds its controls and its count.

the controls come in as children. the bottom row shows how much is left and, if
onReset was passed, a button to clear the filters.

the count is aria-live, so a screen reader hears the list shrink while typing.
the sentence is built by the caller because it is Dutch and inflects
("1 route" vs "2 routes").

pass onReset as undefined and no button is drawn: the panel never decides
whether a filter can be reset, it only draws what it is given.
*/

import Icon from "./icon.jsx";

export default function FilterPanel({ children, resultLabel, onReset }) {
  return (
    <article className="p-5">
      {children}

      <div className="mt-5 flex flex-wrap items-center gap-3 border-t border-line pt-5">
        <p className="text-sm text-ink-muted" aria-live="polite">
          {resultLabel}
        </p>

        {onReset && (
          <button
            type="button"
            onClick={onReset}
            className="button border text-ink ripple ml-auto"
          >
            <Icon name="close" className="mr-1.5 text-base" />
            Filters wissen
          </button>
        )}
      </div>
    </article>
  );
}
