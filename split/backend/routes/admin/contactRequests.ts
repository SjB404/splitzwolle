import { Router } from "express";
import type { Request, Response } from "express";
import mysql from "mysql2/promise";
import type { ResultSetHeader, RowDataPacket } from "mysql2/promise";
import { requireRole } from "../../middleware/userAuthenticator.ts";

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

const STATUSES = ["nieuw", "in_behandeling"] as const;
type ContactStatus = (typeof STATUSES)[number] | "afgerond";
type ContactRequestParams = { id: string };

interface ContactRequestRow extends RowDataPacket {
  id: number;
  name: string;
  email: string;
  subject: string;
  message: string;
  status: ContactStatus;
}

router.use(requireRole("admin"));

router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<ContactRequestRow[]>(
      "SELECT id, name, email, subject, message, status FROM contact ORDER BY id DESC",
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /admin/contact-requests failed:", err);
    return res.status(500).json({ error: "Could not fetch contact requests" });
  }
});

router.delete(
  "/:id",
  async (req: Request<ContactRequestParams>, res: Response) => {
    try {
      const [result] = await pool.query<ResultSetHeader>(
        "DELETE FROM contact WHERE id = ?",
        [req.params.id],
      );
      if (result.affectedRows === 0) {
        return res.status(404).json({ error: "Contact request not found" });
      }
      return res.json({ ok: true });
    } catch (err) {
      console.error(
        `DELETE /admin/contact-requests/${req.params.id} failed:`,
        err,
      );
      return res.status(500).json({ error: "Could not delete contact request" });
    }
  },
);

router.patch(
  "/:id",
  async (req: Request<ContactRequestParams>, res: Response) => {
    const body =
      req.body && typeof req.body === "object" && !Array.isArray(req.body)
        ? (req.body as Record<string, unknown>)
        : null;
    const status = STATUSES.find((candidate) => candidate === body?.status);
    if (!status) {
      return res.status(400).json({ error: "Invalid contact request status" });
    }

    try {
      await pool.query<ResultSetHeader>(
        "UPDATE contact SET status = ? WHERE id = ?",
        [status, req.params.id],
      );
      const [rows] = await pool.query<ContactRequestRow[]>(
        "SELECT id, name, email, subject, message, status FROM contact WHERE id = ?",
        [req.params.id],
      );
      if (!rows[0]) {
        return res.status(404).json({ error: "Contact request not found" });
      }
      return res.json(rows[0]);
    } catch (err) {
      console.error(
        `PATCH /admin/contact-requests/${req.params.id} failed:`,
        err,
      );
      return res.status(500).json({ error: "Could not update contact request" });
    }
  },
);

export default router;
