/* use the globals, never import from "vitest": an imported runner cannot see the suite */

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
