import { Router } from "express";
import type { Request, Response } from "express";
import { randomUUID } from "crypto";
import mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { requireRole } from "../../middleware/userAuthenticator.ts";
import contactRequestsRouter from "./contactRequests.ts";

const router = Router();

const pool = mysql.createPool({
  host: "localhost",
  user: "root",
  password: "",
  database: "swolla",
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
});

// Every endpoint in this file is admin-only.
router.use(requireRole("admin"));
router.use("/contact-requests", contactRequestsRouter);

type Status = "gepubliceerd" | "concept" | "gearchiveerd";
const STATUSES: Status[] = ["gepubliceerd", "concept", "gearchiveerd"];
const SHAPE_COUNT = 7; // keep in sync with SHAPES in Dashboard.tsx
type RouteUpdates = {
  name?: string;
  description?: string;
  km?: number;
  minutes?: number;
  status?: Status;
  shape?: number;
};
type RouteIdParams = { id: string };
type StopParams = { id: string; stopId: string };

/* ------------------------------------------------------------------ */
/* Helpers                                                             */
/* ------------------------------------------------------------------ */

// Builds the exact `Route` shape the dashboard expects.
async function loadRoutes(onlyId?: string) {
  const where = onlyId ? "WHERE r.id = ?" : "";
  const params = onlyId ? [onlyId] : [];

  const [routes] = await pool.query<RowDataPacket[]>(
    `SELECT r.id, r.name, r.description, r.km, r.minutes, r.status, r.shape,
            (SELECT ROUND(AVG(rating), 1) FROM reviews WHERE routeID = r.id) AS rating
       FROM routes r ${where}
      ORDER BY r.created_at`,
    params,
  );

  const [stops] = await pool.query<RowDataPacket[]>(
    `SELECT id, route_id, name, tag, text, map_x, map_y FROM route_stops
      ${onlyId ? "WHERE route_id = ?" : ""} ORDER BY route_id, position`,
    params,
  );

  // Walks in the current month, split into 4 weekly buckets.
  const [walks] = await pool.query<RowDataPacket[]>(
    `SELECT route_id,
            SUM(DAY(started_at) BETWEEN 1 AND 7)   AS w1,
            SUM(DAY(started_at) BETWEEN 8 AND 14)  AS w2,
            SUM(DAY(started_at) BETWEEN 15 AND 21) AS w3,
            SUM(DAY(started_at) >= 22)             AS w4,
            SUM(completed_at IS NOT NULL)          AS completed
       FROM route_walks
      WHERE started_at >= DATE_FORMAT(NOW(), '%Y-%m-01')
        AND started_at <  DATE_FORMAT(NOW(), '%Y-%m-01') + INTERVAL 1 MONTH
        ${onlyId ? "AND route_id = ?" : ""}
      GROUP BY route_id`,
    params,
  );

  return routes.map((r) => {
    const w = walks.find((x) => x.route_id === r.id);
    const weekly = w ? [w.w1, w.w2, w.w3, w.w4].map(Number) : [0, 0, 0, 0];
    return {
      id: r.id,
      name: r.name,
      description: r.description ?? "",
      km: Number(r.km),
      minutes: Number(r.minutes),
      status: r.status as Status,
      shape: Number(r.shape),
      started: weekly.reduce((a, b) => a + b, 0),
      completed: w ? Number(w.completed) : 0,
      rating: r.rating === null ? null : Number(r.rating),
      weekly,
      stops: stops
        .filter((s) => s.route_id === r.id)
        .map((s) => ({
          id: String(s.id),
          name: s.name,
          tag: s.tag,
          text: s.text,
          mapX: s.map_x === null ? null : Number(s.map_x),
          mapY: s.map_y === null ? null : Number(s.map_y),
        })),
    };
  });
}

async function stopCount(routeId: string): Promise<number> {
  const [[row]] = await pool.query<RowDataPacket[]>(
    "SELECT COUNT(*) AS n FROM route_stops WHERE route_id = ?",
    [routeId],
  );
  return Number(row.n);
}

