import { describe, it, expect, vi } from "vitest";
import express from "express";
import request from "supertest";

const { stub } = vi.hoisted(() => ({
  stub: (name: string, path: string) => async () => {
    const { Router } = await import("express");
    const r = Router();
    r.get(path, (_req, res) => {
      res.send(name);
    });
    return { default: r };
  },
}));

vi.mock("../login/register.ts", stub("register", "/ping"));
vi.mock("../login/login.ts", stub("login", "/login-ping"));
vi.mock("../login/googleAuth.ts", stub("google", "/google-ping"));
vi.mock("../pages/contact.ts", stub("contact", "/ping"));
vi.mock("../admin/users.ts", stub("admin-users", "/ping"));
vi.mock("../pages/reviews.ts", stub("reviews", "/reviews/view"));

import router from "../index.ts";

const app = express();
app.use("/api", router);

describe("index router", () => {
  it("mounts the register router at /users", async () => {
    const res = await request(app).get("/api/users/ping");
    expect(res.text).toBe("register");
  });

  it("mounts the login router at /auth", async () => {
    const res = await request(app).get("/api/auth/login-ping");
    expect(res.text).toBe("login");
  });

  it("mounts the Google router at /auth as well", async () => {
    const res = await request(app).get("/api/auth/google-ping");
    expect(res.text).toBe("google");
  });

  it("mounts the contact router at /contact", async () => {
    const res = await request(app).get("/api/contact/ping");
    expect(res.text).toBe("contact");
  });

  it("returns 404 for unknown paths", async () => {
    const res = await request(app).get("/api/nope");
    expect(res.status).toBe(404);
  });

  it("mounts the admin users router at /admin/users", async () => {
    const res = await request(app).get("/api/admin/users/ping");
    expect(res.text).toBe("admin-users");
  });

  it("mounts the reviews router on its own /reviews paths", async () => {
    const res = await request(app).get("/api/reviews/view");
    expect(res.text).toBe("reviews");
  });
});
