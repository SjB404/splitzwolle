import { Router } from "express";
import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";
import { pool } from "../../db.ts";
import { requireAuth } from "../../middleware/userAuthenticator.ts";

const router = Router();

router.get("/reviews/view", async (req: Request, res: Response) => {
  const { routeID } = req.query;
  if (!routeID) {
    return res.status(400).json({ error: "routeID is required" });
  }

  let connection: PoolConnection | undefined;

  try {
    connection = await pool.getConnection();
    const [rows] = await connection.query("SELECT * FROM reviews WHERE routeID = ?", [routeID]);
    return res.json(rows);
  } catch (err) {
    console.error("GET /reviews/view failed:", err);
    return res.status(500).json({ error: "Could not fetch reviews" });
  } finally {
    connection?.release();
  }
});

router.post("/reviews", requireAuth, async (req: Request, res: Response) => {
  const { routeID, rating, comment } = req.body;
  if (routeID === undefined || rating === undefined || !comment) {
    return res.status(400).json({ error: "routeID, rating and comment are required" });
  }

  let connection: PoolConnection | undefined;

  try {
    connection = await pool.getConnection();
    await connection.query("INSERT INTO reviews SET ?", { routeID, rating, comment });
    return res.json({ message: "Review added" });
  } catch (err) {
    console.error("POST /reviews failed:", err);
    return res.status(500).json({ error: "Could not add review" });
  } finally {
    connection?.release();
  }
});

export default router;