async function updateEstimatedDistance(routeId: string): Promise<void> {
  const [stops] = await pool.query<RowDataPacket[]>(
    "SELECT map_x, map_y FROM route_stops WHERE route_id = ? ORDER BY position",
    [routeId],
  );
  if (
    stops.length === 0 ||
    stops.some((stop) => stop.map_x === null || stop.map_y === null)
  ) {
    return;
  }

  const pixelsPerPercent = { x: 1520 / 100, y: 984 / 100 };
  const metersPerPixel = 2;
  const walkingDetourFactor = 1.944;
  let meters = 0;
  for (let i = 1; i < stops.length; i++) {
    const dx =
      (Number(stops[i].map_x) - Number(stops[i - 1].map_x)) *
      pixelsPerPercent.x;
    const dy =
      (Number(stops[i].map_y) - Number(stops[i - 1].map_y)) *
      pixelsPerPercent.y;
    meters += Math.hypot(dx, dy) * metersPerPixel * walkingDetourFactor;
  }

  const km = Math.max(0.1, Math.round((meters / 1000) * 10) / 10);
  const minutes = Math.max(1, Math.round((km / 3) * 60));
  await pool.query("UPDATE routes SET km = ?, minutes = ? WHERE id = ?", [
    km,
    minutes,
    routeId,
  ]);
}

function parseRouteBody(
  body: unknown,
  partial: boolean,
): { data: RouteUpdates } | { error: string } {
  if (!body || typeof body !== "object" || Array.isArray(body)) {
    return { error: "request body must be an object" };
  }

  const input = body as Record<string, unknown>;
  const out: RouteUpdates = {};
  if (input.name !== undefined || !partial) {
    if (typeof input.name !== "string" || !input.name.trim())
      return { error: "name is required" };
    out.name = input.name.trim().slice(0, 160);
  }
  if (input.description !== undefined || !partial) {
    if (typeof input.description !== "string")
      return { error: "description must be a string" };
    out.description = input.description.trim().slice(0, 2000);
  }
  if (input.km !== undefined || !partial) {
    const km = Number(input.km);
    if (!Number.isFinite(km) || !(km > 0 && km < 1000))
      return { error: "km must be a positive number" };
    out.km = km;
  }
  if (input.minutes !== undefined || !partial) {
    const minutes = Number(input.minutes);
    if (!Number.isInteger(minutes) || minutes <= 0)
      return { error: "minutes must be a positive integer" };
    out.minutes = minutes;
  }
  if (input.status !== undefined) {
    const status = STATUSES.find((candidate) => candidate === input.status);
    if (!status) return { error: "invalid status" };
    out.status = status;
  }
  if (input.shape !== undefined) {
    const shape = Number(input.shape);
    if (!Number.isInteger(shape) || shape < 0 || shape >= SHAPE_COUNT)
      return { error: "invalid shape" };
    out.shape = shape;
  }
  return { data: out };
}

const MONTHS_NL = [
  "januari",
  "februari",
  "maart",
  "april",
  "mei",
  "juni",
  "juli",
  "augustus",
  "september",
  "oktober",
  "november",
  "december",
];
const nf = new Intl.NumberFormat("nl-NL");

/* ------------------------------------------------------------------ */
/* Routes                                                              */
/* ------------------------------------------------------------------ */

router.get("/routes", async (_req: Request, res: Response) => {
  try {
    res.json(await loadRoutes());
  } catch (err) {
    console.error("GET /admin/routes failed:", err);
    res.status(500).json({ error: "Failed to load routes" });
  }
});

