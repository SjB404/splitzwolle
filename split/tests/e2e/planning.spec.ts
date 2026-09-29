import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import {
  LOGIN_PATH,
  PACE_KM_PER_HOUR,
  ROUTES,
  formatDistance,
  formatDuration,
} from "./app";
import type { Route } from "./app";

/* the summary's own numbers, read off the row they belong to */
const summary = (page: Page) =>
  page.locator("dl").filter({ hasText: "Totale afstand" });
const totalOf = async (page: Page, label: string) =>
  (await summary(page)
    .locator("dt", { hasText: label })
    .locator("xpath=..")
    .locator("dd")
    .textContent()) ?? "";

/* beerCSS paints a decorative span over its checkbox, so the click goes to the label that wraps both */
const toggle = (page: Page, name: string) =>
  page.getByRole("checkbox", { name }).locator("xpath=..").click();

/** the routes the planner starts with, read off the page instead of being written down here */
async function savedRoutes(page: Page): Promise<Route[]> {
  const names = await page
    .getByRole("checkbox")
    .evaluateAll((boxes) =>
      boxes.map((box) => box.getAttribute("aria-label") ?? ""),
    );

  return names.map((name) => {
    const route = ROUTES.find((candidate) => name.startsWith(candidate.title));
    if (!route)
      throw new Error(
        `the planner offers a route the data does not have: ${name}`,
      );
    return route;
  });
}

/** what the summary has to say for this set of routes, worked out from the data */
function expectedTotals(routes: Route[]) {
  const distanceKm = routes.reduce((sum, route) => sum + route.distanceKm, 0);

  return {
    distance: formatDistance(distanceKm),
    duration: formatDuration(
      Math.round((distanceKm / PACE_KM_PER_HOUR.walking) * 60),
    ),
    stops: new Set(routes.flatMap((route) => route.poiIds)).size,
  };
}

test.describe("the planner", { tag: "@planner" }, () => {
  test("starts with its saved routes ticked, and adds them up", async ({
    page,
    errors,
  }) => {
    await page.goto("/planning");

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Stel je route samen",
    );

    const saved = await savedRoutes(page);
    const totals = expectedTotals(saved);

    expect(saved.length).toBeGreaterThan(1);

    for (const box of await page.getByRole("checkbox").all()) {
      await expect.soft(box).toBeChecked();
    }

    await expect(
      page.getByText(`${saved.length} van ${saved.length}`, { exact: true }),
    ).toBeVisible();
    await expect(summary(page)).toContainText(totals.distance);
    await expect(summary(page)).toContainText(totals.duration);
    await expect(summary(page)).toContainText(String(totals.stops));
    await expect(
      page.getByText(`${saved.length} van ${saved.length} routes`),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("recomputes the totals and the map when a route is ticked off", async ({
    page,
  }) => {
    await page.goto("/planning");

    const saved = await savedRoutes(page);
    const [dropped, ...rest] = [...saved].reverse();
    const totals = expectedTotals(rest);

    await toggle(page, `${dropped.title} opnemen in de planning`);

    await expect(
      page.getByText(`${rest.length} van ${saved.length}`, { exact: true }),
    ).toBeVisible();
    await expect(summary(page)).toContainText(totals.distance);
    await expect(summary(page)).toContainText(totals.duration);
    await expect(
      page.getByText(`${rest.length} van ${saved.length} routes`),
    ).toBeVisible();
  });

  test("adds a route back in", async ({ page }) => {
    await page.goto("/planning");

    const saved = await savedRoutes(page);
    const totals = expectedTotals(saved);

    await toggle(page, `${saved[0].title} opnemen in de planning`);
    await toggle(page, `${saved[0].title} opnemen in de planning`);

    await expect(
      page.getByText(`${saved.length} van ${saved.length}`, { exact: true }),
    ).toBeVisible();
    await expect(summary(page)).toContainText(totals.distance);
  });

  test("empties the planning again", async ({ page }) => {
    await page.goto("/planning");

    for (const box of await page.getByRole("checkbox").all()) {
      await box.locator("xpath=..").click();
    }

    const saved = await savedRoutes(page);

    await expect(
      page.getByText(`0 van ${saved.length}`, { exact: true }),
    ).toBeVisible();
    await expect(summary(page)).toContainText("0,0 km");
    await expect(page.getByText(`0 van ${saved.length} routes`)).toBeVisible();
    await expect(
      page.getByText("Kies links minimaal één route om de kaart te vullen."),
    ).toBeVisible();
  });

  test("says which pace the duration was worked out with", async ({ page }) => {
    await page.goto("/planning");

    const pace = String(PACE_KM_PER_HOUR.walking).replace(".", ",");

    await expect(
      page.getByText(`Gerekend met een wandeltempo van ${pace} km per uur.`),
    ).toBeVisible();
  });

  test("splits the totals into the rows the summary prints", async ({
    page,
  }) => {
    await page.goto("/planning");

    const saved = await savedRoutes(page);

    /* scoped to the summary, because "Routes" is also a link in the bar and in the footer */
    await expect(
      summary(page).getByText("Routes", { exact: true }),
    ).toBeVisible();
    expect(await totalOf(page, "Routes")).toBe(String(saved.length));
    expect(await totalOf(page, "Stopplaatsen")).toBe(
      String(expectedTotals(saved).stops),
    );
  });

  test("links every saved route at its own page", async ({ page }) => {
    await page.goto("/planning");

    const saved = await savedRoutes(page);
    const hrefs = await page
      .locator('a[href^="/routes/"]')
      .evaluateAll((links) => links.map((link) => link.getAttribute("href")));

    expect(hrefs.sort()).toEqual(
      saved.map((route) => `/routes/${route.id}`).sort(),
    );

    await page.locator('a[href^="/routes/"]').first().click();
    await expect(page).toHaveURL(/\/routes\/.+/);
  });

  test("points at the overview for another route", async ({ page }) => {
    await page.goto("/planning");

    await page.getByRole("link", { name: "Bekijk alle routes" }).click();

    await expect(page).toHaveURL("/routes");
  });

  /* pinned finding: saving a route is linked to an account page that does not exist yet */
  test("has no account page to save a route to yet", async ({ page }) => {
    await page.goto("/planning");

    await page.getByRole("link", { name: "Route opslaan" }).click();

    await expect(page).toHaveURL(LOGIN_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Deze pagina bestaat niet",
    );
  });
});
