import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import {
  CATEGORIES,
  CUSTOM_ROUTE_PATH,
  HOME_PATH,
  INITIAL_POI_FILTERS,
  POINTS_OF_INTEREST,
  filterPointsOfInterest,
  pointOfInterestPath,
} from "./app";

const placeLinks = (page: Page) =>
  page.locator(`a[href^="${CUSTOM_ROUTE_PATH}/"]`);
const chipWith = (page: Page, text: string | RegExp) =>
  page.locator(".chip").filter({ hasText: text });
const cardOf = (page: Page, name: string) =>
  page.locator("article").filter({
    has: page.getByRole("heading", { level: 3, name, exact: true }),
  });

const countLabel = (count: number) =>
  new RegExp(`^${count} bezienswaardig(heid|heden)$`);

/* the --selected token as computed rgb: orange in light, blue in dark */
const SELECTED_LIGHT = "rgb(246, 130, 33)";
const SELECTED_DARK = "rgb(40, 44, 109)";

/* the flash keeps the seed colour while its alpha fades, so match the seed's numbers */
const flashSeed = (seed: string) =>
  new RegExp(`^rgba?\\(${seed.replace(/^rgb\(|\)$/g, "")}`);

/* bare animate-flash token, not a motion-safe variant: reduced motion keeps the flash */
const FLASH_CLASS = /(^|\s)animate-flash(\s|$)/;

