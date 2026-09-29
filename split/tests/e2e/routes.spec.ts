import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import {
  INITIAL_ROUTE_FILTERS,
  POINTS_OF_INTEREST,
  ROUTES,
  ROUTE_PAGE_SIZE,
  filterRoutes,
  pointsInArea,
} from "./app";
import type { RouteFilterState } from "./app";

/* the card titles are the only links of the shape /routes/<id> on this screen */
const cards = (page: Page) => page.locator('a[href^="/routes/"]');
const cardHrefs = (page: Page) =>
  cards(page).evaluateAll((els) => els.map((el) => el.getAttribute("href")!));

const AREA_POINTS = pointsInArea(POINTS_OF_INTEREST);

test.describe("the route builder", { tag: "@builder" }, () => {
  test("asks for two places before it draws anything", async ({ page }) => {
    await page.goto("/routes");

    await expect(
      page.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeVisible();
    await expect(
      page.getByText(`${AREA_POINTS.length} plekken in de binnenstad`),
    ).toBeVisible();
  });

  test("offers every place in the covered area, and both ways of travelling", async ({
    page,
  }) => {
    await page.goto("/routes");

    for (const point of AREA_POINTS) {
      const chip = page.getByRole("button", { name: point.name, exact: true });

      await expect.soft(chip).toBeVisible();
      await expect.soft(chip).toHaveAttribute("aria-pressed", "false");
    }

    for (const mode of ["Lopen", "Fietsen"]) {
      await expect.soft(page.getByRole("button", { name: mode })).toBeVisible();
    }
  });

  test("groups the places by the era they belong to", async ({ page }) => {
    await page.goto("/routes");

    for (const era of ["Toen", "Nu"]) {
      await expect
        .soft(
          page.getByRole("heading", {
            level: 3,
            name: new RegExp(`Plekken van ${era.toLowerCase()}`),
          }),
        )
        .toBeVisible();
    }
  });

  test("builds a route out of two places and numbers them", async ({
    page,
    errors,
  }) => {
    const [first, second] = AREA_POINTS;
    await page.goto("/routes");

    await page.getByRole("button", { name: first.name, exact: true }).click();
    await expect(
      page.getByText(`1 van ${AREA_POINTS.length} plekken`),
    ).toBeVisible();
    await expect(
      page.getByText(
        "Kies nog een plek: een route heeft minstens twee stopplaatsen.",
      ),
    ).toBeVisible();

    await page.getByRole("button", { name: second.name, exact: true }).click();

    await expect(
      page.getByRole("heading", { level: 3, name: "2 stopplaatsen, lopen" }),
    ).toBeVisible();
    await expect(
      page.getByText(`2 van ${AREA_POINTS.length} plekken`),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `1. ${first.name}` }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(
      page.getByRole("button", { name: `2. ${second.name}` }),
    ).toBeVisible();
    await expect(page.getByText(/Hemelsbreed geschat/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open in Google Maps" }),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("switches the way of travelling", async ({ page }) => {
    const [first, second] = AREA_POINTS;
    await page.goto("/routes");

    await page.getByRole("button", { name: first.name, exact: true }).click();
    await page.getByRole("button", { name: second.name, exact: true }).click();
    await page.getByRole("button", { name: "Fietsen" }).click();

    await expect(
      page.getByRole("heading", { level: 3, name: "2 stopplaatsen, fietsen" }),
    ).toBeVisible();
    await expect(page.getByRole("button", { name: "Fietsen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    await expect(
      page.getByRole("link", { name: "Open in Google Maps" }),
    ).toHaveAttribute("href", /travelmode=bicycling/);
  });

  test("clears the selection again", async ({ page }) => {
    const [first, second] = AREA_POINTS;
    await page.goto("/routes");

    await page.getByRole("button", { name: first.name, exact: true }).click();
    await page.getByRole("button", { name: second.name, exact: true }).click();
    await page.getByRole("button", { name: "Selectie wissen" }).first().click();

    await expect(
      page.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeVisible();
    await expect(
      page.getByText(`${AREA_POINTS.length} plekken in de binnenstad`),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: "Selectie wissen" }),
    ).toHaveCount(0);
  });

  test("takes the places a url hands over", async ({ page }) => {
    const [first, second] = AREA_POINTS;
    await page.goto(`/routes?plek=${first.id}&plek=${second.id}`);

    await expect(
      page.getByText(`2 van ${AREA_POINTS.length} plekken`),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `1. ${first.name}` }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `2. ${second.name}` }),
    ).toBeVisible();
  });

  test("ignores a place in the url that does not exist", async ({ page }) => {
    await page.goto("/routes?plek=kayakverhuur");

    await expect(
      page.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeVisible();
  });
});

test.describe("the ready-made routes", { tag: "@list" }, () => {
  test("shows a page of them with a way to see the rest", async ({ page }) => {
    await page.goto("/routes");

    const expected = Math.min(ROUTES.length, ROUTE_PAGE_SIZE);

    await expect(cards(page)).toHaveCount(expected);
    await expect(
      page.getByText(`${expected} van ${ROUTES.length} routes`),
    ).toBeVisible();

    if (ROUTES.length > ROUTE_PAGE_SIZE) {
      await expect(
        page.getByRole("button", { name: "Toon meer routes" }),
      ).toBeVisible();
    }
  });

  test("shows them all on demand", async ({ page }) => {
    test.skip(
      ROUTES.length <= ROUTE_PAGE_SIZE,
      "the list fits on one page already",
    );

    await page.goto("/routes");
    await page.getByRole("button", { name: "Toon meer routes" }).click();

    await expect(cards(page)).toHaveCount(ROUTES.length);
    await expect(
      page.getByRole("button", { name: "Toon meer routes" }),
    ).toHaveCount(0);
  });

  test("renders what the filter module says, for every facet and every option", async ({
    page,
  }) => {
    await page.goto("/routes");

    const facets: [string, keyof RouteFilterState][] = [
      ["Populariteit", "popularity"],
      ["Afstand", "distance"],
      ["Type route", "theme"],
      ["Moeilijkheid", "difficulty"],
    ];

    for (const [label, key] of facets) {
      const select = page.getByLabel(label);
      /* the options come from the page, so a new theme or bucket is covered without a test edit */
      const values = await select
        .locator("option")
        .evaluateAll((options) =>
          options.map((option) => (option as HTMLOptionElement).value),
        );

      expect.soft(values.length).toBeGreaterThan(1);

      for (const value of values) {
        await select.selectOption(value);

        const patch = {
          ...INITIAL_ROUTE_FILTERS,
          [key]: value,
        } as RouteFilterState;
        const matching = filterRoutes(patch);
        /* the list is not expanded here, so a page of results is what the screen shows */
        const visible = matching
          .slice(0, ROUTE_PAGE_SIZE)
          .map((route) => `/routes/${route.id}`)
          .sort();

        await expect
          .poll(async () => (await cardHrefs(page)).sort(), {
            message: `${label} = ${value}`,
          })
          .toEqual(visible);
        /* the live count reports every match, not the page of them that is on screen */
        await expect
          .soft(page.getByText(new RegExp(`^${matching.length} route`)))
          .toBeVisible();
      }

      await select.selectOption("all");
    }
  });

  test("searches titles, areas, themes and the places a route visits", async ({
    page,
  }) => {
    const route = ROUTES[0];
    await page.goto("/routes");
    const search = page.getByRole("searchbox", {
      name: "Zoek op titel, wijk of thema",
    });

    await search.fill(route.title);
    await expect
      .poll(async () => (await cardHrefs(page)).sort())
      .toEqual([`/routes/${route.id}`]);

    await search.fill(route.area);
    const byArea = filterRoutes({ ...INITIAL_ROUTE_FILTERS, query: route.area })
      .map((candidate) => `/routes/${candidate.id}`)
      .sort();
    await expect
      .poll(async () => (await cardHrefs(page)).sort())
      .toEqual(byArea);

    await search.fill("kayakverhuur");
    await expect(
      page.getByRole("heading", { level: 2, name: "Geen routes gevonden" }),
    ).toBeVisible();
  });

  test("clears every filter at once", async ({ page }) => {
    await page.goto("/routes");

    await page.getByLabel("Moeilijkheid").selectOption("Gemiddeld");

    const filtered = filterRoutes({
      ...INITIAL_ROUTE_FILTERS,
      difficulty: "Gemiddeld",
    });
    await expect
      .poll(async () => (await cardHrefs(page)).sort())
      .toEqual(filtered.map((route) => `/routes/${route.id}`).sort());

    await page.getByRole("button", { name: "Filters wissen" }).click();

    await expect
      .poll(async () => (await cardHrefs(page)).sort())
      .toEqual(
        filterRoutes(INITIAL_ROUTE_FILTERS)
          .slice(0, ROUTE_PAGE_SIZE)
          .map((route) => `/routes/${route.id}`)
          .sort(),
      );
    await expect(
      page.getByRole("button", { name: "Filters wissen" }),
    ).toHaveCount(0);
  });

  test("opens a route's own page from its card", async ({ page }) => {
    const route = ROUTES[0];
    await page.goto("/routes");

    await page.getByRole("link", { name: route.title, exact: true }).click();

    await expect(page).toHaveURL(`/routes/${route.id}`);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      route.title,
    );
  });

  test("hands the built route to Google Maps with the places in order", async ({
    page,
  }) => {
    const [first, second] = AREA_POINTS;
    await page.goto(`/routes?plek=${first.id}&plek=${second.id}`);

    const link = page.getByRole("link", { name: "Open in Google Maps" });

    await expect(link).toHaveAttribute(
      "href",
      new RegExp(`origin=${first.coordinates.lat},${first.coordinates.lng}`),
    );
    await expect(link).toHaveAttribute(
      "href",
      new RegExp(
        `destination=${second.coordinates.lat},${second.coordinates.lng}`,
      ),
    );
  });
});