router.post("/routes", async (req: Request, res: Response) => {
  const parsed = parseRouteBody(req.body, true);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  const d = parsed.data;
  if (!d.name || !d.description)
    return res
      .status(400)
      .json({ error: "name and description are required" });
  try {
    const id = randomUUID();
    await pool.query(
      "INSERT INTO routes (id, name, description, km, minutes, status, shape) VALUES (?, ?, ?, ?, ?, ?, ?)",
      [
        id,
        d.name,
        d.description,
        d.km ?? 0.1,
        d.minutes ?? 1,
        "concept",
        d.shape ?? 0,
      ],
    );
    const [route] = await loadRoutes(id);
    res.status(201).json(route);
  } catch (err) {
    console.error("POST /admin/routes failed:", err);
    res.status(500).json({ error: "Failed to create route" });
  }
});

router.put("/routes/:id", async (req: Request<RouteIdParams>, res: Response) => {
  const parsed = parseRouteBody(req.body, true);
  if ("error" in parsed) return res.status(400).json({ error: parsed.error });

  const d = parsed.data;
  const keys = Object.keys(d) as (keyof RouteUpdates)[];
  if (keys.length === 0)
    return res.status(400).json({ error: "nothing to update" });

  try {
    if (d.status === "gepubliceerd" && (await stopCount(req.params.id)) < 2) {
      return res
        .status(400)
        .json({ error: "A route needs at least 2 stops before publishing" });
    }
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE routes SET ${keys.map((k) => `${k} = ?`).join(", ")} WHERE id = ?`,
      [...keys.map((k) => d[k]), req.params.id],
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Route not found" });
    const [route] = await loadRoutes(req.params.id);
    res.json(route);
  } catch (err) {
    console.error("PUT /admin/routes/:id failed:", err);
    res.status(500).json({ error: "Failed to update route" });
  }
});

router.delete("/routes/:id", async (req: Request<RouteIdParams>, res: Response) => {
  try {
    // route_stops cascades; walks are kept for statistics.
    const [result] = await pool.query<ResultSetHeader>("DELETE FROM routes WHERE id = ?", [
      req.params.id,
    ]);
    if (result.affectedRows === 0)
      return res.status(404).json({ error: "Route not found" });
    res.json({ ok: true });
  } catch (err) {
    console.error("DELETE /admin/routes/:id failed:", err);
    res.status(500).json({ error: "Failed to delete route" });
  }
});

/* ------------------------------------------------------------------ */
/* Stops (every endpoint returns the updated route)                    */
/* ------------------------------------------------------------------ */

router.post("/routes/:id/stops", async (req: Request<RouteIdParams>, res: Response) => {
  if (!req.body || typeof req.body !== "object" || Array.isArray(req.body)) {
    return res.status(400).json({ error: "request body must be an object" });
  }
  const { name, tag, text, mapX, mapY } = req.body as Record<string, unknown>;
  if (typeof name !== "string" || !name.trim())
    return res.status(400).json({ error: "name is required" });
  if (
    (mapX === undefined) !== (mapY === undefined) ||
    (mapX !== undefined &&
      (typeof mapX !== "number" ||
        !Number.isFinite(mapX) ||
        mapX < 0 ||
        mapX > 100 ||
        typeof mapY !== "number" ||
        !Number.isFinite(mapY) ||
        mapY < 0 ||
        mapY > 100))
  ) {
    return res
      .status(400)
      .json({ error: "mapX and mapY must both be between 0 and 100" });
  }

  try {
    const [[exists]] = await pool.query<RowDataPacket[]>(
      "SELECT id FROM routes WHERE id = ?",
      [req.params.id],
    );
    if (!exists) return res.status(404).json({ error: "Route not found" });

    const [[pos]] = await pool.query<RowDataPacket[]>(
      "SELECT COALESCE(MAX(position), -1) + 1 AS next FROM route_stops WHERE route_id = ?",
      [req.params.id],
    );
    await pool.query(
      "INSERT INTO route_stops (id, route_id, position, name, tag, text, map_x, map_y) VALUES (?, ?, ?, ?, ?, ?, ?, ?)",
      [
        randomUUID(),
        req.params.id,
        pos.next,
        name.trim().slice(0, 160),
        String(tag ?? "Overig").slice(0, 40),
        String(text ?? ""),
        mapX ?? null,
        mapY ?? null,
      ],
    );
    if (mapX !== undefined) await updateEstimatedDistance(req.params.id);
    const [route] = await loadRoutes(req.params.id);
    res.status(201).json(route);
  } catch (err) {
    console.error("POST /admin/routes/:id/stops failed:", err);
    res.status(500).json({ error: "Failed to add stop" });
  }
});

// Must be declared before "/stops/:stopId" so "order" isn't read as an id.
router.put(
  "/routes/:id/stops/order",
  async (req: Request<RouteIdParams>, res: Response) => {
    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : null;
    const order: unknown = body?.order;
    if (!Array.isArray(order) || !order.every((x) => typeof x === "string")) {
      return res
        .status(400)
        .json({ error: "order must be an array of stop ids" });
    }

    let conn: Awaited<ReturnType<typeof pool.getConnection>> | undefined;
    let transactionStarted = false;
    try {
      conn = await pool.getConnection();
      await conn.beginTransaction();
      transactionStarted = true;
      const [[route]] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM routes WHERE id = ? FOR UPDATE",
        [req.params.id],
      );
      if (!route) {
        await conn.rollback();
        transactionStarted = false;
        return res.status(404).json({ error: "Route not found" });
      }

      const [existing] = await conn.query<RowDataPacket[]>(
        "SELECT id FROM route_stops WHERE route_id = ? FOR UPDATE",
        [req.params.id],
      );
      const ids = new Set(existing.map((s) => String(s.id)));
      if (order.length !== ids.size || !order.every((id) => ids.has(id))) {
        await conn.rollback();
        transactionStarted = false;
        return res.status(400).json({
          error: "order must contain every stop of this route exactly once",
        });
      }
      for (let i = 0; i < order.length; i++) {
        await conn.query(
          "UPDATE route_stops SET position = ? WHERE id = ? AND route_id = ?",
          [i, order[i], req.params.id],
        );
      }
      await conn.commit();
      transactionStarted = false;
      await updateEstimatedDistance(req.params.id);
    } catch (err) {
      if (conn && transactionStarted) await conn.rollback();
      console.error("PUT /admin/routes/:id/stops/order failed:", err);
      return res.status(500).json({ error: "Failed to reorder stops" });
    } finally {
      conn?.release();
    }

    const [route] = await loadRoutes(req.params.id);
    res.json(route);
  },
);

router.delete(
  "/routes/:id/stops/:stopId",
  async (req: Request<StopParams>, res: Response) => {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM route_stops WHERE id = ? AND route_id = ?",
        [req.params.stopId, req.params.id],
      );
      if (result.affectedRows === 0)
        return res.status(404).json({ error: "Stop not found" });

      // A published route may never drop below 2 stops.
      if ((await stopCount(String(req.params.id))) < 2) {
        await pool.query(
          "UPDATE routes SET status = 'concept' WHERE id = ? AND status = 'gepubliceerd'",
          [req.params.id],
        );
      }
      await updateEstimatedDistance(String(req.params.id));
      const [route] = await loadRoutes(req.params.id);
      res.json(route);
    } catch (err) {
      console.error("DELETE /admin/routes/:id/stops/:stopId failed:", err);
      res.status(500).json({ error: "Failed to remove stop" });
    }
  },
);

/* ------------------------------------------------------------------ */
/* Overview                                                            */
/* ------------------------------------------------------------------ */

async function monthStats(year: number, month0: number) {
  const start = new Date(year, month0, 1);
  const end = new Date(year, month0 + 1, 1);

  const [[w]] = await pool.query<RowDataPacket[]>(
    `SELECT COUNT(*) AS started, COALESCE(SUM(completed_at IS NOT NULL), 0) AS done,
            COALESCE(SUM(DAY(started_at) BETWEEN 1 AND 7), 0)   AS w1,
            COALESCE(SUM(DAY(started_at) BETWEEN 8 AND 14), 0)  AS w2,
            COALESCE(SUM(DAY(started_at) BETWEEN 15 AND 21), 0) AS w3,
            COALESCE(SUM(DAY(started_at) >= 22), 0)             AS w4,
            COALESCE(SUM(DAY(started_at) BETWEEN 1 AND 7 AND completed_at IS NOT NULL), 0)   AS d1,
            COALESCE(SUM(DAY(started_at) BETWEEN 8 AND 14 AND completed_at IS NOT NULL), 0)  AS d2,
            COALESCE(SUM(DAY(started_at) BETWEEN 15 AND 21 AND completed_at IS NOT NULL), 0) AS d3,
            COALESCE(SUM(DAY(started_at) >= 22 AND completed_at IS NOT NULL), 0)             AS d4
       FROM route_walks WHERE started_at >= ? AND started_at < ?`,
    [start, end],
  );
  const [[u]] = await pool.query<RowDataPacket[]>(
    `SELECT SUM(created_at < ?) AS total, SUM(created_at >= ? AND created_at < ?) AS added FROM users`,
    [end, start, end],
  );
  return {
    start,
    end,
    w,
    users: Number(u.total ?? 0),
    added: Number(u.added ?? 0),
  };
}

router.get("/overview", async (_req: Request, res: Response) => {
  try {
    const now = new Date();
    const result = [];

    // oldest first: two months ago, last month, this month
    for (let back = 2; back >= 0; back--) {
      const d = new Date(now.getFullYear(), now.getMonth() - back, 1);
      const prevD = new Date(d.getFullYear(), d.getMonth() - 1, 1);
      const cur = await monthStats(d.getFullYear(), d.getMonth());
      const prev = await monthStats(prevD.getFullYear(), prevD.getMonth());

      const started = Number(cur.w.started);
      const done = Number(cur.w.done);
      const prevStarted = Number(prev.w.started);
      const growth =
        prevStarted > 0
          ? Math.round(((started - prevStarted) / prevStarted) * 100)
          : 0;

      const m = MONTHS_NL[d.getMonth()];
      const abbr = m.slice(0, 3);
      const lastDay = new Date(d.getFullYear(), d.getMonth() + 1, 0).getDate();
      const labels = [
        `1–7 ${abbr}`,
        `8–14 ${abbr}`,
        `15–21 ${abbr}`,
        `22–${lastDay} ${abbr}`,
      ];
      const next = new Date(d.getFullYear(), d.getMonth() + 1, 1);

      result.push({
        key: m,
        label: `${m[0].toUpperCase()}${m.slice(1)} ${d.getFullYear()}`,
        name: m,
        prev: MONTHS_NL[prevD.getMonth()],
        users: nf.format(cur.users),
        usersTrend: `+${cur.added}`,
        started: nf.format(started),
        startedTrend: `${growth >= 0 ? "+" : ""}${growth}%`,
        done: nf.format(done),
        donePct: `${started > 0 ? Math.round((done / started) * 100) : 0}%`,
        updated: `1 ${MONTHS_NL[next.getMonth()]} ${next.getFullYear()}, 08:00`,
        weeks: labels.map((label, i) => ({
          label,
          started: Number(cur.w[`w${i + 1}`]),
          done: Number(cur.w[`d${i + 1}`]),
        })),
      });
    }

    const [[rating]] = await pool.query<RowDataPacket[]>(
      "SELECT ROUND(AVG(rating), 1) AS avg, COUNT(*) AS count FROM reviews",
    );

    res.json({
      months: result,
      rating: {
        avg: rating.avg === null ? null : Number(rating.avg),
        count: Number(rating.count),
      },
    });
  } catch (err) {
    console.error("GET /admin/overview failed:", err);
    res.status(500).json({ error: "Failed to load overview" });
  }
});

export default router;
