/* pt-header not py-band: only the space below the title follows the section rhythm */

import type { ReactNode } from "react";
import PageTitle from "./pageTitle.tsx";
import Container from "./container.tsx";

interface PageHeaderProps {
  title: string;
  description?: string;
  eyebrow?: string;
  breadcrumb?: ReactNode;
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

      <Container className="pt-header pb-band">
        {breadcrumb}

        {eyebrow && (
          <p
            className={`text-xs font-semibold uppercase tracking-[0.22em] text-accent ${
              breadcrumb ? "mt-4" : ""
            }`}
          >
            {eyebrow}
          </p>
        )}

        <h1 className={`text-headline font-bold ${eyebrow ? "mt-3" : ""}`}>
          {title}
        </h1>

        {description && (
          <p className="mt-4 max-w-2xl text-[15px] leading-relaxed text-ink-muted">
            {description}
          </p>
        )}

        {children}
      </Container>
    </section>
  );
}
