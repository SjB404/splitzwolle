import { useEffect, useState } from "react";
import { Navigate } from "react-router-dom";
import { API_BASE } from "../../data/loginData.ts";
import { HOME_PATH, LOGIN_PATH } from "../../data/navigation.ts";
import Navbar from "../../shared/layout/navbar.tsx";
import { ApiError, api } from "../../../backend/adminApi.ts";
import ContactRequests from "./contactRequests.tsx";
import OverviewTab from "./overviewTab.tsx";
import RoutesTab from "./routesTab.tsx";
import { Card, GhostButton } from "./dashboardComponents.tsx";
import { Icon } from "./dashboardIcons.tsx";
import type { IconName } from "./dashboardIcons.tsx";
import type {
  AdminUser,
  Overview,
  Route,
  SessionResponse,
  StatusFilter,
} from "./dashboardTypes.ts";

const tabs: { key: TabKey; icon: IconName; label: string }[] = [
  { key: "overzicht", icon: "dashboard", label: "Overzicht" },
  { key: "routes", icon: "route", label: "Routes" },
  { key: "contactverzoeken", icon: "group", label: "Contactverzoeken" },
];

type TabKey = "overzicht" | "routes" | "contactverzoeken";

export default function ZwolleRoutesOverzicht() {
  const [user, setUser] = useState<AdminUser | null>(null);
  const [authStatus, setAuthStatus] = useState<
    "loading" | "authenticated" | "anonymous" | "forbidden" | "error"
  >("loading");
  const [authError, setAuthError] = useState("");

  useEffect(() => {
    let cancelled = false;
    api<SessionResponse>("/auth/me", {}, API_BASE)
      .then(({ user: sessionUser }) => {
        if (cancelled) return;
        setUser(sessionUser);
        setAuthStatus(
          sessionUser.role === "admin" ? "authenticated" : "forbidden",
        );
      })
      .catch((error: unknown) => {
        if (cancelled) return;
        if (error instanceof ApiError && error.status === 401) {
          setAuthStatus("anonymous");
          return;
        }
        setAuthError(
          error instanceof Error
            ? error.message
            : "Inloggen controleren is mislukt.",
        );
        setAuthStatus("error");
      });
    return () => {
      cancelled = true;
    };
  }, []);

  if (authStatus === "loading") {
    return (
      <div className="flex min-h-screen items-center justify-center text-sm text-[#6B6E85]">
        Laden…
      </div>
    );
  }
  if (authStatus === "anonymous") return <Navigate to={LOGIN_PATH} replace />;
  if (authStatus === "forbidden") return <Navigate to={HOME_PATH} replace />;
  if (authStatus === "error") {
    return (
      <div className="flex min-h-screen items-center justify-center p-6">
        <Card className="max-w-lg text-center">
          <p role="alert" className="text-sm text-[#6B6E85]">
            Kon de sessie niet controleren: {authError}
          </p>
          <div className="mt-4 flex justify-center">
            <GhostButton onClick={() => window.location.reload()}>
              Opnieuw proberen
            </GhostButton>
          </div>
        </Card>
      </div>
    );
  }
  if (!user) return <Navigate to={LOGIN_PATH} replace />;

  return <AdminApp user={user} />;
}

