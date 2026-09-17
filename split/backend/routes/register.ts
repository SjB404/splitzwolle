import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { generateSecret, generateURI } from "otplib";
import QRCode from "qrcode";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { signToken } from "./jwt.ts";

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
  email: string;
  name: string;
  password_hash: string;
  role: string;
  two_factor_secret: string | null;
  two_factor_enabled: boolean;
}

router.post("/register", async (req: Request, res: Response) => {
  const { name, password, twofa, email, role } = req.body;

  if (!name || !password || !email) {
    return res.status(400).json({ error: "must have name, password and email" });
  }

  try {
    const [existing] = await pool.query<UserRow[]>(
      "SELECT id FROM users WHERE email = ?",
      [email]
    );
    if (existing.length > 0) {
      return res.status(409).json({ error: "Email already exists" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const id = randomUUID();

    let twoFactorSecret: string | null = null;
    let qrCodeDataUrl: string | null = null;

    if (twofa) {
      twoFactorSecret = generateSecret();
      const otpauth = generateURI({ issuer: "Swolla", label: email, secret: twoFactorSecret });
      qrCodeDataUrl = await QRCode.toDataURL(otpauth);
    }

    await pool.query<ResultSetHeader>(
      `INSERT INTO users (id, name, email, password, role, two_factor_secret, two_factor_enabled)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [
        id,
        name,
        email,
        passwordHash,
        role ?? "user",
        twoFactorSecret,
        twofa ?? false,
      ]
    );

    const token = signToken({ id, email, role: role ?? "user" });

    // httpOnly cookie so the browser sends it automatically on future
    // requests (the frontend already fetches with credentials: "include").
    res.cookie("token", token, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.status(201).json({
      message: "Gebruiker geregistreerd",
      id,
      token,
      ...(twofa && { qrCode: qrCodeDataUrl, secret: twoFactorSecret }),
    });
  } catch (err) {
    console.error("POST /register failed:", err);

    res.status(500).json({
      error: "Registration failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
