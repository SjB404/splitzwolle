import type { ReactNode } from "react";

export type IconName =
  | "route"
  | "group"
  | "walk"
  | "check"
  | "edit"
  | "arrow"
  | "external"
  | "calendar"
  | "dashboard"
  | "star"
  | "plus"
  | "pin"
  | "clock"
  | "gate"
  | "tower"
  | "church"
  | "museum"
  | "water"
  | "park"
  | "square"
  | "street"
  | "other"
  | "close"
  | "trash"
  | "search"
  | "chevron";

export const paths: Record<IconName, ReactNode> = {
  route: (
    <>
      <circle cx="6" cy="19" r="2.5" />
      <circle cx="18" cy="5" r="2.5" />
      <path d="M8.5 19H15a3.5 3.5 0 0 0 0-7H9a3.5 3.5 0 0 1 0-7h6.5" />
    </>
  ),
  group: (
    <>
      <circle cx="9" cy="8" r="3.5" />
      <path d="M2.5 20a6.5 6.5 0 0 1 13 0" />
      <path d="M16 4.7a3.5 3.5 0 0 1 0 6.6M18.5 14.2A6.5 6.5 0 0 1 21.5 20" />
    </>
  ),
  walk: (
    <>
      <circle cx="13" cy="4.5" r="2" />
      <path d="m9 21 2.5-6-2-2.5 1-4.5 3-1 2.5 3.5 3 .5M12 8.5 8 10l-1 3.5M13.5 14.5 16 21" />
    </>
  ),
  check: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="m8 12.5 3 3 5-6" />
    </>
  ),
  edit: (
    <>
      <path d="M4 20h4L19 9a2.8 2.8 0 0 0-4-4L4 16v4Z" />
      <path d="m13.5 6.5 4 4" />
    </>
  ),
  arrow: <path d="M5 12h14m-6-6 6 6-6 6" />,
  external: <path d="M7 17 17 7M8 7h9v9" />,
  calendar: (
    <>
      <rect x="3.5" y="5" width="17" height="15.5" rx="2.5" />
      <path d="M8 3v4M16 3v4M3.5 10h17" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3.5" y="3.5" width="7" height="9" rx="1.5" />
      <rect x="13.5" y="3.5" width="7" height="5" rx="1.5" />
      <rect x="13.5" y="11.5" width="7" height="9" rx="1.5" />
      <rect x="3.5" y="15.5" width="7" height="5" rx="1.5" />
    </>
  ),
  star: (
    <path
      d="m12 3 2.7 5.6 6.1.9-4.4 4.3 1 6.1L12 17l-5.4 2.9 1-6.1-4.4-4.3 6.1-.9L12 3Z"
      fill="currentColor"
      stroke="none"
    />
  ),
  plus: <path d="M12 5v14M5 12h14" />,
  pin: (
    <>
      <path d="M12 21s7-6.2 7-11.5a7 7 0 0 0-14 0C5 14.8 12 21 12 21Z" />
      <circle cx="12" cy="9.5" r="2.5" />
    </>
  ),
  clock: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M12 7v5l3 2" />
    </>
  ),
  gate: (
    <>
      <path d="M4 20V8l8-4 8 4v12M8 20v-7h8v7M4 10h16" />
    </>
  ),
  tower: (
    <>
      <path d="M6 21V8l2-4h8l2 4v13M4 21h16M9 9h.01M15 9h.01M10 14h4v7" />
    </>
  ),
  church: (
    <>
      <path d="M5 21V10l7-4 7 4v11M3 21h18M12 2v7M9 5h6M9 14h.01M15 14h.01M10 21v-4h4v4" />
    </>
  ),
  museum: (
    <>
      <path d="m3 9 9-6 9 6M4 10h16M5 20h14M3 22h18M7 10v10M12 10v10M17 10v10" />
    </>
  ),
  water: (
    <>
      <path d="M12 3C9 7 6 10 6 14a6 6 0 0 0 12 0c0-4-3-7-6-11Z" />
      <path d="M9 15a3 3 0 0 0 3 3" />
    </>
  ),
  park: (
    <>
      <path d="M12 22v-8M8 22h8M12 3 7 11h3l-4 6h12l-4-6h3l-5-8Z" />
    </>
  ),
  square: (
    <>
      <path d="M4 4h16v16H4zM8 8h.01M16 8h.01M8 16h.01M16 16h.01" />
    </>
  ),
  street: (
    <>
      <path d="m8 3-4 18M16 3l4 18M12 5v3m0 4v3m0 4v2" />
    </>
  ),
  other: <path d="M12 3v18M3 12h18" />,
  close: <path d="M6 6l12 12M18 6 6 18" />,
  trash: (
    <path d="M4 7h16M10 11v6M14 11v6M6 7l1 12a2 2 0 0 0 2 2h6a2 2 0 0 0 2-2l1-12M9 7V4h6v3" />
  ),
  search: (
    <>
      <circle cx="11" cy="11" r="7" />
      <path d="m20 20-4-4" />
    </>
  ),
  chevron: <path d="m6 9 6 6 6-6" />,
};

export const TAG_ICONS: Record<string, IconName> = {
  Stadspoort: "gate",
  Toren: "tower",
  Kerk: "church",
  Museum: "museum",
  Gracht: "water",
  Water: "water",
  Park: "park",
  Plein: "square",
  Straat: "street",
  Overig: "other",
};

export const Icon = ({
  name,
  className = "h-5 w-5",
}: {
  name: IconName;
  className?: string;
}) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth={1.8}
    strokeLinecap="round"
    strokeLinejoin="round"
    className={className}
    aria-hidden="true"
  >
    {paths[name]}
  </svg>
);