function AdminApp({ user }: { user: AdminUser }) {
  const label = user.name ?? user.email;
  const initials = label
    .replace(/[^\p{L}]/gu, "")
    .slice(0, 2)
    .toUpperCase();

  const [tab, setTab] = useState<TabKey>("overzicht");
  const [routes, setRoutes] = useState<Route[]>([]);
  const [overview, setOverview] = useState<Overview | null>(null);
  const [loadError, setLoadError] = useState("");
  const [selectedId, setSelectedId] = useState("");
  const [filter, setFilter] = useState<StatusFilter>("alle");
  const [monthIdx, setMonthIdx] = useState(0);

  useEffect(() => {
    let cancelled = false;
    Promise.all([api<Route[]>("/routes"), api<Overview>("/overview")])
      .then(([loadedRoutes, loadedOverview]) => {
        if (cancelled) return;
        setRoutes(loadedRoutes);
        setOverview(loadedOverview);
        setMonthIdx(loadedOverview.months.length - 1);
        setSelectedId(loadedRoutes[0]?.id ?? "");
      })
      .catch((error: unknown) => {
        if (!cancelled) {
          setLoadError(
            error instanceof Error ? error.message : "Laden mislukt.",
          );
        }
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const goToRoutes = (opts: { id?: string; filter?: StatusFilter } = {}) => {
    if (opts.id) setSelectedId(opts.id);
    setFilter(opts.filter ?? "alle");
    setTab("routes");
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <div className="flex min-h-screen flex-col bg-[#F9F9FB] text-[#1E2140] antialiased">
      <Navbar />
      <header className="border-b border-[#E4E4EA] bg-white">
        <nav
          className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-3 px-6 py-2"
          aria-label="Navigatie beheerdersdashboard"
        >
          <div className="flex flex-wrap items-center gap-1">
            {tabs.map(({ key, icon, label: tabLabel }) => {
              const active = tab === key;
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => setTab(key)}
                  aria-current={active ? "page" : undefined}
                  className={`button round ripple min-h-12 gap-2 px-4 ${
                    active
                      ? "fill"
                      : "bg-transparent text-[#6B6E85] hover:bg-[#F1F1F5] hover:text-[#1E2140]"
                  }`}
                >
                  <Icon name={icon} className="h-4 w-4" />
                  {tabLabel}
                  {key === "routes" && (
                    <span className="rounded-full bg-[#F1F1F5] px-1.5 text-xs tabular-nums text-[#6B6E85]">
                      {routes.length}
                    </span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="flex items-center gap-3 py-1">
            <div className="flex h-9 w-9 items-center justify-center rounded-full bg-[#FBE6D4] text-xs font-semibold text-[#E8711A]">
              {initials}
            </div>
            <div className="leading-tight">
              <div className="text-sm font-semibold">{label}</div>
              <div className="text-xs text-[#6B6E85]">Beheerder</div>
            </div>
          </div>
        </nav>
      </header>

      <main className="mx-auto w-full max-w-300 flex-1 px-6 py-8">
        {tab === "contactverzoeken" ? (
          <ContactRequests />
        ) : loadError ? (
          <Card className="text-center">
            <p className="text-sm text-[#6B6E85]">
              Kon de gegevens niet laden: {loadError}
            </p>
            <div className="mt-4 flex justify-center">
              <GhostButton onClick={() => window.location.reload()}>
                Opnieuw proberen
              </GhostButton>
            </div>
          </Card>
        ) : !overview ? (
          <p className="py-20 text-center text-sm text-[#6B6E85]">Laden…</p>
        ) : tab === "overzicht" ? (
          <OverviewTab
            routes={routes}
            months={overview.months}
            rating={overview.rating}
            monthIdx={monthIdx}
            setMonthIdx={setMonthIdx}
            onOpenRoute={(id) => goToRoutes({ id })}
            onAllRoutes={() => goToRoutes()}
            onConcepts={() =>
              goToRoutes({
                id: routes.find((r) => r.status === "concept")?.id,
                filter: "concept",
              })
            }
          />
        ) : (
          <RoutesTab
            routes={routes}
            setRoutes={setRoutes}
            selectedId={selectedId}
            setSelectedId={setSelectedId}
            filter={filter}
            setFilter={setFilter}
          />
        )}
      </main>

      <footer className="border-t border-[#E4E4EA]">
        <div className="mx-auto flex max-w-300 flex-wrap items-center justify-between gap-2 px-6 py-5 text-xs text-[#6B6E85]">
          <span>© 2026 Zwolle Routes</span>
          <span>Beheeromgeving · Alleen toegankelijk voor beheerders</span>
        </div>
      </footer>
    </div>
  );
}
