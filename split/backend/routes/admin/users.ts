import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
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

interface UserRow extends RowDataPacket {
  id: string;
  name: string;
  email: string;
  role: string;
  two_factor_enabled: boolean;
}

const ALLOWED_ROLES = ["user", "admin"];


router.use(requireRole("admin"));

router.get("/", async (_req: Request, res: Response) => {
  try {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, name, email, role, two_factor_enabled FROM users ORDER BY name"
    );
    return res.json(rows);
  } catch (err) {
    console.error("GET /users failed:", err);
    return res.status(500).json({ error: "Could not fetch users" });
  }
});

router.patch("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;
  const { name, email, password, role, resetTwoFactor } = req.body;

  const fields: string[] = [];
  const values: (string | boolean | null)[] = [];

  if (name !== undefined) {
    if (typeof name !== "string" || !name.trim()) {
      return res.status(400).json({ error: "name must be a non-empty string" });
    }
    fields.push("name = ?");
    values.push(name.trim());
  }

  if (email !== undefined) {
    if (typeof email !== "string" || !email.includes("@")) {
      return res.status(400).json({ error: "email is invalid" });
    }
    fields.push("email = ?");
    values.push(email.trim());
  }

  if (password !== undefined) {
    if (typeof password !== "string" || password.length < 8) {
      return res
        .status(400)
        .json({ error: "password must be at least 8 characters" });
    }
    fields.push("password = ?");
    values.push(await bcrypt.hash(password, 10));
  }

  if (role !== undefined) {
    if (!ALLOWED_ROLES.includes(role)) {
      return res
        .status(400)
        .json({ error: `role must be one of: ${ALLOWED_ROLES.join(", ")}` });
    }
    if (id === req.user?.id && role !== req.user.role) {
      return res.status(400).json({ error: "You can't change your own role" });
    }
    fields.push("role = ?");
    values.push(role);
  }

  if (resetTwoFactor === true) {
    fields.push("two_factor_enabled = ?", "two_factor_secret = ?");
    values.push(false, null);
  }

  if (fields.length === 0) {
    return res.status(400).json({ error: "No valid fields to update" });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      `UPDATE users SET ${fields.join(", ")} WHERE id = ?`,
      [...values, id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, name, email, role, two_factor_enabled FROM users WHERE id = ?",
      [id]
    );

    return res.json({ message: "User updated", user: rows[0] });
  } catch (err: any) {
    if (err?.code === "ER_DUP_ENTRY") {
      return res.status(409).json({ error: "Email already exists" });
    }
    console.error(`PATCH /users/${id} failed:`, err);
    return res.status(500).json({ error: "Could not update user" });
  }
});

router.delete("/:id", async (req: Request, res: Response) => {
  const { id } = req.params;

  if (id === req.user?.id) {
    return res.status(400).json({ error: "You can't delete your own account" });
  }

  try {
    const [result] = await pool.query<ResultSetHeader>(
      "DELETE FROM users WHERE id = ?",
      [id]
    );

    if (result.affectedRows === 0) {
      return res.status(404).json({ error: "User not found" });
    }

    return res.json({ message: "User deleted" });
  } catch (err: any) {
    if (err?.code === "ER_ROW_IS_REFERENCED_2") {
      return res
        .status(409)
        .json({ error: "User still has related data and can't be deleted" });
    }
    console.error(`DELETE /users/${id} failed:`, err);
    return res.status(500).json({ error: "Could not delete user" });
  }
});

export default router;
