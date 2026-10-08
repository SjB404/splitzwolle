import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";

/* maps key off: unit tests must never reach google */
export default defineConfig({
  plugins: [react()],
  test: {
    environment: "jsdom",
    globals: true,
    /* one jsdom per worker; per-file creation dominated run time */
    pool: "vmThreads",
    include: ["tests/unit/**/*.test.{ts,tsx}"],
    setupFiles: ["./tests/setup.ts"],
    /* without this a test file gets a second copy of the runner */
    server: { deps: { inline: [/vitest/, /@testing-library/] } },
    env: {
      VITE_GOOGLE_MAPS_API_KEY: "",
      VITE_GOOGLE_MAPS_MAP_ID: "",
      VITE_GOOGLE_MAPS_STATIC_MAPS: "false",
    },
    /* stubs of env vars and globals must not leak between tests */
    restoreMocks: true,
    unstubEnvs: true,
    unstubGlobals: true,
    coverage: {
      provider: "v8",
      include: ["src/**/*.{ts,tsx}"],
      exclude: ["src/**/*.d.ts", "src/main.tsx"],
      reporter: ["text-summary", "html"],
      reportsDirectory: "./coverage",
      /* floors just under today's measured 81.6 / 81.8 / 83.7 / 76.5 (lines/statements/functions/branches); the scoped pages are e2e-covered */
      thresholds: {
        lines: 80,
        statements: 80,
        functions: 82,
        branches: 75,
      },
    },
  },
});
