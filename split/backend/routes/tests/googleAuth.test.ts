import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";

const { pool, oauth } = vi.hoisted(() => ({
  pool: { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() },
  oauth: { generateAuthUrl: vi.fn(), getToken: vi.fn(), verifyIdToken: vi.fn() },
}));

vi.mock("mysql2/promise", () => ({ default: { createPool: () => pool } }));
vi.mock("google-auth-library", () => ({
  OAuth2Client: class {
    constructor() {
      return oauth;
    }
  },
}));

import router from "../login/googleAuth.ts";
import { verifyToken } from "../login/jwt.ts";

const FRONTEND = "http://frontend.test";
const app = express();
app.use("/auth", router);

const cookieOf = (res: request.Response) =>
  ([] as string[]).concat(res.headers["set-cookie"] ?? []).find((c) => c.startsWith("token="));

const googleReturns = (payload: Record<string, unknown> | undefined) => {
  oauth.getToken.mockResolvedValue({ tokens: { id_token: "google-id-token" } });
  oauth.verifyIdToken.mockResolvedValue({ getPayload: () => payload });
};

beforeEach(() => {
  pool.query.mockReset();
  oauth.generateAuthUrl.mockReset();
  oauth.getToken.mockReset();
  oauth.verifyIdToken.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /auth/google", () => {
  it("redirects to the Google consent URL", async () => {
    oauth.generateAuthUrl.mockReturnValue("https://accounts.google.com/consent?x=1");
    const res = await request(app).get("/auth/google");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe("https://accounts.google.com/consent?x=1");
    expect(oauth.generateAuthUrl).toHaveBeenCalledWith({
      access_type: "offline",
      scope: ["openid", "email", "profile"],
      prompt: "consent",
    });
  });
});

describe("GET /auth/google/callback", () => {
  const failure = `${FRONTEND}/login?error=google_oauth_failed`;

  it("redirects with an error when Google sends no code", async () => {
    const res = await request(app).get("/auth/google/callback");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(failure);
    expect(oauth.getToken).not.toHaveBeenCalled();
  });

  it("logs in an existing user without creating a new one", async () => {
    googleReturns({ email: "a@b.nl", name: "Alice" });
    pool.query.mockResolvedValueOnce([
      [{ id: "user-1", email: "a@b.nl", name: "Alice", role: "admin" }],
      [],
    ]);

    const res = await request(app).get("/auth/google/callback?code=abc");

    expect(res.status).toBe(302);
    expect(res.headers.location).toBe(`${FRONTEND}/login?oauth=success`);
    expect(oauth.getToken).toHaveBeenCalledWith("abc");
    expect(oauth.verifyIdToken).toHaveBeenCalledWith({
      idToken: "google-id-token",
      audience: "test-client-id",
    });
    expect(pool.query).toHaveBeenCalledTimes(1);

    const cookie = cookieOf(res)!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    const jwtValue = cookie.split(";")[0].slice("token=".length);
    expect(verifyToken(jwtValue)).toMatchObject({
      id: "user-1",
      email: "a@b.nl",
      role: "admin", // role comes from the db, not from google
    });
  });

  it("creates a new 'user' account for an unknown email", async () => {
    googleReturns({ email: "new@b.nl", name: "Newbie" });
    pool.query.mockResolvedValueOnce([[], []]); // select: not found
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]); // insert

    const res = await request(app).get("/auth/google/callback?code=abc");

    expect(res.headers.location).toBe(`${FRONTEND}/login?oauth=success`);
    expect(pool.query).toHaveBeenCalledTimes(2);

    const [sql, params] = pool.query.mock.calls[1];
    expect(sql).toMatch(/INSERT INTO users/);
    const [id, name, email, passwordHash, role, secret, twoFactor] = params;
    expect([name, email, role, secret, twoFactor]).toEqual([
      "Newbie",
      "new@b.nl",
      "user",
      null,
      false,
    ]);
    // random, unusable password (bcrypt hash of a random uuid)
    expect(await bcrypt.compare("", passwordHash)).toBe(false);
    expect(passwordHash).toMatch(/^\$2[aby]\$/);

    const jwtValue = cookieOf(res)!.split(";")[0].slice("token=".length);
    expect(verifyToken(jwtValue)).toMatchObject({ id, email: "new@b.nl", role: "user" });
  });

  it("falls back to the email as name when Google has no name", async () => {
    googleReturns({ email: "noname@b.nl" });
    pool.query.mockResolvedValueOnce([[], []]);
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);

    await request(app).get("/auth/google/callback?code=abc");

    expect(pool.query.mock.calls[1][1][1]).toBe("noname@b.nl");
  });

  it("redirects with an error when Google returns no id_token", async () => {
    oauth.getToken.mockResolvedValue({ tokens: {} });
    const res = await request(app).get("/auth/google/callback?code=abc");

    expect(res.headers.location).toBe(failure);
    expect(cookieOf(res)).toBeUndefined();
  });

  it("redirects with an error when the Google account has no email", async () => {
    googleReturns({ name: "No Email" });
    const res = await request(app).get("/auth/google/callback?code=abc");

    expect(res.headers.location).toBe(failure);
    expect(pool.query).not.toHaveBeenCalled();
    expect(cookieOf(res)).toBeUndefined();
  });

  it("redirects with an error when the id_token can't be verified", async () => {
    oauth.getToken.mockResolvedValue({ tokens: { id_token: "bad" } });
    oauth.verifyIdToken.mockRejectedValue(new Error("Invalid token signature"));
    const res = await request(app).get("/auth/google/callback?code=abc");

    expect(res.headers.location).toBe(failure);
    expect(cookieOf(res)).toBeUndefined();
  });

  it("redirects with an error when the code exchange fails", async () => {
    oauth.getToken.mockRejectedValue(new Error("invalid_grant"));
    const res = await request(app).get("/auth/google/callback?code=used-already");

    expect(res.headers.location).toBe(failure);
  });

  it("redirects with an error when the database fails", async () => {
    googleReturns({ email: "a@b.nl", name: "Alice" });
    pool.query.mockRejectedValueOnce(new Error("db down"));
    const res = await request(app).get("/auth/google/callback?code=abc");

    expect(res.headers.location).toBe(failure);
    expect(cookieOf(res)).toBeUndefined();
  });
});
