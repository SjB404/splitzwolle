import { Router } from "express";
import type { Request, Response } from "express";
import type { PoolConnection } from "mysql2/promise";
import { pool } from "../../db.ts";
import { requireRole } from "../../middleware/userAuthenticator.ts";
const router = Router();

router.post("/", async (req: Request, res: Response) => {
  const { name, email, subject, message } = req.body;

  if (!name || !email || !subject || !message) {
    return res.status(400).json({ error: "missing fields" });
  }

  let connection: PoolConnection | undefined;
  try {
    connection = await pool.getConnection();

    await connection.execute(
      "INSERT INTO contact (name, email, subject, message) VALUES (?, ?, ?, ?)",
      [name, email, subject, message],
    );
    res.status(200).send("Message sent successfully");
  } catch (error) {
    console.error("POST /contact failed:", error);
    res.status(500).json({ error: "Error sending message" });
  } finally {
    connection?.release();
  }
});

router.delete("/:id", requireRole("admin"), async (req: Request, res: Response) => {
  const { id } = req.params;

  let connection: PoolConnection | undefined;
  try {
    connection = await pool.getConnection();
    await connection.execute("DELETE FROM contact WHERE id = ?", [id]);
    res.status(200).send("Message deleted successfully");
  } catch (error) {
    console.error("DELETE /contact failed:", error);
    res.status(500).json({ error: "Error deleting message" });
  } finally {
    connection?.release();
  }
});

export default router;
