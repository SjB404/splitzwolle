import { expect, test } from "./fixtures";
import type { Page } from "@playwright/test";
import {
  CATEGORIES,
  CUSTOM_ROUTE_PATH,
  INITIAL_POI_FILTERS,
  POINTS_OF_INTEREST,
  filterPointsOfInterest,
} from "./app";

const placeLinks = (page: Page) =>
  page.locator(`a[href^="${CUSTOM_ROUTE_PATH}/"]`);
/* the map's corner chip is the only chip that carries one place's own name */
const chipWith = (page: Page, text: string | RegExp) =>
  page.locator(".chip").filter({ hasText: text });
/* one card, found by the heading it carries rather than by any word in its body */
const cardOf = (page: Page, name: string) =>
  page.locator("article").filter({
    has: page.getByRole("heading", { level: 3, name, exact: true }),
  });

const countLabel = (count: number) =>
  new RegExp(`^${count} bezienswaardig(heid|heden)$`);

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
    /* a category the place does not belong to, so filtering it away is a real change */
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
