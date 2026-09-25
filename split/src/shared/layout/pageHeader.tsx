/* the band every content page opens with — the hero's shape without the artwork; it also sets the document title, so every page names itself in the tab */

import type { ReactNode } from "react";
import PageTitle from "./pageTitle.tsx";
import Container from "./container.tsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  /* the small all-caps line above the title */
  eyebrow?: string;
  /* a node and not data: each page owns how its own trail is built */
  breadcrumb?: ReactNode;
  /* a lead row that belongs to the band rather than to a section below it */
  children?: ReactNode;
}

export default function PageHeader({
  breadcrumb,
  eyebrow,
  title,
  description,
  children,
}: PageHeaderProps) {
  return (
    <section className="inverse-surface">
      <PageTitle title={title} />

      <Container className="py-16 sm:py-20">
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
      </Container>
    </section>
  );
}
