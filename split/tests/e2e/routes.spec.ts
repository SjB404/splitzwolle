import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import {
  HOME_PATH,
  INITIAL_ROUTE_FILTERS,
  PLANNING_PATH,
  POINTS_OF_INTEREST,
  ROUTES,
  ROUTES_PATH,
  ROUTE_PAGE_SIZE,
  builderPath,
  filterRoutes,
  pointsInArea,
  publicRoutePath,
  routePoints,
} from "./app";
import type { Route, RouteFilterState } from "./app";

const AREA_POINTS = pointsInArea(POINTS_OF_INTEREST);

/* every card carries one link to its own page, so that link is what a card looks like here */
const PREFIX = "Open de route ";

const cardTitles = (page: Page) =>
  page.getByRole("link", { name: new RegExp(`^${PREFIX}`) }).evaluateAll(
    /* the callback runs in the browser, so the prefix is handed over rather than closed over */
    (links, prefix) =>
      links.map((link) =>
        (link.getAttribute("aria-label") ?? "").replace(prefix, ""),
      ),
    PREFIX,
  );

const idFor = (title: string) =>
  ROUTES.find((route) => route.title === title)!.id;
const idsOf = (routes: Route[]) => routes.map((route) => route.id).sort();

test.describe("the route builder", { tag: "@builder" }, () => {
  test("asks for two places before it draws anything", async ({ page }) => {
    await page.goto(ROUTES_PATH);

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
    await page.goto(ROUTES_PATH);

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
    await page.goto(ROUTES_PATH);

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
    await page.goto(ROUTES_PATH);

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
    await page.goto(ROUTES_PATH);

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
    await page.goto(ROUTES_PATH);

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
    await page.goto(builderPath([first.id, second.id]));

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
    await page.goto(builderPath(["kayakverhuur"]));

    await expect(
      page.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeVisible();
  });

  test("hands the built route to Google Maps with the places in order", async ({
    page,
  }) => {
    const [first, second] = AREA_POINTS;
    await page.goto(builderPath([first.id, second.id]));

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

  test("shares the route by copying its own url", async ({ page }) => {
    const [first, second] = AREA_POINTS;
    const path = builderPath([first.id, second.id]);

    await page
      .context()
      .grantPermissions(["clipboard-read", "clipboard-write"]);
    await page.goto(path);

    await page.getByRole("button", { name: "Deel deze route" }).click();

    await expect(page.getByText(/Link gekopieerd/)).toBeVisible();

    const copied = await page.evaluate(() => navigator.clipboard.readText());

    expect(copied).toBe(new URL(path, page.url()).href);
  });

  test("waits for a second place before it will share anything", async ({
    page,
  }) => {
    await page.goto(ROUTES_PATH);

    await expect(
      page.getByRole("button", { name: "Deel deze route" }),
    ).toBeDisabled();
  });

  test("sends the old planning url to the builder", async ({ page }) => {
    await page.goto(PLANNING_PATH);

    await expect(page).toHaveURL(ROUTES_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /Stel je route samen/,
    );
  });
});

test.describe("the ready-made routes", { tag: "@list" }, () => {
  test("shows a page of them with a way to see the rest", async ({ page }) => {
    await page.goto(ROUTES_PATH);

    const expected = Math.min(ROUTES.length, ROUTE_PAGE_SIZE);

    await expect(
      page.getByRole("link", { name: new RegExp(`^${PREFIX}`) }),
    ).toHaveCount(expected);
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

    await page.goto(ROUTES_PATH);
    await page.getByRole("button", { name: "Toon meer routes" }).click();

    await expect(
      page.getByRole("link", { name: new RegExp(`^${PREFIX}`) }),
    ).toHaveCount(ROUTES.length);
    await expect(
      page.getByRole("button", { name: "Toon meer routes" }),
    ).toHaveCount(0);
  });

  test("renders what the filter module says, for every facet and every option", async ({
    page,
  }) => {
    await page.goto(ROUTES_PATH);

    const facets: [string, keyof RouteFilterState][] = [
      ["Populariteit", "popularity"],
      ["Afstand", "distance"],
      ["Type route", "theme"],
      ["Moeilijkheid", "difficulty"],
      ["Van wie", "ownership"],
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
        const visible = idsOf(matching.slice(0, ROUTE_PAGE_SIZE));

        await expect
          .poll(async () => (await cardTitles(page)).map(idFor).sort(), {
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
    await page.goto(ROUTES_PATH);
    const search = page.getByRole("searchbox", {
      name: "Zoek op titel, wijk of thema",
    });

    await search.fill(route.title);
    await expect
      .poll(async () => (await cardTitles(page)).map(idFor).sort())
      .toEqual([route.id]);

    await search.fill(route.area);
    const byArea = idsOf(
      filterRoutes({ ...INITIAL_ROUTE_FILTERS, query: route.area }),
    );
    await expect
      .poll(async () => (await cardTitles(page)).map(idFor).sort())
      .toEqual(byArea);

    await search.fill("kayakverhuur");
    await expect(
      page.getByRole("heading", { level: 2, name: "Geen routes gevonden" }),
    ).toBeVisible();
  });

  test("keeps the filters beside the search box", async ({ page }) => {
    await page.goto(ROUTES_PATH);

    const region = page.getByRole("search", {
      name: "Routes zoeken en filteren",
    });

    await expect(region.getByRole("searchbox")).toBeVisible();
    await expect(region.getByRole("combobox")).toHaveCount(5);
    await expect(
      region.getByText(`${ROUTES.length} routes gevonden`),
    ).toBeVisible();
  });

  test("clears every filter at once", async ({ page }) => {
    await page.goto(ROUTES_PATH);

    await page.getByLabel("Moeilijkheid").selectOption("Gemiddeld");

    const filtered = filterRoutes({
      ...INITIAL_ROUTE_FILTERS,
      difficulty: "Gemiddeld",
    });
    await expect
      .poll(async () => (await cardTitles(page)).map(idFor).sort())
      .toEqual(idsOf(filtered));

    await page.getByRole("button", { name: "Filters wissen" }).click();

    await expect
      .poll(async () => (await cardTitles(page)).map(idFor).sort())
      .toEqual(
        idsOf(filterRoutes(INITIAL_ROUTE_FILTERS).slice(0, ROUTE_PAGE_SIZE)),
      );
    await expect(
      page.getByRole("button", { name: "Filters wissen" }),
    ).toHaveCount(0);
  });
});

test.describe("a route's card", { tag: "@list" }, () => {
  test("loads its places into the builder when its title is clicked", async ({
    page,
  }) => {
    const route = ROUTES[0];
    const places = routePoints(route);

    await page.goto(ROUTES_PATH);
    await page.getByRole("button", { name: route.title, exact: true }).click();

    await expect(
      page.getByRole("heading", {
        level: 3,
        name: `${places.length} stopplaatsen, lopen`,
      }),
    ).toBeVisible();
    await expect(
      page.getByText(`${places.length} van ${AREA_POINTS.length} plekken`),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: `1. ${places[0].name}` }),
    ).toBeVisible();
    /* the url follows, so the built route can be handed to someone else */
    await expect(page).toHaveURL(builderPath(route.poiIds));
  });

  test("opens the route in the builder, under its own title", async ({
    page,
    errors,
  }) => {
    const route = ROUTES[0];

    await page.goto(ROUTES_PATH);
    await page.getByRole("link", { name: `${PREFIX}${route.title}` }).click();

    await expect(page).toHaveURL(publicRoutePath(route.id));
    await expect(
      page.getByRole("heading", { level: 1, name: route.title }),
    ).toBeVisible();
    await expect(page.getByRole("link", { name: "Alle routes" })).toBeVisible();
    /* the route's own places are in the builder, so the map and the summary already agree */
    await expect(
      page.getByText(
        `${route.poiIds.length} van ${AREA_POINTS.length} plekken`,
      ),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("folds the reviews out under the map, and back in again", async ({
    page,
  }) => {
    const route = ROUTES[0];

    await page.goto(publicRoutePath(route.id));

    const toggle = page.getByRole("button", { name: /Reviews bekijken/ });

    await expect(toggle).toHaveAttribute("aria-expanded", "false");
    await expect(
      page.getByRole("heading", { name: `Reviews (${route.reviews})` }),
    ).toHaveCount(0);

    await toggle.click();

    await expect(
      page.getByRole("heading", { name: `Reviews (${route.reviews})` }),
    ).toBeVisible();
    await expect(
      page.getByRole("heading", { level: 3, name: "Schrijf een review" }),
    ).toBeVisible();

    await page.getByRole("button", { name: /Reviews verbergen/ }).click();

    await expect(
      page.getByRole("heading", { name: `Reviews (${route.reviews})` }),
    ).toHaveCount(0);
  });

  test("answers a route id that does not exist with the catch-all page", async ({
    page,
  }) => {
    await page.goto(publicRoutePath("niet-bestaand"));

    await expect(
      page.getByRole("heading", { level: 1, name: "Route niet gevonden" }),
    ).toBeVisible();
  });

  test("leaves the detail page reachable from the home preview", async ({
    page,
  }) => {
    await page.goto(HOME_PATH);

    await page
      .getByRole("link", { name: ROUTES[0].title, exact: true })
      .click();

    await expect(page).toHaveURL(publicRoutePath(ROUTES[0].id));
  });
});
