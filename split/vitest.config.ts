import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/* the maps key is switched off here: a unit test must never reach for google (see docs/TESTPLAN.md) */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    /* jsdom is created once per worker instead of once per file, which is where most of the run time went */
    pool: "vmThreads",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    /* vitest's own packages have to go through the module runner, or a test file gets a second copy of the runner and cannot find it */
    server: { deps: { inline: [/vitest/, /@testing-library/] } },
    env: {
      VITE_GOOGLE_MAPS_API_KEY: "",
      VITE_GOOGLE_MAPS_MAP_ID: "",
      VITE_GOOGLE_MAPS_STATIC_MAPS: "false",
    },
    /* a test that stubs an env var or a global must not leak it into the next test */
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/main.tsx"],
      reporter: ["text-summary", "html"],
      reportsDirectory: "./coverage",
      /* the floor the suite stands on today (measured: 97.4 / 93.8 / 96.8 / 98.5), so a regression fails
         the run rather than being noticed later */
      thresholds: {
        lines: 95,
        statements: 95,
        functions: 95,
        branches: 90,
      },
    },
  },
});
