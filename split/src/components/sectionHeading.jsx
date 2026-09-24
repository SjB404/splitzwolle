/*
sectionheading — the "title + explanation + one action" row that opens a content
section.

four pages need it, so it lives here. keeping it in one place is what stops the
second page's heading drifting a margin or a weight away from the first.
*/

export default function SectionHeading({ eyebrow, title, description, action }) {
  return (
    <div className="flex flex-wrap items-end justify-between gap-4">
      <div className="max-w-2xl">
        {eyebrow && (
          <p className="text-xs font-semibold uppercase tracking-[0.22em] text-accent">
            {eyebrow}
          </p>
        )}

        <h2 className={`text-3xl font-bold sm:text-4xl ${eyebrow ? "mt-3" : ""}`}>
          {title}
        </h2>

        {description && (
          <p className="mt-2 text-[15px] text-ink-muted">{description}</p>
        )}
      </div>

      {action}
    </div>
  );
}
