/**
 * Black-box test script for POST /auth/login (and the /users/register endpoint
 * it depends on), including the 2FA flow.
 *
 * This talks to a REAL running server over HTTP - it does not touch the
 * database directly. Start your dev server first, then run this script.
 *
 * Usage:
 *   API_BASE_URL=http://localhost:3000 npx tsx test-login.ts
 *
 * If your app mounts this router under a prefix (e.g. app.use("/api", router)),
 * include that prefix in API_BASE_URL, e.g. http://localhost:3000/api
 */

import assert from "node:assert/strict";
import { generate } from "otplib";

const BASE_URL = process.env.API_BASE_URL ?? "http://localhost:3000";

async function post(path: string, body: unknown) {
  const res = await fetch(`${BASE_URL}${path}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
  let json: any = null;
  try {
    json = await res.json();
  } catch {
    // no/invalid JSON body - leave as null, tests will fail on missing fields
  }
  return { status: res.status, body: json };
}

function uniqueEmail(tag: string) {
  return `test-${tag}-${Date.now()}-${Math.floor(Math.random() * 1e6)}@example.com`;
}

type Test = { name: string; fn: () => Promise<void> };
const tests: Test[] = [];
function test(name: string, fn: () => Promise<void>) {
  tests.push({ name, fn });
}

// ---- Registration guardrails ------------------------------------------------

test("register: missing fields returns 400", async () => {
  const { status } = await post("/register", { email: "no-password@example.com" });
  assert.equal(status, 400);
});

test("register: duplicate email returns 409", async () => {
  const email = uniqueEmail("dupe");
  const first = await post("/register", { name: "Dupe", email, password: "hunter2pass" });
  assert.equal(first.status, 201);

  const second = await post("/register", { name: "Dupe Again", email, password: "hunter2pass" });
  assert.equal(second.status, 409);
});

// ---- Login without 2FA -------------------------------------------------------

test("login: unknown email returns 401", async () => {
  const { status } = await post("/login", {
    email: uniqueEmail("ghost"),
    password: "whatever123",
  });
  assert.equal(status, 401);
});

test("login: missing email/password returns 400", async () => {
  const { status } = await post("/login", {});
  assert.equal(status, 400);
});

test("login: correct credentials, no 2FA enabled, logs in directly", async () => {
  const email = uniqueEmail("plain");
  const password = "correct-horse-battery";

  const reg = await post("/register", { name: "Plain User", email, password });
  assert.equal(reg.status, 201);

  const login = await post("/login", { email, password });
  assert.equal(login.status, 200);
  assert.equal(login.body.twoFactorRequired, undefined);
  assert.equal(login.body.user?.email, email);
});

test("login: wrong password returns 401", async () => {
  const email = uniqueEmail("wrongpw");
  const password = "correct-horse-battery";

  const reg = await post("/register", { name: "Wrong PW", email, password });
  assert.equal(reg.status, 201);

  const login = await post("/login", { email, password: "definitely-not-it" });
  assert.equal(login.status, 401);
});

// ---- Login with 2FA -----------------------------------------------------------

test("login: 2FA account without a code returns twoFactorRequired", async () => {
  const email = uniqueEmail("2fa-step1");
  const password = "correct-horse-battery";

  const reg = await post("/register", { name: "2FA User", email, password, twofa: true });
  assert.equal(reg.status, 201);
  assert.ok(reg.body.secret, "registration response should include a 2FA secret");

  const login = await post("/login", { email, password });
  assert.equal(login.status, 200);
  assert.equal(login.body.twoFactorRequired, true);
});

test("login: 2FA account with a wrong code returns 401", async () => {
  const email = uniqueEmail("2fa-wrong");
  const password = "correct-horse-battery";

  const reg = await post("/register", { name: "2FA Wrong", email, password, twofa: true });
  assert.equal(reg.status, 201);

  // Astronomically unlikely to collide with the real code, but not impossible.
  const login = await post("/login", { email, password, token: "000000" });
  assert.equal(login.status, 401);
});

test("login: 2FA account with the correct code logs in", async () => {
  const email = uniqueEmail("2fa-correct");
  const password = "correct-horse-battery";

  const reg = await post("/register", { name: "2FA Correct", email, password, twofa: true });
  assert.equal(reg.status, 201);
  const secret = reg.body.secret as string;
  assert.ok(secret, "registration response should include a 2FA secret");

  const token = await generate({ secret });

  const login = await post("/login", { email, password, token });
  assert.equal(login.status, 200);
  assert.equal(login.body.user?.email, email);
});

// ---- Runner --------------------------------------------------------------------

async function main() {
  console.log(`Running against ${BASE_URL}\n`);
  let passed = 0;
  let failed = 0;

  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`  \u2713 ${name}`);
      passed++;
    } catch (err) {
      console.log(`  \u2717 ${name}`);
      console.log(`    ${err instanceof Error ? err.message : String(err)}`);
      failed++;
    }
  }

  console.log(`\n${passed} passed, ${failed} failed`);
  if (failed > 0) process.exitCode = 1;
}

main();
