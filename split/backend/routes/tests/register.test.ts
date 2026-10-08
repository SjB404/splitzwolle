import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";

const { pool, otp, qr } = vi.hoisted(() => ({
  pool: { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() },
  otp: { generateSecret: vi.fn(), generateURI: vi.fn() },
  qr: { toDataURL: vi.fn() },
}));

vi.mock("mysql2/promise", () => ({ default: { createPool: () => pool } }));
vi.mock("otplib", () => otp);
vi.mock("qrcode", () => ({ default: qr }));

import router from "../login/register.ts";
import { verifyToken } from "../login/jwt.ts";

const app = express();
app.use(express.json());
app.use("/users", router);

const valid = { name: "Alice", email: "a@b.nl", password: "supersecret" };
const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/;

const cookieOf = (res: request.Response) =>
  ([] as string[]).concat(res.headers["set-cookie"] ?? []).find((c) => c.startsWith("token="));

// first query checks the email, second is the insert
const emailFree = () => {
  pool.query.mockResolvedValueOnce([[], []]);
  pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
};

beforeEach(() => {
  pool.query.mockReset();
  otp.generateSecret.mockReset();
  otp.generateURI.mockReset();
  qr.toDataURL.mockReset();
});

describe("POST /users/register", () => {
  it("400 when name, email or password is missing", async () => {
    for (const missing of ["name", "email", "password"]) {
      const body: Record<string, string> = { ...valid };
      delete body[missing];
      const res = await request(app).post("/users/register").send(body);
      expect(res.status).toBe(400);
    }
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("409 when the email is already registered", async () => {
    pool.query.mockResolvedValueOnce([[{ id: "existing" }], []]);
    const res = await request(app).post("/users/register").send(valid);

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Email already exists" });
    expect(pool.query).toHaveBeenCalledTimes(1);
  });

  it("201: creates the user, returns id + token, no 2FA data", async () => {
    emailFree();
    const res = await request(app).post("/users/register").send(valid);

    expect(res.status).toBe(201);
    expect(res.body.id).toMatch(UUID);
    expect(res.body.token).toBeDefined();
    expect(res.body.qrCode).toBeUndefined();
    expect(res.body.secret).toBeUndefined();
    expect(otp.generateSecret).not.toHaveBeenCalled();
  });

  it("stores a bcrypt hash, never the plain password", async () => {
    emailFree();
    await request(app).post("/users/register").send(valid);

    const [sql, params] = pool.query.mock.calls[1];
    expect(sql).toMatch(/INSERT INTO users/);
    const [id, name, email, hash, role, secret, twoFactorEnabled] = params;

    expect(id).toMatch(UUID);
    expect([name, email]).toEqual(["Alice", "a@b.nl"]);
    expect(hash).not.toBe(valid.password);
    expect(await bcrypt.compare(valid.password, hash)).toBe(true);
    expect([role, secret, twoFactorEnabled]).toEqual(["user", null, false]);
  });

  it("defaults the role to 'user' and signs it into the token", async () => {
    emailFree();
    const res = await request(app).post("/users/register").send(valid);

    expect(verifyToken(res.body.token)).toMatchObject({
      id: res.body.id,
      email: "a@b.nl",
      role: "user",
    });
  });

  it("sets an httpOnly token cookie matching the returned token", async () => {
    emailFree();
    const res = await request(app).post("/users/register").send(valid);

    const cookie = cookieOf(res)!;
    expect(cookie).toMatch(/HttpOnly/i);
    expect(cookie).toMatch(/SameSite=Lax/i);
    expect(cookie.split(";")[0]).toBe(`token=${res.body.token}`);
  });

  it("with twofa: generates a secret + QR code and stores 2FA as enabled", async () => {
    emailFree();
    otp.generateSecret.mockReturnValue("NEWSECRET");
    otp.generateURI.mockReturnValue("otpauth://totp/Swolla:a@b.nl?secret=NEWSECRET");
    qr.toDataURL.mockResolvedValue("data:image/png;base64,QR");

    const res = await request(app)
      .post("/users/register")
      .send({ ...valid, twofa: true });

    expect(res.status).toBe(201);
    expect(res.body.secret).toBe("NEWSECRET");
    expect(res.body.qrCode).toBe("data:image/png;base64,QR");
    expect(otp.generateURI).toHaveBeenCalledWith({
      issuer: "Swolla",
      label: "a@b.nl",
      secret: "NEWSECRET",
    });
    expect(qr.toDataURL).toHaveBeenCalledWith("otpauth://totp/Swolla:a@b.nl?secret=NEWSECRET");

    const params = pool.query.mock.calls[1][1];
    expect(params[5]).toBe("NEWSECRET");
    expect(params[6]).toBe(true);
  });

  it("500 when the database fails", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error("db down"));
    const res = await request(app).post("/users/register").send(valid);

    expect(res.status).toBe(500);
    expect(res.body.error).toBe("Registration failed");
    spy.mockRestore();
  });

  it("ignores a client-supplied role and registers the user as 'user'", async () => {
    emailFree();
    const res = await request(app)
      .post("/users/register")
      .send({ ...valid, role: "admin" });

    expect(res.status).toBe(201);
    expect(pool.query.mock.calls[1][1][4]).toBe("user");
    expect(verifyToken(res.body.token).role).toBe("user");
  });

  it("does not leak internal error details in the 500 response", async () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    pool.query.mockRejectedValueOnce(new Error("db down with secret details"));
    const res = await request(app).post("/users/register").send(valid);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Registration failed" });
    spy.mockRestore();
  });
});
