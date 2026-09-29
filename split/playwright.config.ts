import { defineConfig, devices } from "@playwright/test";

/* the e2e server is its own (port 4321) and has no maps key, so the suite never bills google and the
   map fallback is the deterministic thing under test — the real maps are checked by hand at 5173 */
const PORT = 4321;

export default defineConfig({
  testDir: "./tests/e2e",
  fullyParallel: true,
  workers: 2,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  reporter: [["list"]],
  timeout: 45_000,
  expect: { timeout: 10_000 },
  use: {
    baseURL: `http://localhost:${PORT}`,
    locale: "nl-NL",
    timezoneId: "Europe/Amsterdam",
    trace: "retain-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `npm run dev -- --port ${PORT} --strictPort`,
    url: `http://localhost:${PORT}`,
    reuseExistingServer: false,
    timeout: 120_000,
    env: {
      VITE_GOOGLE_MAPS_API_KEY: "",
      VITE_GOOGLE_MAPS_MAP_ID: "",
      VITE_GOOGLE_MAPS_STATIC_MAPS: "false",
    },
  },
});
