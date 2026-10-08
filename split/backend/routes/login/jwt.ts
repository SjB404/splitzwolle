import jwt from "jsonwebtoken";
import type { SignOptions } from "jsonwebtoken";
import "dotenv/config";

if (process.env.NODE_ENV === "production" && !process.env.JWT_SECRET) {
  throw new Error("JWT_SECRET must be set in production");
}

const JWT_SECRET = process.env.JWT_SECRET || "iqwsjjstS";
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || "1h";

export interface AuthTokenPayload {
  id: string;
  email: string;
  role: string;
}

export function signToken(payload: AuthTokenPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN as SignOptions["expiresIn"],
  });
}

export function verifyToken(token: string): AuthTokenPayload {
  return jwt.verify(token, JWT_SECRET) as AuthTokenPayload;
}
