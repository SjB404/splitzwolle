import { describe, it, expect } from "vitest";
import express from "express";
import request from "supertest";
import jwt from "jsonwebtoken";
import requireAuth, { requireRole } from "../../middleware/userAuthenticator.ts";
import { signToken } from "../login/jwt.ts";

const app = express();
app.get("/protected", requireAuth, (req, res) => {
  res.json({ user: req.user });
});
app.get("/admin", requireRole("admin"), (_req, res) => {
  res.json({ ok: true });
});
app.get("/staff", requireRole("admin", "moderator"), (_req, res) => {
  res.json({ ok: true });
});

const tokenFor = (role: string) =>
  signToken({ id: "user-1", email: "a@b.nl", role });

describe("requireAuth", () => {
  it("401 when there is no token", async () => {
    const res = await request(app).get("/protected");
    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Not logged in" });
  });

  it("accepts a Bearer token and exposes the payload as req.user", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${tokenFor("user")}`);

    expect(res.status).toBe(200);
    expect(res.body.user).toMatchObject({ id: "user-1", email: "a@b.nl", role: "user" });
  });

  it("accepts the httpOnly token cookie", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Cookie", `token=${tokenFor("user")}`);

    expect(res.status).toBe(200);
    expect(res.body.user.id).toBe("user-1");
  });

  it("finds the token cookie among other cookies", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Cookie", `theme=dark; token=${tokenFor("user")}; lang=nl`);

    expect(res.status).toBe(200);
  });

  it("prefers the Authorization header over the cookie", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${tokenFor("admin")}`)
      .set("Cookie", `token=${tokenFor("user")}`);

    expect(res.body.user.role).toBe("admin");
  });

  it("401 for an invalid token", async () => {
    const res = await request(app)
      .get("/protected")
      .set("Authorization", "Bearer nonsense");

    expect(res.status).toBe(401);
    expect(res.body).toEqual({ error: "Invalid or expired token" });
  });

  it("401 for an expired token", async () => {
    const expired = jwt.sign(
      { id: "user-1", email: "a@b.nl", role: "user" },
      process.env.JWT_SECRET!,
      { expiresIn: -10 }
    );
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${expired}`);

    expect(res.status).toBe(401);
  });

  it("401 for a token signed with another secret", async () => {
    const forged = jwt.sign({ id: "x", email: "x@x.nl", role: "admin" }, "wrong-secret");
    const res = await request(app)
      .get("/protected")
      .set("Authorization", `Bearer ${forged}`);

    expect(res.status).toBe(401);
  });
});

describe("requireRole", () => {
  it("401 when not logged in", async () => {
    const res = await request(app).get("/admin");
    expect(res.status).toBe(401);
  });

  it("401 for an invalid token", async () => {
    const res = await request(app).get("/admin").set("Authorization", "Bearer nonsense");
    expect(res.status).toBe(401);
  });

  it("403 when logged in with the wrong role", async () => {
    const res = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${tokenFor("user")}`);

    expect(res.status).toBe(403);
    expect(res.body).toEqual({ error: "You don't have permission to do this" });
  });

  it("200 when the role matches", async () => {
    const res = await request(app)
      .get("/admin")
      .set("Authorization", `Bearer ${tokenFor("admin")}`);

    expect(res.status).toBe(200);
  });

  it("works with the cookie too", async () => {
    const res = await request(app)
      .get("/admin")
      .set("Cookie", `token=${tokenFor("admin")}`);

    expect(res.status).toBe(200);
  });

  it("allows any one of several roles", async () => {
    for (const role of ["admin", "moderator"]) {
      const res = await request(app)
        .get("/staff")
        .set("Authorization", `Bearer ${tokenFor(role)}`);
      expect(res.status).toBe(200);
    }
  });

  it("rejects roles that are not in the list", async () => {
    const res = await request(app)
      .get("/staff")
      .set("Authorization", `Bearer ${tokenFor("user")}`);

    expect(res.status).toBe(403);
  });
});
