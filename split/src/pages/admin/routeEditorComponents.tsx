import {
  useLayoutEffect,
  useRef,
  useState,
  type FormEvent,
  type MouseEvent,
  type ReactNode,
} from "react";
import { MAP_IMAGES, MAP_SIZE } from "../../data/maps.ts";
import {
  estimatedWalkingMinutes,
  fmtKm,
  hasMapDistance,
  SHAPES,
  TAGS,
  weekLabels,
  statusMeta,
} from "./dashboardTypes.ts";
import type {
  MapPoint,
  Route,
  RouteValues,
  Status,
  Stop,
} from "./dashboardTypes.ts";
import { Icon, paths, TAG_ICONS } from "./dashboardIcons.tsx";
import {
  Field,
  inputCls,
  PathThumb,
  PrimaryButton,
  StatusBadge,
} from "./dashboardComponents.tsx";

export const RouteMap = ({
  route,
  activeIndex,
  onMapClick,
}: {
  route: Route;
  activeIndex: number | null;
  onMapClick: (point: MapPoint) => void;
}) => {
  const shape = SHAPES[route.shape];
  const pathRef = useRef<SVGPathElement>(null);
  const [legacyPoints, setLegacyPoints] = useState<MapPoint[]>([]);
  const n = route.stops.length;

  useLayoutEffect(() => {
    const el = pathRef.current;
    if (!el) return;
    const len = el.getTotalLength();
    setLegacyPoints(
      Array.from({ length: n }, (_, i) => {
        const t = n <= 1 ? 0 : shape.loop ? i / n : i / (n - 1);
        const p = el.getPointAtLength(t * len);
        return {
          x: (p.x / 1000) * MAP_SIZE.width,
          y: (p.y / 320) * MAP_SIZE.height,
        };
      }),
    );
  }, [shape, n]);

  const points: MapPoint[] = route.stops.map((stop, i) =>
    stop.mapX !== null && stop.mapY !== null
      ? {
          x: (stop.mapX / 100) * MAP_SIZE.width,
          y: (stop.mapY / 100) * MAP_SIZE.height,
        }
      : (legacyPoints[i] ?? {
          x: MAP_SIZE.width / 2,
          y: MAP_SIZE.height / 2,
        }),
  );
  const onClick = (event: MouseEvent<HTMLDivElement>) => {
    const bounds = event.currentTarget.getBoundingClientRect();
    const x = event.clientX - bounds.left - event.currentTarget.clientLeft;
    const y = event.clientY - bounds.top - event.currentTarget.clientTop;
    onMapClick({
      x: Math.max(0, Math.min(100, (x / event.currentTarget.clientWidth) * 100)),
      y: Math.max(0, Math.min(100, (y / event.currentTarget.clientHeight) * 100)),
    });
  };

  return (
    <div
      className="relative cursor-crosshair overflow-hidden rounded-xl border border-line"
      role="button"
      tabIndex={0}
      aria-label={`Kaart voor ${route.name}. Klik om een routepunt toe te voegen.`}
      onClick={onClick}
      onKeyDown={(event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          onMapClick({ x: 50, y: 50 });
        }
      }}
    >
      <img
        src={MAP_IMAGES.roads.src}
        alt={MAP_IMAGES.roads.alt}
        width={MAP_SIZE.width}
        height={MAP_SIZE.height}
        className="block h-auto w-full"
      />
      <svg
        viewBox={`0 0 ${MAP_SIZE.width} ${MAP_SIZE.height}`}
        className="pointer-events-none absolute inset-0 h-full w-full"
        aria-hidden="true"
      >
        <path ref={pathRef} d={shape.path} fill="none" stroke="none" />
        {points.length > 1 && (
          <>
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="white"
              strokeWidth="20"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
            <polyline
              points={points.map((p) => `${p.x},${p.y}`).join(" ")}
              fill="none"
              stroke="var(--color-orange-500)"
              strokeWidth="11"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </>
        )}

        {route.stops.map((s, i) => {
          const p = points[i];
          if (!p) return null;
          const active = activeIndex === i;
          return (
            <g key={s.id} transform={`translate(${p.x} ${p.y})`}>
              <circle
                r={active ? 26 : 22}
                fill="var(--color-orange-500)"
                opacity={active ? 0.3 : 0.18}
              />
              <circle
                r={active ? 19 : 16}
                fill="var(--color-orange-500)"
                stroke="white"
                strokeWidth="4"
              />
              <text
                textAnchor="middle"
                dy="5"
                fontSize="14"
                fontWeight="700"
                fill="white"
              >
                {i + 1}
              </text>
              <g transform="translate(-11 -45)" className="text-[#1E2140]">
                <circle
                  cx="11"
                  cy="11"
                  r="11"
                  fill="white"
                  stroke="var(--color-orange-500)"
                  strokeWidth="2"
                />
                <svg
                  x="4"
                  y="4"
                  width="14"
                  height="14"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  {paths[TAG_ICONS[s.tag] ?? "other"]}
                </svg>
              </g>
            </g>
          );
        })}
      </svg>
      <span className="surface-container-lowest pointer-events-none absolute bottom-3 left-3 rounded-full border border-line px-3 py-1.5 text-xs font-semibold text-ink">
        Klik op de kaart om routepunten toe te voegen
      </span>
    </div>
  );
};

