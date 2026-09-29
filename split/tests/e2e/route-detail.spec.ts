import { expect, test } from "./fixtures";
import {
  ROUTES,
  ROUTE_REVIEWS,
  formatDistance,
  formatDuration,
  formatRating,
  getRelatedRoutes,
  routePoints,
} from "./app";

/* the deepest checks run against one route, taken from the data rather than named here */
const ROUTE = ROUTES[0];
const PLACES = routePoints(ROUTE);
const PATH = `/routes/${ROUTE.id}`;

test.describe("a route's own page", { tag: "@route" }, () => {
  test("heads itself with the route's own words", async ({ page, errors }) => {
    await page.goto(PATH);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      ROUTE.title,
    );
    await expect(page).toHaveTitle(`${ROUTE.title} · Zwolle Routes`);
    await expect(
      page.getByText(ROUTE.theme, { exact: true }).first(),
    ).toBeVisible();
    await expect(
      page.getByText(
        `${formatRating(ROUTE.rating)} · ${ROUTE.reviews} beoordelingen`,
      ),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("leads back to the overview", async ({ page }) => {
    await page.goto(PATH);

    await page
      .getByRole("navigation", { name: "Kruimelpad" })
      .getByRole("link", { name: "Alle routes" })
      .click();

    await expect(page).toHaveURL("/routes");
  });

  test("prints the route's own facts", async ({ page }) => {
    await page.goto(PATH);

    await expect(page.getByText("Afstand", { exact: true })).toBeVisible();
    await expect(
      page.getByText(formatDistance(ROUTE.distanceKm)).first(),
    ).toBeVisible();
    await expect(
      page.getByText(formatDuration(ROUTE.durationMinutes)).first(),
    ).toBeVisible();
    await expect(
      page.getByText(ROUTE.difficulty, { exact: true }).first(),
    ).toBeVisible();
    await expect(page.getByText(`${ROUTE.elevation} m`)).toBeVisible();
  });

  test("tells the story and lists every place under way", async ({ page }) => {
    await page.goto(PATH);

    await expect(
      page.getByRole("heading", { level: 2, name: "Over deze route" }),
    ).toBeVisible();
    /* the header band and the story both carry the route's own description */
    await expect(page.getByText(ROUTE.description)).toHaveCount(2);

    const stops = page
      .getByRole("heading", { level: 3, name: "Onderweg" })
      .locator("xpath=..");
    await expect(stops.getByRole("listitem")).toHaveCount(PLACES.length);

    for (const place of PLACES) {
      await expect
        .soft(stops.getByText(place.name, { exact: true }))
        .toBeVisible();
    }
  });

  test("shows the reviews, the breakdown and the related routes", async ({
    page,
  }) => {
    const related = getRelatedRoutes(ROUTE);

    await page.goto(PATH);

    await expect(
      page.getByRole("heading", {
        level: 2,
        name: `Reviews (${ROUTE.reviews})`,
      }),
    ).toBeVisible();
    await expect(page.locator("progress")).toHaveCount(5);
    await expect(page.getByText(ROUTE_REVIEWS[0].author)).toBeVisible();
    /* the breakdown's own line, not the header's "4,9 · 203 beoordelingen" */
    await expect(
      page.getByText(`${ROUTE.reviews} beoordelingen`, { exact: true }),
    ).toBeVisible();

    await expect(
      page.getByRole("heading", { level: 2, name: "Vergelijkbare routes" }),
    ).toBeVisible();
    for (const candidate of related) {
      await expect
        .soft(page.getByRole("link", { name: candidate.title, exact: true }))
        .toHaveAttribute("href", `/routes/${candidate.id}`);
    }
  });

  test("offers the way into the planner", async ({ page }) => {
    await page.goto(PATH);

    await page.getByRole("link", { name: "Plan deze route" }).click();

    await expect(page).toHaveURL("/planning");
  });

  test("falls back to its own panel when the map api is off", async ({
    page,
  }) => {
    await page.goto(PATH);

    await expect(
      page.getByText(/De kaart kon niet geladen worden/).first(),
    ).toBeVisible();
    await expect(page.locator('[class*="gm-style"]')).toHaveCount(0);
  });
});

test.describe("the review form", { tag: "@route" }, () => {
  test("follows the slider, and submitting keeps the reader on the page", async ({
    page,
  }) => {
    await page.goto(PATH);
    const slider = page.locator('input[type="range"]');

    await expect(page.getByText("5 van 5 sterren")).toBeVisible();

    await slider.focus();
    await slider.press("ArrowLeft");

    await expect(page.getByText("4 van 5 sterren")).toBeVisible();

    await page.getByLabel("Jouw ervaring").fill("Mooie route!");
    await page.getByRole("button", { name: "Review plaatsen" }).click();

    await expect(page).toHaveURL(PATH);
    await expect(page.getByLabel("Jouw ervaring")).toHaveValue("Mooie route!");
  });
});
