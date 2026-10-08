import { describe, it, expect, vi, afterEach } from "vitest";
import jwt from "jsonwebtoken";
import { signToken, verifyToken } from "../login/jwt.ts";

const payload = { id: "user-1", email: "a@b.nl", role: "user" };

// stubs must be cleared by hand: this config does not auto-unstub envs
afterEach(() => {
  vi.unstubAllEnvs();
});

describe("jwt", () => {
  it("signToken returns a JWT that contains the payload and an expiry", () => {
    const token = signToken(payload);
    const decoded = jwt.decode(token) as Record<string, unknown>;

    expect(token.split(".")).toHaveLength(3);
    expect(decoded).toMatchObject(payload);
    expect(typeof decoded.exp).toBe("number");
  });

  it("uses the configured expiry (1h)", () => {
    const decoded = jwt.decode(signToken(payload)) as { iat: number; exp: number };
    expect(decoded.exp - decoded.iat).toBe(60 * 60);
  });

  it("verifyToken round-trips a signed token", () => {
    expect(verifyToken(signToken(payload))).toMatchObject(payload);
  });

  it("verifyToken rejects a token signed with a different secret", () => {
    const forged = jwt.sign(payload, "some-other-secret");
    expect(() => verifyToken(forged)).toThrow();
  });

  it("verifyToken rejects a tampered token", () => {
    const [h, , s] = signToken(payload).split(".");
    const evilBody = Buffer.from(
      JSON.stringify({ ...payload, role: "admin" })
    ).toString("base64url");
    expect(() => verifyToken(`${h}.${evilBody}.${s}`)).toThrow();
  });

  it("verifyToken rejects an expired token", () => {
    const expired = jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: -10 });
    expect(() => verifyToken(expired)).toThrow(/expired/i);
  });

  it("verifyToken rejects garbage", () => {
    expect(() => verifyToken("not-a-token")).toThrow();
  });

  it("throws on a fresh import when NODE_ENV=production and JWT_SECRET is unset", async () => {
    vi.resetModules();
    vi.stubEnv("NODE_ENV", "production");
    vi.stubEnv("JWT_SECRET", "");

    await expect(import("../login/jwt.ts")).rejects.toThrow(/JWT_SECRET/);
  });
});
