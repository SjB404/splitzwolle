import { useState, type ReactNode } from "react";

/* Requires Tailwind CSS (v3 or v4). No BeerCSS / Material icons needed. */

/* ---------- data ---------- */

type IconName =
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
  | "clock";

const stats: {
  label: string;
  value: string;
  icon: IconName;
  note: string;
  trend?: string;
}[] = [
  {
    label: "Routes in beheer",
    value: "24",
    icon: "route",
    note: "18 gepubliceerd · 4 concept · 2 gearchiveerd",
  },
  {
    label: "Geregistreerde gebruikers",
    value: "1.284",
    icon: "group",
    note: "nieuwe gebruikers deze maand",
    trend: "+86",
  },
  {
    label: "Gestarte wandelingen",
    value: "2.480",
    icon: "walk",
    note: "ten opzichte van augustus",
    trend: "+18%",
  },
  {
    label: "Voltooide wandelingen",
    value: "1.860",
    icon: "check",
    note: "van de gestarte wandelingen",
    trend: "75%",
  },
];

const weeks = [
  { label: "1–7 sep", started: 490, done: 360 },
  { label: "8–14 sep", started: 610, done: 450 },
  { label: "15–21 sep", started: 670, done: 500 },
  { label: "22–30 sep", started: 780, done: 560 },
];

const routes = [
  {
    name: "Historische Singel-route",
    meta: "3,2 km · Wandelen",
    started: 620,
    rating: "4,8",
  },
  {
    name: "Swolla vestingroute",
    meta: "2,8 km · Wandelen",
    started: 420,
    rating: "4,6",
  },
  {
    name: "Sassenpoort & omgeving",
    meta: "2,9 km · Wandelen",
    started: 360,
    rating: "4,5",
  },
];

/* ---------- icons ---------- */

const paths: Record<IconName, ReactNode> = {
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
};

