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

/* the true brand seeds, the fill of a chip that is on: deltion orange in light mode, deltion blue in dark
   (index.css `--selected`, DESIGN.md §3) */
const SELECTED_LIGHT = "rgb(246, 130, 33)";
const SELECTED_DARK = "rgb(40, 44, 109)";

/* the flash paints the same seeds on the card's edge and keeps the colour while its alpha fades, so the
   seed's own numbers are what to match, not a full-alpha value */
const flashSeed = (seed: string) =>
  new RegExp(`^rgba?\\(${seed.replace(/^rgb\(|\)$/g, "")}`);

/* the bare utility token, never a `motion-safe:` variant — the flash is colour-only feedback and must run
   for reduced-motion readers too (DESIGN.md §11) */
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

  /* a chip that is on fills with the brand seed itself, never a tint of it: a tint reads as a hover, and
     this is the one control on the page a reader has to be able to spot from across the room. The two
     values are `--selected` (DESIGN.md §3, §16) — orange under white in light mode, blue under white in
     dark — read as computed colour so a recipe that drifts back to a container tone fails here */
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

  test("opens a place's own card from its tile on the home page", async ({
    page,
    errors,
  }) => {
    const place = POINTS_OF_INTEREST[0];

    await page.goto(HOME_PATH);
    await page.locator(`a[href="${pointOfInterestPath(place.id)}"]`).click();

    await expect(page).toHaveURL(pointOfInterestPath(place.id));

    const card = cardOf(page, place.name);

    /* the landing is that place, chosen: the card is the marked one, the map calls it out, and it is
       the card the reader sees rather than the top of the page */
    await expect(
      card.getByRole("button", { name: "Op de kaart" }),
    ).toHaveAttribute("aria-pressed", "true");
    await expect(chipWith(page, place.name)).toBeVisible();
    await expect(card).toBeInViewport();

    /* the landing lights its own edge instead of wearing the tone the page's background already has,
       and it is the only card that does */
    await expect(card).toHaveClass(FLASH_CLASS);
    await expect(card).not.toHaveClass(/secondary-container/);
    await expect(page.locator(".animate-flash")).toHaveCount(1);

    expect(errors).toEqual([]);

    /* and a pick made on the page keeps the reader where they were, rather than jumping them to the top */
    const before = await page.evaluate(() => window.scrollY);

    await cardOf(page, POINTS_OF_INTEREST[1].name)
      .getByRole("button", { name: "Toon op kaart" })
      .click();

    await expect
      .poll(async () => Math.abs((await page.evaluate(() => window.scrollY)) - before))
      .toBeLessThan(40);

    /* and the landing is a card like any other once the reader picks: the pick wears the tone */
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
    /* the flash starts with the card and is over after 2s, so the edge is read as soon as the card is
       there — which is why the wait is for the commit, not for the load */
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
    /* colour-only feedback, so the preference has nothing to switch off: the outline is read hot rather
       than the animation inspected, because the reduced-motion block collapses durations, not names */
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
