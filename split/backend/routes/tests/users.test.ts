import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";
import bcrypt from "bcryptjs";

const { pool } = vi.hoisted(() => ({
  pool: { query: vi.fn(), execute: vi.fn(), getConnection: vi.fn() },
}));

vi.mock("mysql2/promise", () => ({ default: { createPool: () => pool } }));

import router from "../admin/users.ts";
import { signToken } from "../login/jwt.ts"; // adjust path if jwt.ts lives elsewhere

const app = express();
app.use(express.json());
app.use("/admin/users", router);

const ADMIN_ID = "admin-1";
const admin = `Bearer ${signToken({ id: ADMIN_ID, email: "admin@b.nl", role: "admin" })}`;
const normal = `Bearer ${signToken({ id: "user-1", email: "u@b.nl", role: "user" })}`;

const updated = { id: "u2", name: "Bob", email: "bob@b.nl", role: "user", two_factor_enabled: 0 };

beforeEach(() => {
  pool.query.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("access control", () => {
  const cases: [string, string, () => request.Test][] = [
    ["GET /", "get", () => request(app).get("/admin/users")],
    ["PATCH /:id", "patch", () => request(app).patch("/admin/users/u2").send({ name: "X" })],
    ["DELETE /:id", "delete", () => request(app).delete("/admin/users/u2")],
  ];

  it.each(cases)("%s → 401 without a token", async (_n, _m, call) => {
    expect((await call()).status).toBe(401);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each(cases)("%s → 403 for a non-admin", async (_n, _m, call) => {
    expect((await call().set("Authorization", normal)).status).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("GET /admin/users", () => {
  it("returns all users and never selects password or 2FA secret", async () => {
    pool.query.mockResolvedValueOnce([[updated], []]);
    const res = await request(app).get("/admin/users").set("Authorization", admin);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([updated]);
    const sql: string = pool.query.mock.calls[0][0];
    expect(sql).not.toMatch(/password|two_factor_secret|\*/);
  });

  it("500 when the database fails", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));
    const res = await request(app).get("/admin/users").set("Authorization", admin);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Could not fetch users" });
  });
});

describe("PATCH /admin/users/:id", () => {
  const patch = (id: string, body: object) =>
    request(app).patch(`/admin/users/${id}`).set("Authorization", admin).send(body);

  const updateOk = () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]); // UPDATE
    pool.query.mockResolvedValueOnce([[updated], []]); // SELECT
  };

  it("400 when there is nothing valid to update", async () => {
    const res = await patch("u2", {});
    expect(res.status).toBe(400);
    expect(res.body.error).toBe("No valid fields to update");
  });

  it("ignores fields that are not allowed (id, two_factor_secret, ...)", async () => {
    const res = await patch("u2", { id: "hacked", two_factor_secret: "x", foo: "bar" });
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it.each([
    ["empty name", { name: "  " }],
    ["non-string name", { name: 5 }],
    ["email without @", { email: "nope" }],
    ["short password", { password: "short" }],
    ["unknown role", { role: "superuser" }],
  ])("400 for %s", async (_label, body) => {
    const res = await patch("u2", body);
    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("updates a single field with a parameterised query", async () => {
    updateOk();
    const res = await patch("u2", { name: "  Bob  " });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "User updated", user: updated });
    expect(pool.query).toHaveBeenNthCalledWith(1, "UPDATE users SET name = ? WHERE id = ?", [
      "Bob", // trimmed
      "u2",
    ]);
  });

  it("updates several fields at once", async () => {
    updateOk();
    await patch("u2", { name: "Bob", email: "bob@b.nl", role: "admin" });

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toBe("UPDATE users SET name = ?, email = ?, role = ? WHERE id = ?");
    expect(params).toEqual(["Bob", "bob@b.nl", "admin", "u2"]);
  });

  it("hashes a new password", async () => {
    updateOk();
    await patch("u2", { password: "a-new-password" });

    const [sql, params] = pool.query.mock.calls[0];
    expect(sql).toBe("UPDATE users SET password = ? WHERE id = ?");
    expect(params[0]).not.toBe("a-new-password");
    expect(await bcrypt.compare("a-new-password", params[0])).toBe(true);
  });

  it("resetTwoFactor disables 2FA and clears the secret", async () => {
    updateOk();
    await patch("u2", { resetTwoFactor: true });

    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      "UPDATE users SET two_factor_enabled = ?, two_factor_secret = ? WHERE id = ?",
      [false, null, "u2"]
    );
  });

  it("404 when the user does not exist", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }, undefined]);
    const res = await patch("ghost", { name: "Bob" });

    expect(res.status).toBe(404);
    expect(res.body).toEqual({ error: "User not found" });
  });

  it("won't let an admin change their own role", async () => {
    const res = await patch(ADMIN_ID, { role: "user" });

    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/own role/);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("does allow an admin to edit themselves without changing the role", async () => {
    updateOk();
    const res = await patch(ADMIN_ID, { name: "New Name", role: "admin" });
    expect(res.status).toBe(200);
  });

  it("409 when the new email is already taken", async () => {
    pool.query.mockRejectedValueOnce(Object.assign(new Error("dup"), { code: "ER_DUP_ENTRY" }));
    const res = await patch("u2", { email: "taken@b.nl" });

    expect(res.status).toBe(409);
    expect(res.body).toEqual({ error: "Email already exists" });
  });

  it("500 on any other database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));
    const res = await patch("u2", { name: "Bob" });

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Could not update user" });
  });
});

describe("DELETE /admin/users/:id", () => {
  const del = (id: string) =>
    request(app).delete(`/admin/users/${id}`).set("Authorization", admin);

  it("deletes a user", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    const res = await del("u2");

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "User deleted" });
    expect(pool.query).toHaveBeenCalledWith("DELETE FROM users WHERE id = ?", ["u2"]);
  });

  it("won't let an admin delete themselves", async () => {
    const res = await del(ADMIN_ID);

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("404 when the user does not exist", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }, undefined]);
    expect((await del("ghost")).status).toBe(404);
  });

  it("409 when other rows still reference the user", async () => {
    pool.query.mockRejectedValueOnce(
      Object.assign(new Error("fk"), { code: "ER_ROW_IS_REFERENCED_2" })
    );
    const res = await del("u2");

    expect(res.status).toBe(409);
    expect(res.body.error).toMatch(/related data/);
  });

  it("500 on any other database error", async () => {
    pool.query.mockRejectedValueOnce(new Error("db down"));
    expect((await del("u2")).status).toBe(500);
  });
});
