import { describe, it, expect, vi, beforeEach } from "vitest";
import express from "express";
import request from "supertest";

const { pool, conn } = vi.hoisted(() => {
  const conn = { query: vi.fn(), release: vi.fn() };
  return { conn, pool: { getConnection: vi.fn(), query: vi.fn() } };
});

vi.mock("mysql2/promise", () => ({ default: { createPool: () => pool } }));

import router from "../pages/reviews.ts";

const app = express();
app.use(express.json());
app.use("/", router);

beforeEach(() => {
  conn.query.mockReset();
  conn.release.mockReset();
  pool.getConnection.mockReset();
  pool.getConnection.mockResolvedValue(conn);
});

describe("GET /reviews/view", () => {
  it("returns the reviews for the given routeID", async () => {
    const rows = [
      { id: 1, routeID: 5, rating: 4, comment: "Nice" },
      { id: 2, routeID: 5, rating: 5, comment: "Great" },
    ];
    conn.query.mockResolvedValueOnce([rows, []]);

    const res = await request(app).get("/reviews/view?routeID=5");

    expect(res.status).toBe(200);
    expect(res.body).toEqual(rows);
    expect(conn.query).toHaveBeenCalledWith("SELECT * FROM reviews WHERE routeID = ?", ["5"]);
  });

  it("returns an empty array when there are no reviews", async () => {
    conn.query.mockResolvedValueOnce([[], []]);
    const res = await request(app).get("/reviews/view?routeID=99");

    expect(res.status).toBe(200);
    expect(res.body).toEqual([]);
  });

  it("releases the connection", async () => {
    conn.query.mockResolvedValueOnce([[], []]);
    await request(app).get("/reviews/view?routeID=5");

    expect(conn.release).toHaveBeenCalledTimes(1);
  });

  it("passes the routeID as a bound parameter, not inlined in the SQL", async () => {
    conn.query.mockResolvedValueOnce([[], []]);
    await request(app).get("/reviews/view").query({ routeID: "1 OR 1=1" });

    const [sql, params] = conn.query.mock.calls[0];
    expect(sql).not.toContain("1 OR 1=1");
    expect(params).toEqual(["1 OR 1=1"]);
  });
});

describe("POST /reviews", () => {
  it("inserts the rating and comment and confirms", async () => {
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    const res = await request(app).post("/reviews").send({ rating: 4, comment: "Nice route" });

    expect(res.status).toBe(200);
    expect(res.body).toEqual({ message: "Review added" });
    expect(conn.query).toHaveBeenCalledWith("INSERT INTO reviews SET ?", {
      rating: 4,
      comment: "Nice route",
    });
  });

  it("only inserts rating and comment, ignoring any extra body fields", async () => {
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    await request(app)
      .post("/reviews")
      .send({ rating: 5, comment: "x", id: 999, routeID: 1, admin: true });

    expect(conn.query.mock.calls[0][1]).toEqual({ rating: 5, comment: "x" });
  });

  it("releases the connection", async () => {
    conn.query.mockResolvedValueOnce([{ affectedRows: 1 }, undefined]);
    await request(app).post("/reviews").send({ rating: 3, comment: "ok" });

    expect(conn.release).toHaveBeenCalledTimes(1);
  });

  it.todo("should store the routeID (currently reviews aren't linked to a route)");
  it.todo("should require login (requireAuth) and validate rating/comment");
  it.todo("should handle DB errors and release the connection (currently the request hangs)");
});