const IconBtn = ({
  label,
  onClick,
  disabled,
  danger,
  children,
}: {
  label: string;
  onClick: () => void;
  disabled?: boolean;
  danger?: boolean;
  children: ReactNode;
}) => (
  <button
    type="button"
    aria-label={label}
    title={label}
    onClick={onClick}
    disabled={disabled}
    className={`flex h-8 w-8 items-center justify-center rounded-full border border-[#E4E4EA] text-[#6B6E85] transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/40 disabled:cursor-not-allowed disabled:opacity-35 ${
      danger
        ? "hover:border-red-300 hover:bg-red-50 hover:text-red-600"
        : "hover:border-[#E8711A] hover:text-[#E8711A]"
    }`}
  >
    {children}
  </button>
);

export const StopCard = ({
  stop: s,
  index,
  total,
  leg,
  loop,
  onHover,
  onMove,
  onRemove,
}: {
  stop: Stop;
  index: number;
  total: number;
  leg: number;
  loop: boolean;
  onHover: (i: number | null) => void;
  onMove: (dir: -1 | 1) => void;
  onRemove: () => void;
}) => {
  const last = index === total - 1;
  return (
    <li
      onMouseEnter={() => onHover(index)}
      onMouseLeave={() => onHover(null)}
      onFocus={() => onHover(index)}
      onBlur={() => onHover(null)}
      className="flex flex-col rounded-2xl border border-[#E4E4EA] bg-white p-5 shadow-[0_1px_2px_rgba(30,33,64,0.04)] transition hover:-translate-y-0.5 hover:shadow-md"
    >
      <div className="flex items-center justify-between">
        <span className="flex h-9 w-9 items-center justify-center rounded-full bg-[#E8711A] text-sm font-bold text-white">
          {index + 1}
        </span>
        <span className="rounded-full bg-[#FBE6D4] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-wide text-[#C85F10]">
          {s.tag}
        </span>
      </div>

      <h3 className="mt-4 font-display text-lg font-semibold leading-snug text-[#1E2140]">
        {s.name}
      </h3>
      <p className="mt-2 text-sm leading-relaxed text-[#6B6E85]">
        {s.text || "Nog geen beschrijving."}
      </p>

      <div className="mt-auto border-t border-[#E4E4EA] pt-4">
        <div className="flex items-center gap-1.5 text-xs font-medium text-[#6B6E85]">
          <Icon
            name={last ? "pin" : "walk"}
            className="h-4 w-4 text-[#2A2F5B]"
          />
          {last
            ? loop
              ? "Terug bij het startpunt"
              : "Einde van de route"
            : `${leg} min lopen`}
        </div>
        <div className="mt-3 flex gap-1.5">
          <IconBtn
            label="Eerder in de route"
            onClick={() => onMove(-1)}
            disabled={index === 0}
          >
            <Icon name="arrow" className="h-4 w-4 rotate-180" />
          </IconBtn>
          <IconBtn
            label="Later in de route"
            onClick={() => onMove(1)}
            disabled={last}
          >
            <Icon name="arrow" className="h-4 w-4" />
          </IconBtn>
          <IconBtn label={`Verwijder ${s.name}`} onClick={onRemove} danger>
            <Icon name="trash" className="h-4 w-4" />
          </IconBtn>
        </div>
      </div>
    </li>
  );
};

