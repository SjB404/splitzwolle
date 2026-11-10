import { beforeEach, describe, expect, it, vi } from "vitest";
import express from "express";
import request from "supertest";

const { pool } = vi.hoisted(() => ({ pool: { query: vi.fn() } }));

vi.mock("mysql2/promise", () => ({
  default: { createPool: () => pool },
}));

import router from "../admin/contactRequests.ts";
import { signToken } from "../login/jwt.ts";

const app = express();
app.use(express.json());
app.use("/admin/contact-requests", router);

const adminToken = signToken({
  id: "admin-1",
  email: "admin@b.nl",
  role: "admin",
});
const userToken = signToken({
  id: "user-1",
  email: "user@b.nl",
  role: "user",
});

const contactRequest = {
  id: 12,
  name: "Alice",
  email: "alice@example.nl",
  subject: "Vraag over een route",
  message: "Kunt u mij helpen?",
  status: "in_behandeling",
};

beforeEach(() => {
  pool.query.mockReset();
  vi.spyOn(console, "error").mockImplementation(() => {});
});

describe("GET /admin/contact-requests", () => {
  it("requires an admin session", async () => {
    expect((await request(app).get("/admin/contact-requests")).status).toBe(401);
    expect(
      (
        await request(app)
          .get("/admin/contact-requests")
          .set("Authorization", `Bearer ${userToken}`)
      ).status,
    ).toBe(403);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("returns contact details and statuses to an admin", async () => {
    pool.query.mockResolvedValueOnce([[contactRequest], []]);
    const res = await request(app)
      .get("/admin/contact-requests")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual([contactRequest]);
    expect(pool.query).toHaveBeenCalledWith(
      "SELECT id, name, email, subject, message, status FROM contact ORDER BY id DESC",
    );
  });

  it("returns an explicit error when loading fails", async () => {
    pool.query.mockRejectedValueOnce(new Error("database unavailable"));
    const res = await request(app)
      .get("/admin/contact-requests")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(500);
    expect(res.body).toEqual({ error: "Could not fetch contact requests" });
  });
});

describe("PATCH /admin/contact-requests/:id", () => {
  it("rejects unknown statuses without querying the database", async () => {
    const res = await request(app)
      .patch("/admin/contact-requests/12")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "deleted" });

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });

  it("persists a status and returns the updated request", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    pool.query.mockResolvedValueOnce([[contactRequest], []]);
    const res = await request(app)
      .patch("/admin/contact-requests/12")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "in_behandeling" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual(contactRequest);
    expect(pool.query).toHaveBeenNthCalledWith(
      1,
      "UPDATE contact SET status = ? WHERE id = ?",
      ["in_behandeling", "12"],
    );
  });

  it("returns 404 for a request that does not exist", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
    pool.query.mockResolvedValueOnce([[], []]);
    const res = await request(app)
      .patch("/admin/contact-requests/missing")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "nieuw" });

    expect(res.status).toBe(404);
  });

  it("does not allow marking a request finished without deleting it", async () => {
    const res = await request(app)
      .patch("/admin/contact-requests/12")
      .set("Authorization", `Bearer ${adminToken}`)
      .send({ status: "afgerond" });

    expect(res.status).toBe(400);
    expect(pool.query).not.toHaveBeenCalled();
  });
});

describe("DELETE /admin/contact-requests/:id", () => {
  it("deletes a request for an admin", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 1 }, []]);
    const res = await request(app)
      .delete("/admin/contact-requests/12")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ ok: true });
    expect(pool.query).toHaveBeenCalledWith(
      "DELETE FROM contact WHERE id = ?",
      ["12"],
    );
  });

  it("returns 404 when the request no longer exists", async () => {
    pool.query.mockResolvedValueOnce([{ affectedRows: 0 }, []]);
    const res = await request(app)
      .delete("/admin/contact-requests/12")
      .set("Authorization", `Bearer ${adminToken}`);

    expect(res.status).toBe(404);
  });
});
