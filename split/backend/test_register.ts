#!/usr/bin/env tsx
/**
 * test-register.ts
 *
 * Integration smoke test for POST /api/users/register.
 *
 * Requirements:
 *   - Your server must already be running:  npm run dev:server
 *   - MySQL must be reachable with the same config as register.ts
 *     (host: localhost, user: root, password: "", database: swolla)
 *
 * Run:
 *   npx tsx test-register.ts
 *
 * It creates a couple of throwaway users (email starting with "test-")
 * and deletes them again at the end, so it's safe to re-run.
 */

import mysql from "mysql2/promise";

const BASE_URL = process.env.BASE_URL ?? "http://localhost:3000";

type TestResult = { name: string; pass: boolean; detail?: string };
const results: TestResult[] = [];

function record(name: string, pass: boolean, detail?: string) {
  results.push({ name, pass, detail });
  console.log(`${pass ? "PASS" : "FAIL"}  ${name}${detail ? ` — ${detail}` : ""}`);
}

async function post(body: unknown) {
  return fetch(`${BASE_URL}/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify(body),
  });
}

async function main() {
  const email = `test-${Date.now()}@example.com`;

  // 1. Missing required fields -> 400
  try {
    const res = await post({ email });
    record("missing fields -> 400", res.status === 400, `got ${res.status}`);
  } catch (err) {
    record("missing fields -> 400", false, `request failed: ${(err as Error).message}`);
  }

  // 2. Valid registration -> 201 with an id
  try {
    const res = await post({ name: "Test User", email, password: "supersecret123" });
    const body = await res.json().catch(() => ({}));
    record("valid registration -> 201", res.status === 201, `got ${res.status}`);
    record("response includes generated id", typeof body.id === "string" && body.id.length > 0);
  } catch (err) {
    record("valid registration -> 201", false, `request failed: ${(err as Error).message}`);
  }

  // 3. Re-registering the same email -> 409
  try {
    const res = await post({ name: "Test User", email, password: "supersecret123" });
    record("duplicate email -> 409", res.status === 409, `got ${res.status}`);
  } catch (err) {
    record("duplicate email -> 409", false, `request failed: ${(err as Error).message}`);
  }

  // 4. Registration with twofa: true -> includes qrCode + secret
  try {
    const twofaEmail = `test-2fa-${Date.now()}@example.com`;
    const res = await post({ name: "2FA User", email: twofaEmail, password: "supersecret123", twofa: true });
    const body = await res.json().catch(() => ({}));
    record(
      "2fa registration returns qrCode + secret",
      res.status === 201 && !!body.qrCode && !!body.secret,
      `got ${res.status}`
    );
  } catch (err) {
    record("2fa registration returns qrCode + secret", false, `request failed: ${(err as Error).message}`);
  }

  // Cleanup: remove any test users this script created
  try {
    const pool = mysql.createPool({
      host: "localhost",
      user: "root",
      password: "",
      database: "swolla",
    });
    await pool.query("DELETE FROM users WHERE email LIKE 'test-%@example.com'");
    await pool.end();
  } catch (err) {
    console.log(`\n(cleanup skipped: ${(err as Error).message})`);
  }

  console.log("\n----------------------------------------");
  const passed = results.filter((r) => r.pass).length;
  console.log(`${passed}/${results.length} tests passed`);
  process.exit(results.every((r) => r.pass) ? 0 : 1);
}

main();
