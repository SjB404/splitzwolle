import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";

const { pool, otp } = vi.hoisted(() => ({
  pool: { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() },
  otp: { verify: vi.fn() },
}));

vi.mock("mysql2/promise", () => ({ default: { createPool: () => pool } }));
vi.mock("otplib", () => otp);

import router from "../login/login.ts";
import { verifyToken } from "../login/jwt.ts";

const app = express();
app.use(express.json());
app.use("/auth", router);

const PASSWORD = "correct-password";
const baseUser = {
  id: "user-1",
  email: "a@b.nl",
  name: "Alice",
  password: bcrypt.hashSync(PASSWORD, 4),
  role: "user",
  two_factor_secret: null,
  two_factor_enabled: false,
};

const mockUser = (overrides: Record<string, unknown> = {}) =>
  pool.query.mockResolvedValueOnce([[{ ...baseUser, ...overrides }], []]);

const cookieOf = (res: request.Response) =>
  ([] as string[]).concat(res.headers["set-cookie"] ?? []).find((c) => c.startsWith("token="));

beforeEach(() => {
  pool.query.mockReset();
  otp.verify.mockReset();
});

describe("POST /auth/login", () => {
  it("400 when email or password is missing", async () => {
    for (const body of [{}, { email: "a@b.nl" }, { password: PASSWORD }]) {
      const res = await request(app).post("/auth/login").send(body);
      expect(res.status).toBe(400);
      expect(res.body.error).toMatch(/required/);
    }
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("401 when the user does not exist", async () => {
    pool.query.mockResolvedValueOnce([[], []]);
    const res = await request(app)
      .post("/auth/login")
      .send({ email: "nobody@b.nl", password: PASSWORD });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "credentials are invalid" });
  });

  it("401 on a wrong password (same message as unknown user)", async () => {
    mockUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: baseUser.email, password: "wrong" });

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "credentials are invalid" });
  });

  it("looks the user up by email with a parameterised query", async () => {
    mockUser();
    await request(app).post("/auth/login").send({ email: baseUser.email, password: PASSWORD });

    expect(pool.query).toHaveBeenCalledWith(expect.stringContaining("WHERE email = ?"), [
      baseUser.email,
    ]);
  });

  it("200 with a valid JWT, user info and no password hash", async () => {
    mockUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: baseUser.email, password: PASSWORD });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Logged in");
    expect(res.body.user).toEqual({
      id: "user-1",
      email: "a@b.nl",
      name: "Alice",
      role: "user",
    });
    expect(JSON.stringify(res.body)).not.toContain(baseUser.password);
    expect(verifyToken(res.body.token)).toMatchObject({
      id: "user-1",
      email: "a@b.nl",
      role: "user",
    });
  });

  it("sets an httpOnly, SameSite=Lax, 1 hour token cookie", async () => {
    mockUser();
    const res = await request(app)
      .post("/auth/login")
      .send({ email: baseUser.email, password: PASSWORD });

    const cookie = cookieOf(res)!;
    expect(cookie).toBeDefined();
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie).toMatch(/Max-Age=3600/i);
    expect(cookie.split(";")[0]).toBe(`token=${res.body.token}`);
  });

  it("puts the user's role in the token", async () => {
    mockUser({ role: "admin" });
    const res = await request(app)
      .post("/auth/login")
      .send({ email: baseUser.email, password: PASSWORD });

    expect(verifyToken(res.body.token).role).toBe("admin");
  });

  describe("two-factor", () => {
    it("asks for a code when 2FA is on and none was sent (no token, no cookie)", async () => {
      mockUser({ two_factor_enabled: true, two_factor_secret: "SECRET" });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: baseUser.email, password: PASSWORD });

      expect(res.status).toBe(200);
      expect(res.body.twoFactorRequired).toBe(true);
      expect(res.body.token).toBeUndefined();
      expect(cookieOf(res)).toBeUndefined();
      expect(otp.verify).not.toHaveBeenCalled();
    });

    it("500 when 2FA is enabled but the account has no secret", async () => {
      const spy = vi.spyOn(console, "error").mockImplementation(() => {});
      mockUser({ two_factor_enabled: true, two_factor_secret: null });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: baseUser.email, password: PASSWORD, token: "123456" });

      expect(res.status).toBe(500);
      expect(res.body.error).toMatch(/misconfigured/);
      spy.mockRestore();
    });

    it("401 on an invalid code", async () => {
      mockUser({ two_factor_enabled: true, two_factor_secret: "SECRET" });
      otp.verify.mockResolvedValueOnce({ valid: false });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: baseUser.email, password: PASSWORD, token: "000000" });

      expect(res.status).toBe(401);
      expect(res.body).toEqual({ error: "invalid two-factor code" });
      expect(cookieOf(res)).toBeUndefined();
    });

    it("logs in on a valid code and passes secret, code and tolerance to otplib", async () => {
      mockUser({ two_factor_enabled: true, two_factor_secret: "SECRET" });
      otp.verify.mockResolvedValueOnce({ valid: true });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: baseUser.email, password: PASSWORD, token: 123456 });

      expect(res.status).toBe(200);
      expect(res.body.token).toBeDefined();
      expect(otp.verify).toHaveBeenCalledWith({
        secret: "SECRET",
        token: "123456", // numbers are converted to strings
        epochTolerance: 1,
      });
    });

    it("checks the password before the 2FA code", async () => {
      mockUser({ two_factor_enabled: true, two_factor_secret: "SECRET" });
      const res = await request(app)
        .post("/auth/login")
        .send({ email: baseUser.email, password: "wrong", token: "123456" });

      expect(res.status).toBe(401);
      expect(otp.verify).not.toHaveBeenCalled();
    });
  });

  it("500 when the database fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error("db down"));
    const res = await request(app)
      .post("/auth/login")
      .send({ email: baseUser.email, password: PASSWORD });

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Login failed");
    spy.mockRestore();
  });

  it.todo("should not leak internal error details in the 500 response (`detail`)");
});
