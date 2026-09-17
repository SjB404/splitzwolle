import { Router, Request, Response } from "express";
import { randomUUID } from "crypto";
import bcrypt from "bcryptjs";
import { OAuth2Client } from "google-auth-library";
import mysql, { RowDataPacket, ResultSetHeader } from "mysql2/promise";
import { signToken } from "./jwt.ts";
import dotenv from "dotenv";

dotenv.config();

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
  role: string;
}

const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const GOOGLE_CLIENT_SECRET = process.env.GOOGLE_CLIENT_SECRET!;
const GOOGLE_REDIRECT_URI =
  process.env.GOOGLE_REDIRECT_URI || "http://localhost:3000/api/auth/google/callback";
const FRONTEND_URL = process.env.FRONTEND_URL || "http://localhost:5173";

console.log(GOOGLE_CLIENT_ID)
const oauthClient = new OAuth2Client(
  GOOGLE_CLIENT_ID,
  GOOGLE_CLIENT_SECRET,
  GOOGLE_REDIRECT_URI
);

// Step 1: send the browser to Google's consent screen
router.get("/google", (req: Request, res: Response) => {
  const url = oauthClient.generateAuthUrl({
    access_type: "offline",
    scope: ["openid", "email", "profile"],
    prompt: "consent",
  });

  res.redirect(url);
});

router.get("/google/callback", async (req: Request, res: Response) => {
  const code = req.query.code as string | undefined;

  if (!code) {
    return res.redirect(`${FRONTEND_URL}/login?error=google_oauth_failed`);
  }

  try {
    const { tokens } = await oauthClient.getToken(code);

    if (!tokens.id_token) {
      throw new Error("No id_token returned by Google");
    }

    const ticket = await oauthClient.verifyIdToken({
      idToken: tokens.id_token,
      audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();

    if (!payload?.email) {
      throw new Error("Google account has no email");
    }

    const { email, name } = payload;

    const [rows] = await pool.query<UserRow[]>(
      "SELECT id, email, name, role FROM users WHERE email = ?",
      [email]
    );

    let user = rows[0];

    if (!user) {
      // No account with this email yet -> create one. Google-only accounts
      // still need a `password` value since that column isn't nullable, so
      // we store an unusable random hash; these users can only sign in via Google.
      const id = randomUUID();
      const randomPasswordHash = await bcrypt.hash(randomUUID(), 10);

      await pool.query<ResultSetHeader>(
        `INSERT INTO users (id, name, email, password, role, two_factor_secret, two_factor_enabled)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [id, name ?? email, email, randomPasswordHash, "user", null, false]
      );

      user = { id, email, name: name ?? email, role: "user" } as UserRow;
    }

    const jwtToken = signToken({ id: user.id, email: user.email, role: user.role });

    res.cookie("token", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    res.redirect(`${FRONTEND_URL}/login?oauth=success`);
  } catch (err) {
    console.error("GET /auth/google/callback failed:", err);
    res.redirect(`${FRONTEND_URL}/login?error=google_oauth_failed`);
  }
});

export default router;
