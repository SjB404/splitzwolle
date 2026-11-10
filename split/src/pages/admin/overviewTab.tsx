import { useState } from "react";
import { fmtKm, fmtRating, nf } from "./dashboardTypes.ts";
import type { Month, Overview, Route, Status } from "./dashboardTypes.ts";
import { Icon } from "./dashboardIcons.tsx";
import type { IconName } from "./dashboardIcons.tsx";
import {
  Card,
  CardTitle,
  GhostButton,
  PrimaryButton,
} from "./dashboardComponents.tsx";

const StatCard = ({
  label,
  value,
  icon,
  note,
  trend,
}: {
  label: string;
  value: string;
  icon: IconName;
  note: string;
  trend?: string;
}) => (
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

const ActivityChart = ({ month }: { month: Month }) => {
  const peak = Math.max(...month.weeks.map((w) => w.started));
  const max = Math.max(200, Math.ceil(peak / 200) * 200);
  const ticks = [0, 1, 2, 3, 4].map((i) => max - (max / 4) * i);

  return (
    <Card className="lg:col-span-2">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <CardTitle>Wandelactiviteit</CardTitle>
          <p className="mt-1 text-sm text-[#6B6E85]">
            Gestarte en voltooide wandelingen in {month.name}
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
        <div className="relative h-56 w-8 text-right text-xs tabular-nums text-[#6B6E85]">
          {ticks.map((t) => (
            <span
              key={t}
              className="absolute right-0 translate-y-1/2 leading-none"
              style={{ bottom: `${(t / max) * 100}%` }}
            >
              {Math.round(t)}
            </span>
          ))}
        </div>

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
              {month.weeks.map((w, i) => (
                <div
                  key={i}
                  className="group relative flex h-full flex-1 items-end justify-center gap-1.5 sm:gap-2"
                >
                  <div
                    className="w-6 rounded-t-lg bg-[#E8711A] transition-[height] duration-500 group-hover:opacity-90 sm:w-9"
                    style={{ height: `${(w.started / max) * 100}%` }}
                  />
                  <div
                    className="w-6 rounded-t-lg bg-[#2A2F5B] transition-[height] duration-500 group-hover:opacity-90 sm:w-9"
                    style={{ height: `${(w.done / max) * 100}%` }}
                  />
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
            {month.weeks.map((w, i) => (
              <span key={i} className="flex-1 text-center">
                {w.label}
              </span>
            ))}
          </div>
        </div>
      </div>
    </Card>
  );
};

const RatingCard = ({ avg, count }: { avg: number | null; count: number }) => (
  <Card className="flex flex-col">
    <CardTitle>Zo ervaren wandelaars Zwolle</CardTitle>

    <div className="mt-6 flex items-baseline gap-2">
      <span className="font-display text-5xl font-semibold leading-none text-[#1E2140]">
        {fmtRating(avg)}
      </span>
      <span className="text-sm text-[#6B6E85]">/ 5 gemiddeld</span>
    </div>

    <div
      className="relative my-4 w-fit"
      role="img"
      aria-label={`${fmtRating(avg)} van 5 sterren`}
    >
      <div className="flex gap-1 text-[#E4E4EA]">
        {[0, 1, 2, 3, 4].map((i) => (
          <Icon key={i} name="star" className="h-6 w-6" />
        ))}
      </div>
      <div
        className="absolute inset-y-0 left-0 overflow-hidden"
        style={{ width: `${((avg ?? 0) / 5) * 100}%` }}
      >
        <div className="flex gap-1 text-[#E8711A]">
          {[0, 1, 2, 3, 4].map((i) => (
            <Icon key={i} name="star" className="h-6 w-6 shrink-0" />
          ))}
        </div>
      </div>
    </div>

    <p className="text-xs text-[#6B6E85]">
      {count > 0
        ? `Op basis van ${nf.format(count)} beoordelingen · alle routes`
        : "Nog geen beoordelingen."}
    </p>
  </Card>
);

const PopularRoutes = ({
  routes,
  onOpen,
  onAll,
  className = "",
}: {
  routes: Route[];
  onOpen: (id: string) => void;
  onAll: () => void;
  className?: string;
}) => {
  const top = routes
    .filter((r) => r.status === "gepubliceerd")
    .sort((a, b) => b.started - a.started)
    .slice(0, 4);
  const maxStarted = Math.max(...top.map((r) => r.started), 1);

  return (
    <Card className={className}>
      <div className="mb-4 flex flex-wrap items-center justify-between gap-3">
        <CardTitle>Populaire wandelroutes</CardTitle>
        <GhostButton icon="arrow" onClick={onAll}>
          Alle routes
        </GhostButton>
      </div>

      <div className="grid grid-cols-[1fr_auto_auto] gap-x-6 border-b border-[#E4E4EA] px-2 pb-2 text-xs font-medium uppercase tracking-wide text-[#6B6E85] sm:grid-cols-[1fr_160px_90px]">
        <span>Route</span>
        <span>Gestart</span>
        <span className="text-right">Waardering</span>
      </div>

      {top.length === 0 ? (
        <p className="py-8 text-center text-sm text-[#6B6E85]">
          Nog geen gepubliceerde routes.
        </p>
      ) : (
        <ul className="divide-y divide-[#E4E4EA]">
          {top.map((r, i) => (
            <li key={r.id}>
              <button
                type="button"
                onClick={() => onOpen(r.id)}
                className="grid w-full grid-cols-[1fr_auto_auto] items-center gap-x-6 rounded-lg px-2 py-4 text-left transition hover:bg-[#F9F9FB] focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/40 sm:grid-cols-[1fr_160px_90px]"
              >
                <div className="flex items-center gap-3">
                  <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-[#F1F1F5] text-sm font-semibold text-[#2A2F5B]">
                    {i + 1}
                  </span>
                  <div>
                    <div className="text-sm font-semibold text-[#1E2140]">
                      {r.name}
                    </div>
                    <div className="text-xs text-[#6B6E85]">
                      {fmtKm(r.km)} km · Wandelen
                    </div>
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
                  {fmtRating(r.rating)}
                </span>
              </button>
            </li>
          ))}
        </ul>
      )}
    </Card>
  );
};

const NextSteps = ({
  conceptCount,
  updated,
  onConcepts,
  onAll,
}: {
  conceptCount: number;
  updated: string;
  onConcepts: () => void;
  onAll: () => void;
}) => (
  <Card className="flex flex-col">
    <CardTitle>Verder met je routes</CardTitle>

    <div className="mt-5 flex gap-4">
      <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-xl bg-[#FBE6D4] text-[#E8711A]">
        <Icon name="edit" />
      </span>
      <div>
        <div className="text-sm font-semibold text-[#1E2140]">
          {conceptCount === 0
            ? "Alle concepten zijn afgerond"
            : conceptCount === 1
              ? "1 concept om af te maken"
              : `${conceptCount} concepten om af te maken`}
        </div>
        <p className="mt-1 text-sm leading-relaxed text-[#6B6E85]">
          Controleer de routegegevens en deel nieuwe plekken met de community.
        </p>
      </div>
    </div>

    <PrimaryButton
      className="mt-6 w-fit"
      onClick={conceptCount > 0 ? onConcepts : onAll}
    >
      {conceptCount > 0 ? "Concepten bekijken" : "Alle routes bekijken"}
      <Icon name="arrow" className="h-4 w-4" />
    </PrimaryButton>

    <p className="mt-auto pt-8 text-xs text-[#6B6E85]">
      Statistieken bijgewerkt op {updated}
    </p>
  </Card>
);

export default function OverviewTab({
  routes,
  months,
  rating,
  monthIdx,
  setMonthIdx,
  onOpenRoute,
  onAllRoutes,
  onConcepts,
}: {
  routes: Route[];
  months: Month[];
  rating: Overview["rating"];
  monthIdx: number;
  setMonthIdx: (i: number) => void;
  onOpenRoute: (id: string) => void;
  onAllRoutes: () => void;
  onConcepts: () => void;
}) {
  const [menuOpen, setMenuOpen] = useState(false);
  const m = months[monthIdx] ?? months[months.length - 1];
  const count = (s: Status) => routes.filter((r) => r.status === s).length;

  const stats: {
    label: string;
    value: string;
    icon: IconName;
    note: string;
    trend?: string;
  }[] = [
    {
      label: "Routes in beheer",
      value: String(routes.length),
      icon: "route",
      note: `${count("gepubliceerd")} gepubliceerd · ${count("concept")} concept · ${count("gearchiveerd")} gearchiveerd`,
    },
    {
      label: "Geregistreerde gebruikers",
      value: m.users,
      icon: "group",
      note: "nieuwe gebruikers deze maand",
      trend: m.usersTrend,
    },
    {
      label: "Gestarte wandelingen",
      value: m.started,
      icon: "walk",
      note: `ten opzichte van ${m.prev}`,
      trend: m.startedTrend,
    },
    {
      label: "Voltooide wandelingen",
      value: m.done,
      icon: "check",
      note: "van de gestarte wandelingen",
      trend: m.donePct,
    },
  ];

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Overzicht
          </h1>
          <p className="mt-1.5 text-sm text-[#6B6E85]">
            Een frisse blik op de routes en wandelaars in Zwolle.
          </p>
        </div>

        <div className="relative">
          <GhostButton
            icon="calendar"
            aria-haspopup="listbox"
            aria-expanded={menuOpen}
            onClick={() => setMenuOpen((o) => !o)}
          >
            {m.label}
            <Icon name="chevron" className="h-4 w-4" />
          </GhostButton>

          {menuOpen && (
            <>
              <div
                className="fixed inset-0 z-10"
                onClick={() => setMenuOpen(false)}
              />
              <ul
                role="listbox"
                className="surface-container-high absolute right-0 z-20 mt-2 w-60 rounded-xl border border-line p-1 text-ink"
              >
                {months.map((opt, i) => (
                  <li key={opt.key}>
                    <button
                      type="button"
                      role="option"
                      aria-selected={i === monthIdx}
                      onClick={() => {
                        setMonthIdx(i);
                        setMenuOpen(false);
                      }}
                      className={`flex min-h-12 w-full items-center justify-between rounded-lg px-3 text-left text-sm transition ${
                        i === monthIdx
                          ? "primary-container font-semibold"
                          : "text-ink hover:font-semibold hover:text-accent"
                      }`}
                    >
                      {opt.label}
                      {i === monthIdx && (
                        <Icon name="check" className="h-4 w-4" />
                      )}
                    </button>
                  </li>
                ))}
              </ul>
            </>
          )}
        </div>
      </div>

      <section className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        {stats.map((s) => (
          <StatCard key={s.label} {...s} />
        ))}
      </section>

      <section className="mt-4 grid gap-4 lg:grid-cols-3">
        <ActivityChart month={m} />
        <RatingCard avg={rating.avg} count={rating.count} />
        <PopularRoutes
          routes={routes}
          onOpen={onOpenRoute}
          onAll={onAllRoutes}
          className="lg:col-span-2"
        />
        <NextSteps
          conceptCount={count("concept")}
          updated={m.updated}
          onConcepts={onConcepts}
          onAll={onAllRoutes}
        />
      </section>
    </>
  );
}
