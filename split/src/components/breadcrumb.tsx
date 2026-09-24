/*
breadcrumb — the "back to the overview" trail a sub page opens with.

two pages needed this, so it lives here instead of being copied twice: that way
the second copy cannot drift a gap or an icon away from the first.

to/label are the parent page, current is where the reader is. it is handed to
PageHeader as its breadcrumb prop.
*/

import { Link } from "react-router-dom";
import Icon from "./icon.tsx";

interface BreadcrumbProps {
  /* the parent page the trail leads back to */
  to: string;
  label: string;
  /* where the reader is now, printed as text and not as a link */
  current: string;
}

export default function Breadcrumb({ to, label, current }: BreadcrumbProps) {
  return (
    <nav
      aria-label="Kruimelpad"
      className="flex flex-wrap items-center gap-2 text-sm text-ink-muted"
    >
      <Link
        to={to}
        className="inline-flex items-center gap-1.5 transition-colors hover:text-ink"
      >
        <Icon name="arrow_back" className="text-base" />
        {label}
      </Link>

      <Icon name="chevron_right" className="text-base" />

      <span className="text-ink">{current}</span>
    </nav>
  );
}
