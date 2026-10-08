/* the canary: it proves the globals, the jsdom environment and the jest-dom matchers are all wired up.
   the tests deliberately use the globals and never `import { … } from "vitest"` — an imported copy of the
   runner cannot see the running suite in this install and every test file fails with "failed to find the
   current suite" (see docs/TESTPLAN.md) */

test("the runner, jsdom and the matchers are wired up", () => {
  const element = document.createElement("div");
  element.className = "chip";
  document.body.append(element);

  expect(1 + 1).toBe(2);
  expect(element).toHaveClass("chip");
  expect(element).toBeInTheDocument();
  expect(window.localStorage).toBeDefined();
});

test("the maps key is switched off, so no map test reaches for google", () => {
  expect(import.meta.env.VITE_GOOGLE_MAPS_API_KEY).toBe("");
});
