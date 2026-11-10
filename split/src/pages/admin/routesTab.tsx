import { useEffect, useRef, useState } from "react";
import { api } from "../../../backend/adminApi.ts";
import {
  estimatedWalkingMinutes,
  fmtKm,
  fmtRating,
  hasMapDistance,
  nf,
  SHAPES,
} from "./dashboardTypes.ts";
import type {
  MapPoint,
  Route,
  RouteValues,
  Status,
  StatusFilter,
} from "./dashboardTypes.ts";
import { Icon } from "./dashboardIcons.tsx";
import {
  Card,
  CardTitle,
  GhostButton,
  MetaChip,
  Modal,
  PrimaryButton,
  StatusBadge,
  Toast,
  inputCls,
} from "./dashboardComponents.tsx";
import {
  RouteForm,
  RouteMap,
  RouteTile,
  StopCard,
  StopForm,
  WeekBars,
} from "./routeEditorComponents.tsx";

const filters: { key: StatusFilter; label: string }[] = [
  { key: "alle", label: "Alle" },
  { key: "gepubliceerd", label: "Gepubliceerd" },
  { key: "concept", label: "Concept" },
  { key: "gearchiveerd", label: "Gearchiveerd" },
];

export default function RoutesTab({
  routes,
  setRoutes,
  selectedId,
  setSelectedId,
  filter,
  setFilter,
}: {
  routes: Route[];
  setRoutes: (fn: (rs: Route[]) => Route[]) => void;
  selectedId: string;
  setSelectedId: (id: string) => void;
  filter: StatusFilter;
  setFilter: (f: StatusFilter) => void;
}) {
  const [query, setQuery] = useState("");
  const [modal, setModal] = useState<
    null | "newRoute" | "editRoute" | "addStop" | "deleteRoute"
  >(null);
  const [pendingMapPoint, setPendingMapPoint] = useState<MapPoint | null>(null);
  const [activeStop, setActiveStop] = useState<number | null>(null);
  const [toast, setToast] = useState<string | null>(null);
  const timer = useRef<number>(0);

  useEffect(() => () => window.clearTimeout(timer.current), []);

  const notify = (message: string) => {
    setToast(message);
    window.clearTimeout(timer.current);
    timer.current = window.setTimeout(() => setToast(null), 2800);
  };

  const visible = routes.filter(
    (r) =>
      (filter === "alle" || r.status === filter) &&
      `${r.name} ${r.description}`
        .toLowerCase()
        .includes(query.trim().toLowerCase()),
  );
  const selected =
    visible.find((r) => r.id === selectedId) ?? visible[0] ?? null;
  const countOf = (f: StatusFilter) =>
    f === "alle" ? routes.length : routes.filter((r) => r.status === f).length;

  const replace = (route: Route) =>
    setRoutes((rs) => rs.map((r) => (r.id === route.id ? route : r)));

  const run = async <T,>(fn: () => Promise<T>): Promise<T | null> => {
    try {
      return await fn();
    } catch (e) {
      notify(e instanceof Error ? e.message : "Er ging iets mis.");
      return null;
    }
  };

  const setStatus = async (r: Route, status: Status): Promise<boolean> => {
    if (status === "gepubliceerd" && r.stops.length < 2) {
      notify("Voeg minimaal 2 locaties toe voordat je publiceert.");
      return false;
    }
    const updated = await run(() =>
      api<Route>(`/routes/${r.id}`, {
        method: "PUT",
        body: JSON.stringify({ status }),
      }),
    );
    if (!updated) return false;
    replace(updated);
    notify(
      status === "gepubliceerd"
        ? "Route gepubliceerd"
        : status === "gearchiveerd"
          ? "Route gearchiveerd"
          : "Route teruggezet als concept",
    );
    return true;
  };

  const statusAction =
    selected &&
    (selected.status === "concept"
      ? { label: "Publiceren", next: "gepubliceerd" as Status, primary: true }
      : selected.status === "gepubliceerd"
        ? {
            label: "Archiveren",
            next: "gearchiveerd" as Status,
            primary: false,
          }
        : {
            label: "Terugzetten als concept",
            next: "concept" as Status,
            primary: false,
          });

  const createRoute = async (v: RouteValues) => {
    if (v.mode !== "create") return;
    const created = await run(() =>
      api<Route>("/routes", {
        method: "POST",
        body: JSON.stringify({ name: v.name, description: v.description }),
      }),
    );
    if (!created) return;
    setRoutes((rs) => [...rs, created]);
    setFilter("alle");
    setQuery("");
    setSelectedId(created.id);
    setModal(null);
    notify("Nieuwe route aangemaakt");
  };

  const editRoute = async (v: RouteValues) => {
    if (!selected || v.mode !== "edit") return;
    if (
      v.status !== selected.status &&
      v.status === "gepubliceerd" &&
      selected.stops.length < 2
    ) {
      notify("Voeg minimaal 2 locaties toe voordat je publiceert.");
      return;
    }
    const updated = await run(() =>
      api<Route>(`/routes/${selected.id}`, {
        method: "PUT",
        body: JSON.stringify({
          name: v.name,
          description: v.description,
          km: v.km,
          minutes: v.minutes,
          status: v.status,
          shape: v.shape,
        }),
      }),
    );
    if (!updated) return;
    replace(updated);
    setModal(null);
    notify("Wijzigingen opgeslagen");
  };

  const deleteRoute = async () => {
    if (!selected) return;
    const done = await run(() =>
      api<{ ok: true }>(`/routes/${selected.id}`, { method: "DELETE" }),
    );
    if (!done) return;
    setRoutes((rs) => rs.filter((r) => r.id !== selected.id));
    setModal(null);
    notify("Route verwijderd");
  };

  const addStop = async (v: {
    name: string;
    tag: string;
    text: string;
    mapX?: number;
    mapY?: number;
  }) => {
    if (!selected) return;
    const updated = await run(() =>
      api<Route>(`/routes/${selected.id}/stops`, {
        method: "POST",
        body: JSON.stringify(v),
      }),
    );
    if (!updated) return;
    replace(updated);
    setModal(null);
    setPendingMapPoint(null);
    notify("Locatie toegevoegd");
  };

  const openStopAtMapPoint = (point: MapPoint) => {
    setPendingMapPoint(point);
    setModal("addStop");
  };

  const removeStop = async (i: number) => {
    if (!selected) return;
    const wasPublished = selected.status === "gepubliceerd";
    const updated = await run(() =>
      api<Route>(`/routes/${selected.id}/stops/${selected.stops[i].id}`, {
        method: "DELETE",
      }),
    );
    if (!updated) return;
    replace(updated);
    notify(
      wasPublished && updated.status === "concept"
        ? "Locatie verwijderd — route is teruggezet als concept"
        : "Locatie verwijderd",
    );
  };

  const moveStop = async (i: number, dir: -1 | 1) => {
    if (!selected) return;
    const arr = [...selected.stops];
    const j = i + dir;
    if (j < 0 || j >= arr.length) return;
    [arr[i], arr[j]] = [arr[j], arr[i]];

    const previous = selected;
    replace({ ...selected, stops: arr });
    setActiveStop(j);

    const updated = await run(() =>
      api<Route>(`/routes/${previous.id}/stops/order`, {
        method: "PUT",
        body: JSON.stringify({ order: arr.map((st) => st.id) }),
      }),
    );
    if (updated) {
      replace(updated);
    } else {
      replace(previous);
      setActiveStop(i);
    }
  };

  const n = selected?.stops.length ?? 0;
  const distanceIsEstimate = selected ? hasMapDistance(selected) : false;
  const displayedMinutes = selected
    ? distanceIsEstimate
      ? estimatedWalkingMinutes(selected)
      : selected.minutes
    : 0;
  const leg = selected
    ? Math.max(1, Math.round(displayedMinutes / Math.max(n, 1)))
    : 0;
  const completion =
    selected && selected.started > 0
      ? Math.round((selected.completed / selected.started) * 100)
      : 0;

  return (
    <>
      <div className="flex flex-wrap items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-semibold leading-tight tracking-tight">
            Routes
          </h1>
          <p className="mt-1.5 text-sm text-[#6B6E85]">
            Beheer alle wandelroutes in Zwolle.
          </p>
        </div>
        <PrimaryButton icon="plus" onClick={() => setModal("newRoute")}>
          Nieuwe route
        </PrimaryButton>
      </div>

      <div className="mt-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="relative w-full sm:max-w-sm sm:flex-1">
          <Icon
            name="search"
            className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-ink-muted"
          />
          <input
            type="search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Zoek een route…"
            aria-label="Zoek een route"
            className={`${inputCls} h-12 rounded-2xl bg-white pl-11 pr-4 text-sm`}
          />
        </div>

        <div
          className="flex flex-wrap gap-2"
          role="group"
          aria-label="Filter op status"
        >
          {filters.map((f) => {
            const active = filter === f.key;
            return (
              <button
                key={f.key}
                type="button"
                aria-pressed={active}
                onClick={() => setFilter(f.key)}
                className={`inline-flex items-center gap-2 rounded-full border px-4 py-2 text-sm font-medium transition focus:outline-none focus-visible:ring-2 focus-visible:ring-[#E8711A]/40 ${
                  active
                    ? "border-[#1E2140] bg-[#1E2140] text-white"
                    : "border-[#E4E4EA] bg-white text-[#1E2140] hover:border-[#E8711A] hover:text-[#E8711A]"
                }`}
              >
                {f.label}
                <span
                  className={`rounded-full px-1.5 text-xs tabular-nums ${
                    active ? "bg-white/20" : "bg-[#F1F1F5] text-[#6B6E85]"
                  }`}
                >
                  {countOf(f.key)}
                </span>
              </button>
            );
          })}
        </div>
      </div>

      {visible.length > 0 ? (
        <div className="mt-4 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          {visible.map((r) => (
            <RouteTile
              key={r.id}
              route={r}
              selected={selected?.id === r.id}
              onSelect={() => {
                setSelectedId(r.id);
                setActiveStop(null);
              }}
            />
          ))}
        </div>
      ) : (
        <Card className="mt-5 text-center">
          <p className="font-display text-lg font-semibold">Geen routes gevonden</p>
          <p className="mt-1 text-sm text-[#6B6E85]">
            Pas je zoekopdracht of filter aan.
          </p>
          <GhostButton
            className="mt-4"
            onClick={() => {
              setQuery("");
              setFilter("alle");
            }}
          >
            Filters wissen
          </GhostButton>
        </Card>
      )}

      {selected && statusAction && (
        <>
          <Card className="mt-6">
            <div className="mb-5 flex flex-wrap items-start justify-between gap-4">
              <div>
                <div className="flex flex-wrap items-center gap-3">
                  <CardTitle>{selected.name}</CardTitle>
                  <StatusBadge status={selected.status} />
                </div>
                {selected.description && (
                  <p className="mt-2 max-w-2xl text-sm text-ink-muted">
                    {selected.description}
                  </p>
                )}
                <div className="mt-3 flex flex-wrap gap-2">
                  <MetaChip icon="route">
                    {distanceIsEstimate ? "~ " : ""}
                    {fmtKm(selected.km)} km
                    {distanceIsEstimate ? " geschat" : ""}
                  </MetaChip>
                  <MetaChip icon="clock">
                    {distanceIsEstimate
                      ? `~ ${displayedMinutes} min lopen (3 km/u)`
                      : `± ${displayedMinutes} min`}
                  </MetaChip>
                  <MetaChip icon="pin">
                    {n} {n === 1 ? "stop" : "stops"}
                  </MetaChip>
                </div>
              </div>
              <div className="flex flex-wrap gap-2">
                <GhostButton icon="edit" onClick={() => setModal("editRoute")}>
                  Route bewerken
                </GhostButton>
                {statusAction.primary ? (
                  <GhostButton
                    style={{
                      borderColor: "#E8711A",
                      backgroundColor: "#E8711A",
                      color: "#FFFFFF",
                    }}
                    className="hover:border-[#d3640f] hover:bg-[#d3640f] hover:text-white"
                    onClick={() => setStatus(selected, statusAction.next)}
                  >
                    {statusAction.label}
                  </GhostButton>
                ) : (
                  <GhostButton
                    onClick={() => setStatus(selected, statusAction.next)}
                  >
                    {statusAction.label}
                  </GhostButton>
                )}
                <GhostButton
                  icon="trash"
                  className="text-(--error) hover:border-(--error) hover:text-(--error)"
                  onClick={() => setModal("deleteRoute")}
                >
                  Verwijderen
                </GhostButton>
              </div>
            </div>
            {distanceIsEstimate && (
              <p className="mb-4 text-xs text-ink-muted">
                Afstand geschat op basis van de kaart; looptijd berekend met
                3 km/u. De werkelijke route en looptijd kunnen afwijken.
              </p>
            )}

            <RouteMap
              key={selected.id}
              route={selected}
              activeIndex={activeStop}
              onMapClick={openStopAtMapPoint}
            />
          </Card>

          <section className="mt-8">
            <div className="mb-4 flex flex-wrap items-end justify-between gap-3">
              <div>
                <h2 className="font-display text-xl font-semibold tracking-tight">
                  Stops langs de route
                </h2>
                <p className="mt-0.5 text-sm text-[#6B6E85]">
                  {n} {n === 1 ? "locatie" : "locaties"} · verschuif of
                  verwijder stops met de knoppen
                </p>
              </div>
              <GhostButton
                icon="plus"
                onClick={() => {
                  setPendingMapPoint(null);
                  setModal("addStop");
                }}
              >
                Locatie toevoegen
              </GhostButton>
            </div>

            {n > 0 ? (
              <ol className="grid gap-4 sm:grid-cols-2 lg:grid-cols-5">
                {selected.stops.map((s, i) => (
                  <StopCard
                    key={s.id}
                    stop={s}
                    index={i}
                    total={n}
                    leg={leg}
                    loop={SHAPES[selected.shape].loop}
                    onHover={setActiveStop}
                    onMove={(dir) => moveStop(i, dir)}
                    onRemove={() => removeStop(i)}
                  />
                ))}
              </ol>
            ) : (
              <Card className="text-center">
                <p className="text-sm text-[#6B6E85]">
                  Deze route heeft nog geen locaties. Voeg de eerste stop toe.
                </p>
              </Card>
            )}
          </section>

          <section className="mt-8">
            <Card>
              <CardTitle>Prestaties in september</CardTitle>
              <div className="mt-6 grid gap-8 lg:grid-cols-3">
                <div className="lg:col-span-2">
                  <p className="mb-3 text-sm text-[#6B6E85]">
                    Gestarte wandelingen per week
                  </p>
                  {selected.started > 0 ? (
                    <WeekBars values={selected.weekly} />
                  ) : (
                    <div className="flex h-40 items-center justify-center rounded-xl bg-[#F9F9FB] px-6 text-center text-sm text-[#6B6E85]">
                      Nog geen wandelingen. Publiceer de route om wandelaars te
                      laten starten.
                    </div>
                  )}
                </div>

                <dl className="space-y-5">
                  <div>
                    <dt className="text-xs font-medium text-[#6B6E85]">
                      Gestarte wandelingen
                    </dt>
                    <dd className="mt-1 text-3xl font-semibold tabular-nums">
                      {nf.format(selected.started)}
                    </dd>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-[#6B6E85]">
                      Voltooid
                    </dt>
                    <dd className="mt-1 flex items-baseline gap-2">
                      <span className="text-3xl font-semibold tabular-nums">
                        {nf.format(selected.completed)}
                      </span>
                      <span className="text-sm text-[#6B6E85]">
                        ({completion}%)
                      </span>
                    </dd>
                    <div className="mt-2 h-1.5 overflow-hidden rounded-full bg-[#F1F1F5]">
                      <div
                        className="h-full rounded-full bg-[#E8711A] transition-[width] duration-500"
                        style={{ width: `${completion}%` }}
                      />
                    </div>
                  </div>
                  <div>
                    <dt className="text-xs font-medium text-[#6B6E85]">
                      Waardering
                    </dt>
                    <dd className="mt-1 flex items-center gap-1.5 text-3xl font-semibold text-[#E8711A]">
                      <Icon name="star" className="h-6 w-6" />
                      {fmtRating(selected.rating)}
                    </dd>
                  </div>
                </dl>
              </div>
            </Card>
          </section>
        </>
      )}

      {modal === "newRoute" && (
        <Modal title="Nieuwe route" onClose={() => setModal(null)}>
          <RouteForm
            mode="create"
            initial={{
              name: "",
              description: "",
              km: "0,1",
              minutes: "1",
              status: "concept",
              shape: routes.length % SHAPES.length,
            }}
            submitLabel="Route aanmaken"
            onSubmit={createRoute}
          />
        </Modal>
      )}
      {modal === "editRoute" && selected && (
        <Modal title="Route bewerken" onClose={() => setModal(null)}>
          <RouteForm
            mode="edit"
            initial={{
              name: selected.name,
              description: selected.description,
              km: fmtKm(selected.km),
              minutes: String(selected.minutes),
              status: selected.status,
              shape: selected.shape,
            }}
            submitLabel="Opslaan"
            onSubmit={editRoute}
          />
        </Modal>
      )}
      {modal === "addStop" && selected && (
        <Modal
          title="Locatie toevoegen"
          onClose={() => {
            setModal(null);
            setPendingMapPoint(null);
          }}
        >
          <StopForm onSubmit={addStop} mapPoint={pendingMapPoint} />
        </Modal>
      )}
      {modal === "deleteRoute" && selected && (
        <Modal title="Route verwijderen" onClose={() => setModal(null)}>
          <div className="space-y-5">
            <div className="flex items-start gap-3">
              <span className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-[color-mix(in_oklab,var(--error)_12%,transparent)] text-(--error)">
                <Icon name="trash" />
              </span>
              <div>
                <h3 className="text-lg font-semibold text-ink">
                  Weet je het zeker?
                </h3>
                <p className="mt-1 text-sm text-ink-muted">
                  <span className="font-semibold text-ink">{selected.name}</span>{" "}
                  en alle bijbehorende stops worden permanent verwijderd.
                </p>
              </div>
            </div>
            <div className="flex justify-end gap-2">
              <GhostButton onClick={() => setModal(null)}>
                Annuleren
              </GhostButton>
              <button
                type="button"
                onClick={deleteRoute}
                className="inline-flex items-center gap-2 rounded-full bg-(--error) px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 focus:outline-none focus-visible:ring-2 focus-visible:ring-(--error) focus-visible:ring-offset-2"
              >
                <Icon name="trash" className="h-4 w-4" />
                Route verwijderen
              </button>
            </div>
          </div>
        </Modal>
      )}

      <Toast message={toast} />
    </>
  );
}
