export type Status = "gepubliceerd" | "concept" | "gearchiveerd";
export type StatusFilter = Status | "alle";

export type MapPoint = { x: number; y: number };
export type Stop = {
  id: string;
  name: string;
  tag: string;
  text: string;
  mapX: number | null;
  mapY: number | null;
};

export type Route = {
  id: string;
  name: string;
  description: string;
  km: number;
  minutes: number;
  status: Status;
  shape: number;
  started: number;
  completed: number;
  rating: number | null;
  weekly: number[];
  stops: Stop[];
};

export const TAGS = [
  "Stadspoort",
  "Toren",
  "Kerk",
  "Museum",
  "Gracht",
  "Water",
  "Park",
  "Plein",
  "Straat",
  "Overig",
];

export const SHAPES: { name: string; path: string; loop: boolean }[] = [
  {
    name: "Kronkelend",
    path: "M 90 220 C 180 120, 260 120, 330 170 S 480 260, 560 190 S 700 90, 790 150 S 880 230, 920 120",
    loop: false,
  },
  {
    name: "Ring",
    path: "M 500 50 C 700 50, 880 110, 880 180 C 880 250, 700 285, 500 285 C 300 285, 120 250, 120 180 C 120 110, 300 50, 500 50 Z",
    loop: true,
  },
  {
    name: "Straten",
    path: "M 80 70 L 300 70 C 360 70, 380 120, 380 160 L 380 230 C 380 270, 420 285, 470 285 L 700 285 C 760 285, 790 250, 790 200 L 790 110 C 790 80, 820 60, 860 60 L 930 60",
    loop: false,
  },
  {
    name: "Boog",
    path: "M 60 250 C 250 60, 450 60, 520 160 S 760 290, 940 90",
    loop: false,
  },
  {
    name: "Golf",
    path: "M 100 200 C 200 60, 340 60, 400 140 C 460 220, 560 240, 620 180 C 680 120, 760 110, 820 170 S 900 270, 940 200",
    loop: false,
  },
  {
    name: "Diagonaal",
    path: "M 140 260 C 260 230, 320 130, 450 120 S 650 170, 760 110 S 870 70, 900 60",
    loop: false,
  },
  {
    name: "Lus",
    path: "M 200 160 C 200 60, 420 40, 520 90 C 640 150, 780 60, 840 130 C 900 200, 780 290, 620 270 C 480 250, 440 300, 320 270 C 220 245, 200 210, 200 160 Z",
    loop: true,
  },
];

export const WATERS = [
  "M -20 270 C 200 310, 400 310, 600 280 S 900 250, 1020 290",
  "M -20 300 C 150 270, 250 300, 400 296 S 760 310, 1020 260",
  "M 30 -20 C 70 80, 30 200, 90 340",
];

export type Month = {
  key: string;
  label: string;
  name: string;
  prev: string;
  users: string;
  usersTrend: string;
  started: string;
  startedTrend: string;
  done: string;
  donePct: string;
  updated: string;
  weeks: { label: string; started: number; done: number }[];
};

export type Overview = {
  months: Month[];
  rating: { avg: number | null; count: number };
};

export type AdminUser = {
  id: string;
  email: string;
  name?: string;
  role: string;
};

export type SessionResponse = { user: AdminUser };

export const weekLabels = (() => {
  const d = new Date();
  const m = d.toLocaleDateString("nl-NL", { month: "long" }).slice(0, 3);
  const last = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
  return [`1–7 ${m}`, `8–14 ${m}`, `15–21 ${m}`, `22–${last} ${m}`];
})();

export const nf = new Intl.NumberFormat("nl-NL");
export const fmtKm = (km: number) => km.toFixed(1).replace(".", ",");
export const fmtRating = (r: number | null) =>
  r === null ? "–" : r.toFixed(1).replace(".", ",");

export const statusMeta: Record<Status, { label: string; cls: string }> = {
  gepubliceerd: {
    label: "Gepubliceerd",
    cls: "bg-emerald-50 text-emerald-700",
  },
  concept: { label: "Concept", cls: "bg-amber-50 text-amber-700" },
  gearchiveerd: { label: "Gearchiveerd", cls: "bg-slate-100 text-slate-600" },
};

export type RouteValues =
  | { mode: "create"; name: string; description: string }
  | {
      mode: "edit";
      name: string;
      description: string;
      km: number;
      minutes: number;
      status: Status;
      shape: number;
    };

export function hasMapDistance(route: Route): boolean {
  return (
    route.stops.length >= 2 &&
    route.stops.every((stop) => stop.mapX !== null && stop.mapY !== null)
  );
}

export function estimatedWalkingMinutes(route: Route): number {
  return Math.round((route.km / 3) * 60);
}
