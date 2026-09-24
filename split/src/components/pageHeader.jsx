/*
pageheader — the band every content page opens with.

it is the hero's shape without the artwork: band, eyebrow, big heading, lead
paragraph, and then whatever the page passes as children (a search field, a filter
row).

the band is inverse-surface, so it follows the theme: white in light mode, deep navy
in dark.

breadcrumb sits above the eyebrow. it is a node and not data, because each page owns
how its own links are built.

it sets the document title too, so every page names itself in the tab and in history.
*/

import PageTitle from "./pageTitle.jsx";

export default function PageHeader({ breadcrumb, eyebrow, title, description, children }) {
  return (
    <section className="inverse-surface">
      <PageTitle title={title} />

      <div className="mx-auto max-w-[100rem] px-5 py-16 sm:px-8 sm:py-20">
        {breadcrumb}

        {eyebrow && (
          <p
            className={`text-xs font-semibold uppercase tracking-[0.22em] text-accent ${
              breadcrumb ? "mt-6" : ""
            }`}
          >
            {eyebrow}
          </p>
        )}

        <h1
          className={`text-4xl leading-[1.08] font-bold sm:text-5xl ${
            eyebrow ? "mt-5" : ""
          }`}
        >
          {title}
        </h1>

        {description && (
          <p className="mt-6 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}

        {children}
      </div>
    </section>
  );
}