const Icon = ({
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

/* ---------- building blocks ---------- */

const Card = ({
  className = "",
  children,
}: {
  className?: string;
  children: ReactNode;
}) => (
  <article
    className={`rounded-2xl border border-[#E4E4EA] bg-white p-6 shadow-[0_1px_2px_rgba(30,33,64,0.04)] ${className}`}
  >
    {children}
  </article>
);

const CardTitle = ({ children }: { children: ReactNode }) => (
  <h2 className="font-serif text-xl font-semibold tracking-tight text-[#1E2140]">
    {children}
  </h2>
);

const GhostButton = ({
  icon,
  children,
  className = "",
}: {
  icon: IconName;
  children: ReactNode;
  className?: string;
}) => (
  <button
    type="button"
    className={`inline-flex items-center gap-2 rounded-full border border-[#E4E4EA] bg-white px-4 py-2 text-sm font-medium text-[#1E2140] transition hover:border-[#E8711A] hover:text-[#E8711A] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/40 ${className}`}
  >
    <Icon name={icon} className="h-4 w-4" />
    {children}
  </button>
);

/* ---------- sections ---------- */

const StatCard = ({
  label,
  value,
  icon,
  note,
  trend,
}: (typeof stats)[number]) => (
  <Card className="flex flex-col gap-4">
    <div className="flex items-start justify-between gap-3">
      <span className="text-sm font-medium text-[#1E2140]/80">{label}</span>
      <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-[#FBE6D4] text-[#E8711A]">
        <Icon name={icon} />
      </span>
    </div>
    <div className="text-4xl font-semibold leading-none tracking-tight text-[#1E2140] tabular-nums">
      {value}
    </div>
    <p className="text-xs leading-relaxed text-[#6B6E85]">
      {trend && (
        <span className="mr-1.5 inline-flex rounded-full bg-emerald-50 px-2 py-0.5 font-semibold text-emerald-700">
          {trend}
        </span>
      )}
      {note}
    </p>
  </Card>
);

const ActivityChart = () => {
  const max = 800;
  const ticks = [800, 600, 400, 200, 0];

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Wandelactiviteit</CardTitle>
          <p className="mt-1 text-sm text-[#6B6E85]">
            Gestarte en voltooide wandelingen in september
          </p>
        </div>
        <div className="flex gap-4 text-sm text-[#1E2140]">
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#E8711A]" />
            Gestart
          </span>
          <span className="flex items-center gap-2">
            <span className="h-2.5 w-2.5 rounded-full bg-[#2A2F5B]" />
            Voltooid
          </span>
        </div>
      </div>

      <div className="mt-6 flex gap-3">
        {/* y axis */}
        <div className="relative h-56 w-8 text-right text-xs tabular-nums text-[#6B6E85]">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${(t / max) * 100}%` }}
            >
              {t}
            </span>
          ))}
        </div>

        {/* plot */}
        <div className="flex-1">
          <div className="relative h-56 border-b border-[#E4E4EA]">
            {ticks.slice(0, -1).map((t) => (
              <div
                key={t}
                className="absolute inset-x-0 border-t border-dashed border-[#EDEDF2]"
                style={{ bottom: `${(t / max) * 100}%` }}
              />
            ))}

            <div className="relative z-10 flex h-full items-end justify-around">
              {weeks.map((w) => (
                <div
                  key={w.label}
                  className="group relative flex h-full flex-1 items-end justify-center gap-1.5 sm:gap-2"
                >
                  <div
                    className="w-6 rounded-t-lg bg-[#E8711A] transition-opacity group-hover:opacity-90 sm:w-9"
                    style={{ height: `${(w.started / max) * 100}%` }}
                  />
                  <div
                    className="w-6 rounded-t-lg bg-[#2A2F5B] transition-opacity group-hover:opacity-90 sm:w-9"
                    style={{ height: `${(w.done / max) * 100}%` }}
                  />

                  {/* tooltip */}
                  <div className="pointer-events-none absolute bottom-full left-1/2 mb-2 -translate-x-1/2 whitespace-nowrap rounded-lg bg-[#1E2140] px-3 py-2 text-xs text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
                    <div className="font-semibold">{w.label}</div>
                    <div className="mt-0.5 text-white/80">
                      Gestart: {w.started} · Voltooid: {w.done}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="mt-3 flex justify-around text-xs text-[#6B6E85]">
            {weeks.map((w) => (
              <span key={w.label} className="flex-1 text-center">
                {w.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const RatingCard = () => (
  <Card className="flex flex-col">
    <CardTitle>Zo ervaren wandelaars Zwolle</CardTitle>

    <div className="mt-6 flex items-baseline gap-2">
      <span className="font-serif text-5xl font-semibold leading-none text-[#1E2140]">
        4,7
      </span>
      <span className="text-sm text-[#6B6E85]">/ 5 gemiddeld</span>
    </div>

    {/* stars with partial fill (94% = 4,7 / 5) */}
    <div
      className="relative my-4 w-fit"
      role="img"
      aria-label="4,7 van 5 sterren"
    >
      <div className="flex gap-1 text-[#E4E4EA]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" className="h-6 w-6" />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: "94%" }}
      >
        <div className="flex gap-1 text-[#E8711A]">
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" className="h-6 w-6 shrink-0" />
          ))}
        </div>
      </div>
    </div>

    <p className="text-xs text-[#6B6E85]">
      Op basis van 1.486 beoordelingen · alle routes
    </p>

    <blockquote className="mt-auto rounded-xl border-l-4 border-[#E8711A] bg-[#F5EDE3] p-4 pt-4">
      <p className="font-serif text-base italic leading-snug text-[#1E2140]">
        “Prachtige route langs de oude vestingwerken!”
      </p>
      <footer className="mt-2 text-xs text-[#6B6E85]">
        Els van Dijk · Historische Singel-route
      </footer>
    </blockquote>
  </Card>
);

const PopularRoutes = ({ className = "" }: { className?: string }) => {
  const maxStarted = Math.max(...routes.map((r) => r.started));

  return (
    <Card className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Populaire wandelroutes</CardTitle>
        <GhostButton icon="arrow">Alle routes</GhostButton>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-[#E4E4EA] pb-2 text-xs font-medium uppercase tracking-wide text-[#6B6E85] sm:grid-cols-[1fr_160px_90px]">
        <span>Route</span>
        <span>Gestart</span>
        <span className="text-right">Waardering</span>
      </div>

      <ul className="divide-y divide-[#E4E4EA]">
        {routes.map((r, i) => (
          <li
            key={r.name}
            className="grid grid-cols-[1fr_auto_auto] items-center gap-x-6 py-4 sm:grid-cols-[1fr_160px_90px]"
          >
            <div className="flex items-center gap-3">
              <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F1F5] text-sm font-semibold text-[#2A2F5B]">
                {i + 1}
              </span>
              <div>
                <div className="text-sm font-semibold text-[#1E2140]">
                  {r.name}
                </div>
                <div className="text-xs text-[#6B6E85]">{r.meta}</div>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <div className="hidden h-1.5 flex-1 overflow-hidden rounded-full bg-[#F1F1F5] sm:block">
                <div
                  className="h-full rounded-full bg-[#2A2F5B]"
                  style={{ width: `${(r.started / maxStarted) * 100}%` }}
                />
              </div>
              <span className="text-sm font-medium tabular-nums text-[#1E2140]">
                {r.started}
              </span>
            </div>

            <span className="flex items-center justify-end gap-1 text-sm font-semibold text-[#E8711A]">
              <Icon name="star" className="h-4 w-4" />
              {r.rating}
            </span>
          </li>
        ))}
      </ul>
    </Card>
  );
};

const NextSteps = () => (
  <Card className="flex flex-col">
    <CardTitle>Verder met je routes</CardTitle>

    <div className="mt-5 flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBE6D4] text-[#E8711A]">
        <Icon name="edit" />
      </span>
      <div>
        <div className="text-sm font-semibold text-[#1E2140]">
          4 concepten om af te maken
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[#6B6E85]">
          Controleer de routegegevens en deel nieuwe plekken met de community.
        </p>
      </div>
    </div>

    <button
      type="button"
      className="mt-6 inline-flex w-fit items-center gap-2 rounded-full bg-[#E8711A] px-5 py-2.5 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d3640f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/50 focus-visible:ring-offset-2"
    >
      Concepten bekijken
      <Icon name="arrow" className="h-4 w-4" />
    </button>

    <p className="mt-auto pt-8 text-xs text-[#6B6E85]">
      Statistieken bijgewerkt op 1 oktober 2026, 08:00
    </p>
  </Card>
);

/* ---------- routes page ---------- */

const stops = [
  {
    name: "Sassenpoort",
    short: "Sassenpoort",
    tag: "Stadspoort",
    text: "De monumentale stadspoort uit 1409 is het symbool van het middeleeuwse Zwolle.",
    next: "4 min lopen",
    x: 90,
    y: 220,
  },
  {
    name: "De Peperbus",
    short: "Peperbus",
    tag: "Toren",
    text: "De markante toren van de Onze-Lieve-Vrouwekerk is dé blikvanger van de binnenstad.",
    next: "6 min lopen",
    x: 330,
    y: 170,
  },
  {
    name: "Grote Kerk",
    short: "Grote Kerk",
    tag: "Kerk",
    text: "Laatgotische kerk midden in de oude stad, bekend om haar bijzondere orgel.",
    next: "5 min lopen",
    x: 560,
    y: 190,
  },
  {
    name: "Broerenkerk",
    short: "Broerenkerk",
    tag: "Kerk",
    text: "Middeleeuwse kloosterkerk die vandaag een nieuwe bestemming heeft gevonden.",
    next: "4 min lopen",
    x: 790,
    y: 150,
  },
  {
    name: "Museum de Fundatie",
    short: "Museum de Fundatie",
    tag: "Museum",
    text: "Neoclassicistisch gebouw uit 1838 met een opvallende moderne uitbouw op het dak.",
    next: "Einde van de route",
    x: 920,
    y: 120,
  },
];

const ROUTE_PATH =
  "M 90 220 C 180 120, 260 120, 330 170 S 480 260, 560 190 S 700 90, 790 150 S 880 230, 920 120";

/* x, y, width, height of the background "buildings" */
const buildings: [number, number, number, number][] = [
  [30, 40, 70, 40],
  [130, 30, 50, 60],
  [220, 50, 60, 36],
  [310, 30, 70, 44],
  [560, 40, 60, 50],
  [650, 30, 70, 40],
  [760, 50, 50, 44],
  [850, 30, 80, 46],
  [170, 230, 60, 40],
  [250, 215, 40, 30],
  [400, 215, 70, 44],
  [480, 100, 50, 40],
  [640, 210, 60, 40],
  [720, 230, 50, 30],
  [820, 215, 70, 40],
  [930, 190, 50, 50],
];

const RouteMap = () => (
  <div className="overflow-x-auto rounded-xl border border-[#E4E4EA] bg-[#F1F5EC]">
    <svg
      viewBox="0 0 1000 320"
      className="block h-auto w-full min-w-[720px]"
      role="img"
      aria-label="Kaart van de Historische Singel-route met vijf stops"
    >
      <defs>
        <pattern
          id="map-grid"
          width="40"
          height="40"
          patternUnits="userSpaceOnUse"
        >
          <path d="M40 0H0V40" fill="none" stroke="#E3EADB" strokeWidth="1" />
        </pattern>
      </defs>

      <rect width="1000" height="320" fill="url(#map-grid)" />

      {/* park */}
      <ellipse cx="440" cy="85" rx="90" ry="38" fill="#DCEBCB" />

      {/* buildings */}
      {buildings.map(([x, y, w, h]) => (
        <rect
          key={`${x}-${y}`}
          x={x}
          y={y}
          width={w}
          height={h}
          rx={5}
          fill="#E8E2D6"
        />
      ))}

      {/* water (singel) */}
      <path
        d="M -20 270 C 200 310, 400 310, 600 280 S 900 250, 1020 290"
        fill="none"
        stroke="#CFE3F1"
        strokeWidth="28"
        strokeLinecap="round"
      />

      {/* route */}
      <path
        d={ROUTE_PATH}
        fill="none"
        stroke="#fff"
        strokeWidth="11"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d={ROUTE_PATH}
        fill="none"
        stroke="#E8711A"
        strokeWidth="5"
        strokeDasharray="1 11"
        strokeLinecap="round"
      />

      {/* stops */}
      {stops.map((s, i) => (
        <g key={s.name} transform={`translate(${s.x} ${s.y})`}>
          <circle r="27" fill="#E8711A" opacity="0.18" />
          <circle r="17" fill="#E8711A" stroke="#fff" strokeWidth="4" />
          <text
            textAnchor="middle"
            dy="5"
            fontSize="15"
            fontWeight="700"
            fill="#fff"
          >
            {i + 1}
          </text>
          <text
            y="-34"
            textAnchor="middle"
            fontSize="13"
            fontWeight="600"
            fill="#1E2140"
            stroke="#F1F5EC"
            strokeWidth="4"
            paintOrder="stroke"
          >
            {s.short}
          </text>
        </g>
      ))}
    </svg>
  </div>
);

const MetaChip = ({
  icon,
  children,
}: {
  icon: IconName;
  children: ReactNode;
}) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-[#F1F1F5] px-3 py-1 text-xs font-medium text-[#1E2140]">
    <Icon name={icon} className="h-3.5 w-3.5 text-[#E8711A]" />
    {children}
  </span>
);

const StopCard = ({
  stop,
  index,
}: {
  stop: (typeof stops)[number];
  index: number;
}) => (
  <li className="flex flex-col rounded-2xl border border-[#E4E4EA] bg-white p-5 shadow-[0_1px_2px_rgba(30,33,64,0.04)] transition hover:-translate-y-0.5 hover:shadow-md">
    <div className="flex items-center justify-between">
      <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8711A] text-sm font-bold text-white">
        {index + 1}
      </span>
      <span className="rounded-full bg-[#FBE6D4] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#C85F10]">
        {stop.tag}
      </span>
    </div>

    <h3 className="mt-4 font-serif text-lg font-semibold leading-snug text-[#1E2140]">
      {stop.name}
    </h3>
    <p className="mt-2 text-sm leading-relaxed text-[#6B6E85]">{stop.text}</p>

    <div className="mt-auto flex items-center gap-1.5 border-t border-[#E4E4EA] pt-4 text-xs font-medium text-[#6B6E85]">
      <Icon
        name={index === stops.length - 1 ? "pin" : "walk"}
        className="h-4 w-4 text-[#2A2F5B]"
      />
      {stop.next}
    </div>
  </li>
);

const RoutesPage = () => (
  <>
    <div className="flex flex-wrap items-start justify-between gap-4">
      <div>
        <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight">
          Routes
        </h1>
        <p className="mt-1.5 text-sm text-[#6B6E85]">
          Beheer alle wandelroutes in Zwolle.
        </p>
      </div>
      <div className="flex flex-wrap gap-2">
        <GhostButton icon="edit">Route bewerken</GhostButton>
        <button
          type="button"
          className="inline-flex items-center gap-2 rounded-full bg-[#E8711A] px-4 py-2 text-sm font-semibold text-white shadow-sm transition hover:bg-[#d3640f] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/50 focus-visible:ring-offset-2"
        >
          <Icon name="plus" className="h-4 w-4" />
          Locatie toevoegen
        </button>
      </div>
    </div>

    <Card className="mt-8">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap items-center gap-3">
          <CardTitle>Historische Singel-route</CardTitle>
          <span className="rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
            Gepubliceerd
          </span>
        </div>
        <div className="flex flex-wrap gap-2">
          <MetaChip icon="route">3,2 km</MetaChip>
          <MetaChip icon="clock">± 50 min</MetaChip>
          <MetaChip icon="pin">{stops.length} stops</MetaChip>
        </div>
      </div>

      <RouteMap />
    </Card>

    <section className="mt-8">
      <div className="mb-4 flex items-end justify-between">
        <h2 className="font-serif text-xl font-semibold tracking-tight">
          Stops langs de route
        </h2>
        <span className="text-sm text-[#6B6E85]">{stops.length} locaties</span>
      </div>

      <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
        {stops.map((s, i) => (
          <StopCard key={s.name} stop={s} index={i} />
        ))}
      </ol>
    </section>
  </>
);

/* ---------- page ---------- */

const tabs = [
  { key: "overzicht", icon: "dashboard", label: "Overzicht" },
  { key: "routes", icon: "route", label: "Routes" },
] as const;

type TabKey = (typeof tabs)[number]["key"];

export default function ZwolleRoutesOverzicht() {
  const [tab, setTab] = useState<TabKey>("overzicht");

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9FB] font-sans text-[#1E2140] antialiased">
      {/* Fonts (or move to index.html / tailwind config) */}
      <style>{`
        @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&family=Playfair+Display:ital,wght@0,500;0,600;0,700;1,500&display=swap');
        .font-sans { font-family: Inter, ui-sans-serif, system-ui, sans-serif; }
        .font-serif { font-family: 'Playfair Display', ui-serif, Georgia, serif; }
      `}</style>

      {/* top bar */}
      <header className="sticky top-0 z-20 border-b border-[#E4E4EA] bg-white/90 backdrop-blur">
        <div className="mx-auto flex h-16 max-w-[1200px] items-center justify-between px-6">
          <div className="flex items-center gap-3">
            <span className="font-serif text-xl font-bold">Zwolle Routes</span>
            <span className="rounded-full border border-[#E4E4EA] bg-[#F1F1F5] px-2.5 py-0.5 text-[10px] font-semibold tracking-widest text-[#2A2F5B]">
              BEHEER
            </span>
          </div>

          <div className="flex items-center gap-6">
            <a
              href="/"
              className="hidden items-center gap-1.5 text-sm text-[#1E2140] transition hover:text-[#E8711A] sm:flex"
            >
              <Icon name="external" className="h-4 w-4" />
              Naar de website
            </a>
            <div className="flex items-center gap-3 sm:border-l sm:border-[#E4E4EA] sm:pl-6">
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE6D4] text-xs font-semibold text-[#E8711A]">
                JB
              </div>
              <div className="hidden leading-tight sm:block">
                <div className="text-sm font-semibold">J. Bakker</div>
                <div className="text-xs text-[#6B6E85]">Beheerder</div>
              </div>
            </div>
          </div>
        </div>

        {/* tabs */}
        <nav
          className="mx-auto flex max-w-[1200px] gap-6 px-6"
          aria-label="Hoofdnavigatie"
        >
          {tabs.map(({ key, icon, label }) => {
            const active = tab === key;
            return (
              <button
                key={key}
                type="button"
                onClick={() => setTab(key)}
                aria-current={active ? "page" : undefined}
                className={`-mb-px flex items-center gap-2 border-b-2 py-3 text-sm font-medium transition focus:outline-none focus-visible:text-[#E8711A] ${
                  active
                    ? "border-[#E8711A] text-[#E8711A]"
                    : "border-transparent text-[#6B6E85] hover:text-[#1E2140]"
                }`}
              >
                <Icon name={icon} className="h-4 w-4" />
                {label}
              </button>
            );
          })}
        </nav>
      </header>

      <main className="mx-auto w-full max-w-[1200px] flex-1 px-6 py-8">
        {tab === "overzicht" ? (
          <>
            <div className="flex flex-wrap items-start justify-between gap-4">
              <div>
                <h1 className="font-serif text-4xl font-semibold leading-tight tracking-tight">
                  Overzicht
                </h1>
                <p className="mt-1.5 text-sm text-[#6B6E85]">
                  Een frisse blik op de routes en wandelaars in Zwolle.
                </p>
              </div>
              <GhostButton icon="calendar">September 2026</GhostButton>
            </div>

            <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {stats.map((s) => (
                <StatCard key={s.label} {...s} />
              ))}
            </section>

            <section className="mt-4 grid gap-4 lg:grid-cols-3">
              <ActivityChart />
              <RatingCard />
              <PopularRoutes className="lg:col-span-2" />
              <NextSteps />
            </section>
          </>
        ) : (
          <RoutesPage />
        )}
      </main>

      <footer className="border-t border-[#E4E4EA]">
        <div className="mx-auto flex max-w-[1200px] flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-[#6B6E85]">
          <span>© 2026 Zwolle Routes</span>
          <span>Beheeromgeving · Alleen toegankelijk voor beheerders</span>
        </div>
      </footer>
    </div>
  );
}
