import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const { pool, conn } = vi.hoisted(() => {
  const conn = { execute: vi.fn(), query: vi.fn(), release: vi.fn() };
  return { conn, pool: { getConnection: vi.fn(), query: vi.fn() } };
});

vi.mock("mysql2/promise", () => ({ default: { createPool: () => pool } }));

import router from "../pages/contact.ts";

const app = express();
app.use(express.json());
app.use("/contact", router);

const message = {
  name: "Alice",
  email: "a@b.nl",
  message: "Hello there",
  subject: "testSubject"
};

beforeEach(() => {
  conn.execute.mockReset();
  conn.release.mockReset();
  pool.getConnection.mockReset();
  pool.getConnection.mockResolvedValue(conn);
});

describe("POST /contact", () => {
  it("stores the message and answers 200", async () => {
    conn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const res = await request(app).post("/contact").send(message);

    expect(res.status).toBe(200);
    expect(res.text).toBe("Message sent successfully");
    expect(conn.execute).toHaveBeenCalledWith(
      "INSERT INTO contact (name, email, subject, message) VALUES (?, ?, ?, ?)",
      ["Alice", "a@b.nl", "testSubject", "Hello there",]
    );
  });

  it("releases the connection after a successful insert", async () => {
    conn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    await request(app).post("/contact").send(message);

    expect(conn.release).toHaveBeenCalledTimes(1);
  });

  it("uses a prepared statement, so SQL in the input is never executed", async () => {
    conn.execute.mockResolvedValueOnce([{ affectedRows: 1 }]);
    const evil = { ...message, message: "'); DROP TABLE contact; --" };
    await request(app).post("/contact").send(evil);

    const [sql, params] = conn.execute.mock.calls[0];
    expect(sql).not.toContain("DROP TABLE");
    expect(params[3]).toBe(evil.message);
  });

  it("500 when no connection can be obtained", async () => {
    pool.getConnection.mockRejectedValueOnce(new Error("pool exhausted"));
    const res = await request(app).post("/contact").send(message);

    expect(res.status).toBe(500);
    expect(res.text).toBe("Error sending message");
  });

  it("500 when the insert fails", async () => {
    conn.execute.mockRejectedValueOnce(new Error("db down"));
    const res = await request(app).post("/contact").send(message);

    expect(res.status).toBe(500);
    expect(res.text).toBe("Error sending message");
  });

  it.todo("should validate name/email/message (currently missing fields go straight to the DB)");
  it.todo("should release the connection when the insert fails (currently it leaks)");
});