export const RouteTile = ({
  route,
  selected,
  onSelect,
}: {
  route: Route;
  selected: boolean;
  onSelect: () => void;
}) => (
  <button
    type="button"
    onClick={onSelect}
    aria-pressed={selected}
    className={`flex h-auto min-h-0 w-full min-w-0 flex-col items-stretch justify-start gap-3 overflow-hidden rounded-2xl border bg-white p-3 text-left shadow-[0_1px_2px_rgba(30,33,64,0.04)] transition hover:-translate-y-0.5 hover:shadow-md focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/40 ${
      selected
        ? "border-[#E8711A] ring-2 ring-[#E8711A]/25"
        : "border-[#E4E4EA]"
    }`}
  >
    <PathThumb shapeIndex={route.shape} className="h-20" />
    <div className="min-w-0 px-1 pb-1">
      <div className="flex items-start justify-between gap-2">
        <span className="min-w-0 wrap-break-word text-sm font-semibold leading-snug text-[#1E2140]">
          {route.name}
        </span>
      </div>
      <div
        className="mt-3 grid w-full min-w-0 grid-cols-3 divide-x divide-line"
        aria-label={`${fmtKm(route.km)} kilometer, ${route.minutes} minuten, ${route.stops.length} stops`}
      >
        {(
          [
            {
              icon: "route",
              label: "Afstand",
              value: `${hasMapDistance(route) ? "~ " : ""}${fmtKm(route.km)} km`,
              title: undefined,
            },
            {
              icon: "clock",
              label: "Looptijd",
              value: `${hasMapDistance(route) ? "~ " : ""}${hasMapDistance(route) ? estimatedWalkingMinutes(route) : route.minutes} min`,
              title: hasMapDistance(route)
                ? "Geschatte looptijd bij 3 km/u"
                : undefined,
            },
            {
              icon: "pin",
              label: "Stops",
              value: String(route.stops.length),
              title: undefined,
            },
          ] as const
        ).map((stat) => (
          <div
            key={stat.label}
            title={stat.title}
            className="flex min-w-0 flex-col items-center justify-center gap-1 px-1 py-1.5"
          >
            <span className="flex min-w-0 items-center justify-center gap-1 whitespace-nowrap text-[10px] font-medium leading-none text-ink-muted">
              <Icon
                name={stat.icon}
                className="h-3 w-3 shrink-0 text-accent"
              />
              {stat.label}
            </span>
            <span className="whitespace-nowrap text-xs font-bold leading-none tabular-nums text-heading">
              {stat.value}
            </span>
          </div>
        ))}
      </div>
      <div className="mt-2">
        <StatusBadge status={route.status} />
      </div>
    </div>
  </button>
);

export const WeekBars = ({ values }: { values: number[] }) => {
  const max = Math.max(...values, 1);
  return (
    <div>
      <div className="flex h-40 items-end gap-4 border-b border-[#E4E4EA]">
        {values.map((v, i) => (
          <div
            key={i}
            className="flex h-full flex-1 flex-col items-center justify-end gap-1.5"
          >
            <span className="text-xs font-semibold tabular-nums text-[#1E2140]">
              {v}
            </span>
            <div
              className="w-full max-w-[64px] rounded-t-lg bg-[#2A2F5B] transition-[height] duration-500"
              style={{ height: `${Math.max((v / max) * 72, v > 0 ? 4 : 1)}%` }}
            />
          </div>
        ))}
      </div>
      <div className="mt-3 flex gap-4 text-xs text-[#6B6E85]">
        {weekLabels.map((l) => (
          <span key={l} className="flex-1 text-center">
            {l}
          </span>
        ))}
      </div>
    </div>
  );
};

