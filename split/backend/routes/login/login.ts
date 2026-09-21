import { Router, Request, Response } from "express";
import bcrypt from "bcryptjs";
import { verify } from "otplib";
import mysql, { RowDataPacket } from "mysql2/promise";
import { signToken } from "./jwt.ts";

interface UserRow extends RowDataPacket {
  id: string;
  email: string;
  name: string;
  password: string;
  role: string;
  two_factor_secret: string | null;
  two_factor_enabled: boolean;
}

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

router.post("/login", async (req: Request, res: Response) => {
  const { email, password, token } = req.body;

  if (!email || !password) {
    return res.status(400).json({
      error: "email and password are required",
    });
  }

  try {
    const [rows] = await pool.query<UserRow[]>(
      "SELECT * FROM users WHERE email = ?",
      [email]
    );

    const user = rows[0];

    if (!user || !(await bcrypt.compare(password, user.password))) {
      return res.status(401).json({
        error: "credentials are invalid",
      });
    }

    if (user.two_factor_enabled) {
      if (!token) {
        return res.status(200).json({
          twoFactorRequired: true,
          message: "Enter the 6-digit code from your authenticator app",
        });
      }

      if (!user.two_factor_secret) {
        console.error(
          `User ${user.id} has two_factor_enabled but no secret`
        );

        return res.status(500).json({
          error: "two-factor is misconfigured for this account",
        });
      }

      const result = await verify({
        secret: user.two_factor_secret,
        token: String(token),
        epochTolerance: 1,
      });

      if (!result.valid) {
        return res.status(401).json({
          error: "invalid two-factor code",
        });
      }
    }

    const jwtToken = signToken({ id: user.id, email: user.email, role: user.role });

    // httpOnly cookie so the browser sends it automatically on future
    // requests (the frontend already fetches with credentials: "include").
    res.cookie("token", jwtToken, {
      httpOnly: true,
      sameSite: "lax",
      maxAge: 60 * 60 * 1000,
    });

    return res.status(200).json({
      message: "Logged in",
      token: jwtToken,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        role: user.role,
      },
    });
  } catch (err) {
    console.error("POST /login failed:", err);

    return res.status(500).json({
      error: "Login failed",
      detail: err instanceof Error ? err.message : String(err),
    });
  }
});

export default router;