test.describe("the places overview", { tag: "@poi" }, () => {
  test("lists every place with a count and a chart", async ({
    page,
    errors,
  }) => {
    await page.goto("/points-of-interest");

    await expect(placeLinks(page)).toHaveCount(POINTS_OF_INTEREST.length);
    await expect(
      page.getByText(countLabel(POINTS_OF_INTEREST.length)),
    ).toBeVisible();
    await expect(chipWith(page, "Alle bezienswaardigheden")).toBeVisible();
    await expect(
      page.getByText(/De kaart kon niet geladen worden/).first(),
    ).toBeVisible();

    expect(errors).toEqual([]);
  });

  test("narrows the list with every category chip", async ({ page }) => {
    await page.goto("/points-of-interest");

    await expect(page.getByRole("button", { name: "Alles" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );

    for (const category of CATEGORIES) {
      const expected = filterPointsOfInterest({
        ...INITIAL_POI_FILTERS,
        category: category.id,
      });

      await page
        .getByRole("button", { name: category.id, exact: true })
        .click();

      await expect
        .soft(page.getByRole("button", { name: category.id, exact: true }))
        .toHaveAttribute("aria-pressed", "true");
      await expect
        .soft(page.getByText(countLabel(expected.length)))
        .toBeVisible();
      await expect.soft(placeLinks(page)).toHaveCount(expected.length);
    }
  });

  /* computed colour, so a chip drifting back to a container tint fails here */
  test("fills a selected chip with the brand seed, in both themes", async ({
    page,
  }) => {
    await page.goto("/points-of-interest");

    const chip = page.getByRole("button", { name: "Alles", exact: true });

    await expect(chip).toHaveCSS("background-color", SELECTED_LIGHT);
    await expect(chip).toHaveCSS("color", "rgb(255, 255, 255)");

    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();

    await expect(chip).toHaveCSS("background-color", SELECTED_DARK);
    await expect(chip).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("searches on name, area and category", async ({ page }) => {
    const example = POINTS_OF_INTEREST[0];
    await page.goto("/points-of-interest");
    const search = page.getByRole("searchbox", {
      name: "Zoek op naam, wijk of categorie",
    });

    for (const needle of [example.name, example.area, example.category]) {
      const expected = filterPointsOfInterest({
        ...INITIAL_POI_FILTERS,
        query: needle,
      });

      await search.fill(needle);

      await expect
        .soft(page.getByText(countLabel(expected.length)))
        .toBeVisible();
      await expect.soft(placeLinks(page)).toHaveCount(expected.length);
    }

    await search.fill("kayakverhuur");
    await expect(
      page.getByRole("heading", { level: 3, name: "Niets gevonden" }),
    ).toBeVisible();
  });

  test("sorts by rating, name and distance", async ({ page }) => {
    await page.goto("/points-of-interest");
    const sort = page.getByLabel("Sorteer op");
    const names = () =>
      page.getByRole("heading", { level: 3 }).allTextContents();

    for (const value of ["rating", "name", "distance"] as const) {
      const expected = filterPointsOfInterest({
        ...INITIAL_POI_FILTERS,
        sort: value,
      }).map((point) => point.name);

      await sort.selectOption(value);

      await expect.poll(names).toEqual(expected);
    }
  });

  test("puts the place you pick on the map", async ({ page }) => {
    const place = POINTS_OF_INTEREST[0];
    await page.goto("/points-of-interest");

    const card = cardOf(page, place.name);
    await card.getByRole("button", { name: "Toon op kaart" }).click();

    await expect(
      card.getByRole("button", { name: "Op de kaart" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(chipWith(page, place.name)).toBeVisible();
  });

  test("takes the highlight away when the place is filtered out", async ({
    page,
  }) => {
    const place = POINTS_OF_INTEREST[0];
    const other = CATEGORIES.find(
      (category) => category.id !== place.category,
    )!;

    await page.goto("/points-of-interest");

    await cardOf(page, place.name)
      .getByRole("button", { name: "Toon op kaart" })
      .click();
    await page.getByRole("button", { name: other.id, exact: true }).click();

    await expect(chipWith(page, "Alle bezienswaardigheden")).toBeVisible();
    await expect(page.getByRole("button", { name: "Op de kaart" })).toHaveCount(
      0,
    );
  });

  test("clears the filters", async ({ page }) => {
    const category = CATEGORIES.at(-1)!;
    await page.goto("/points-of-interest");

    await page.getByRole("button", { name: category.id, exact: true }).click();
    await expect(placeLinks(page)).toHaveCount(
      filterPointsOfInterest({ ...INITIAL_POI_FILTERS, category: category.id })
        .length,
    );

    await page.getByRole("button", { name: "Filters wissen" }).click();

    await expect(placeLinks(page)).toHaveCount(POINTS_OF_INTEREST.length);
    await expect(
      page.getByRole("button", { name: "Filters wissen" }),
    ).toHaveCount(0);
  });

  test("opens a place's own card from its tile on the home page", async ({
    page,
    errors,
  }) => {
    const place = POINTS_OF_INTEREST[0];

    await page.goto(HOME_PATH);
    await page.locator(`a[href="${pointOfInterestPath(place.id)}"]`).click();

    await expect(page).toHaveURL(pointOfInterestPath(place.id));

    const card = cardOf(page, place.name);

    await expect(
      card.getByRole("button", { name: "Op de kaart" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(chipWith(page, place.name)).toBeVisible();
    await expect(card).toBeInViewport();

    /* only the landing card wears the flash, not the secondary-container tone */
    await expect(card).toHaveClass(FLASH_CLASS);
    await expect(card).not.toHaveClass(/secondary-container/);
    await expect(page.locator(".animate-flash")).toHaveCount(1);

    expect(errors).toEqual([]);

    const before = await page.evaluate(() => window.scrollY);

    await cardOf(page, POINTS_OF_INTEREST[1].name)
      .getByRole("button", { name: "Toon op kaart" })
      .click();

    await expect
      .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - before))
      .toBeLessThan(40);

    await expect(card).not.toHaveClass(FLASH_CLASS);
    await expect(cardOf(page, POINTS_OF_INTEREST[1].name)).toHaveClass(
      /secondary-container/,
    );
  });

  test("flashes the card a url names in the theme's brand colour", async ({
    page,
  }) => {
    const place = POINTS_OF_INTEREST[0];
    const url = pointOfInterestPath(place.id);
    /* the flash starts on commit and is over in 2s, so wait for the commit, not the load */
    const outlineOf = () =>
      cardOf(page, place.name).evaluate(
        (el) => getComputedStyle(el).outlineColor,
      );

    await page.goto(url, { waitUntil: "commit" });
    await expect.poll(outlineOf).toMatch(flashSeed(SELECTED_LIGHT));

    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();
    await page.goto(url, { waitUntil: "commit" });

    await expect.poll(outlineOf).toMatch(flashSeed(SELECTED_DARK));
  });

  test("flashes the card a url names even under reduced motion", async ({
    page,
  }) => {
    const place = POINTS_OF_INTEREST[0];
    /* reduced motion collapses durations, not names, so the outline is read, not the animation */
    const outlineOf = () =>
      cardOf(page, place.name).evaluate(
        (el) => getComputedStyle(el).outlineColor,
      );

    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(pointOfInterestPath(place.id), { waitUntil: "commit" });

    await expect.poll(outlineOf).toMatch(flashSeed(SELECTED_LIGHT));
  });

  test("hands a place to the route builder", async ({ page }) => {
    const place = POINTS_OF_INTEREST[0];
    await page.goto("/points-of-interest");

    await page
      .locator("article")
      .filter({
        has: page.getByRole("heading", {
          level: 3,
          name: place.name,
          exact: true,
        }),
      })
      .getByRole("link", { name: "In een route" })
      .click();

    await expect(page).toHaveURL(
      new RegExp(`${CUSTOM_ROUTE_PATH}/${place.id}`),
    );
    await expect(
      page.getByRole("button", { name: `1. ${place.name}` }),
    ).toBeVisible();
  });
});