export const RouteForm = ({
  mode,
  initial,
  submitLabel,
  onSubmit,
}: {
  mode: "create" | "edit";
  initial: {
    name: string;
    description: string;
    km: string;
    minutes: string;
    status: Status;
    shape: number;
  };
  submitLabel: string;
  onSubmit: (v: RouteValues) => void;
}) => {
  const [d, setD] = useState(initial);
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!d.name.trim()) return setError("Geef de route een naam.");
    if (!d.description.trim())
      return setError("Geef de route een beschrijving.");
    if (mode === "create") {
      onSubmit({
        mode,
        name: d.name.trim(),
        description: d.description.trim(),
      });
      return;
    }

    const km = parseFloat(d.km.replace(",", "."));
    const minutes = parseInt(d.minutes, 10);
    if (!(km > 0)) return setError("Vul een geldige afstand in.");
    if (!(minutes > 0)) return setError("Vul een geldige duur in.");
    onSubmit({
      mode,
      name: d.name.trim(),
      description: d.description.trim(),
      km,
      minutes,
      status: d.status,
      shape: d.shape,
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Naam van de route">
        <input
          autoFocus
          className={inputCls}
          value={d.name}
          onChange={(e) => setD({ ...d, name: e.target.value })}
          placeholder="Bijv. Hanzestad-wandeling"
        />
      </Field>

      <Field label="Beschrijving">
        <textarea
          className={inputCls}
          rows={3}
          value={d.description}
          onChange={(e) => setD({ ...d, description: e.target.value })}
          placeholder="Beschrijf wat bezoekers onderweg kunnen verwachten."
        />
      </Field>

      {mode === "edit" && (
        <>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Afstand (km)">
              <input
                className={inputCls}
                inputMode="decimal"
                value={d.km}
                onChange={(e) => setD({ ...d, km: e.target.value })}
              />
            </Field>
            <Field label="Duur (min)">
              <input
                className={inputCls}
                inputMode="numeric"
                value={d.minutes}
                onChange={(e) => setD({ ...d, minutes: e.target.value })}
              />
            </Field>
          </div>

          <Field label="Status">
            <select
              className={inputCls}
              value={d.status}
              onChange={(e) => setD({ ...d, status: e.target.value as Status })}
            >
              {(Object.keys(statusMeta) as Status[]).map((s) => (
                <option key={s} value={s}>
                  {statusMeta[s].label}
                </option>
              ))}
            </select>
          </Field>
        </>
      )}

      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}

      <div className="flex justify-end pt-2">
        <PrimaryButton type="submit">{submitLabel}</PrimaryButton>
      </div>
    </form>
  );
};

export const StopForm = ({
  onSubmit,
  mapPoint,
}: {
  onSubmit: (v: {
    name: string;
    tag: string;
    text: string;
    mapX?: number;
    mapY?: number;
  }) => void;
  mapPoint: MapPoint | null;
}) => {
  const [name, setName] = useState("");
  const [tag, setTag] = useState(TAGS[0]);
  const [text, setText] = useState("");
  const [error, setError] = useState("");

  const submit = (e: FormEvent) => {
    e.preventDefault();
    if (!name.trim()) return setError("Geef de locatie een naam.");
    onSubmit({
      name: name.trim(),
      tag,
      text: text.trim(),
      ...(mapPoint ? { mapX: mapPoint.x, mapY: mapPoint.y } : {}),
    });
  };

  return (
    <form onSubmit={submit} className="space-y-4">
      <Field label="Naam van de locatie">
        <input
          autoFocus
          className={inputCls}
          value={name}
          onChange={(e) => setName(e.target.value)}
          placeholder="Bijv. Wijndragerstoren"
        />
      </Field>
      <Field label="Soort">
        <select
          className={inputCls}
          value={tag}
          onChange={(e) => setTag(e.target.value)}
        >
          {TAGS.map((t) => (
            <option key={t}>{t}</option>
          ))}
        </select>
      </Field>
      <Field label="Korte beschrijving">
        <textarea
          rows={3}
          className={inputCls}
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Wat maakt deze plek bijzonder?"
        />
      </Field>
      {mapPoint && (
        <p className="text-sm text-ink-muted">
          Deze locatie wordt geplaatst op de plek die je op de kaart hebt
          aangeklikt.
        </p>
      )}
      {error && (
        <p role="alert" className="text-sm font-medium text-red-600">
          {error}
        </p>
      )}
      <div className="flex justify-end pt-2">
        <PrimaryButton type="submit" icon="plus">
          Locatie toevoegen
        </PrimaryButton>
      </div>
    </form>
  );
};
