import { expect, test, horizontalOverflow } from "./fixtures";
import { MAP_PATHS, PAGES, UNKNOWN_PATH } from "./app";

test.describe("every page", { tag: "@smoke" }, () => {
  for (const { path, title, heading } of PAGES) {
    test(`${path} answers, heads itself and stays quiet`, async ({
      page,
      errors,
    }) => {
      const response = await page.goto(path);

      expect(response?.status()).toBe(200);
      await expect(page).toHaveTitle(title);
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      await expect(page.getByRole("heading", { level: 1 })).toHaveText(heading);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.locator("footer#contact")).toHaveCount(1);
      await expect(page.getByRole("banner")).toHaveCount(1);

      expect(errors).toEqual([]);
    });
  }

  test("the catch-all page keeps the shell in charge", async ({ page }) => {
    await page.goto(UNKNOWN_PATH);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      /bestaat niet/,
    );
  });
});

test.describe("the maps", { tag: "@smoke" }, () => {
  for (const path of MAP_PATHS) {
    test(`${path} falls back to its own panel instead of a broken map`, async ({
      page,
      errors,
    }) => {
      await page.goto(path);

      await expect(
        page.getByText(/De kaart kon niet geladen worden/).first(),
      ).toBeVisible();
      /* google never built any of its own dom */
      await expect(page.locator('[class*="gm-style"]')).toHaveCount(0);

      expect(errors).toEqual([]);
    });
  }

  test("the builder still computes a route without the map api", async ({
    page,
  }) => {
    await page.goto("/routes");

    await page.getByRole("button", { name: "De Peperbus" }).click();
    await page.getByRole("button", { name: "Sassenpoort" }).click();

    await expect(
      page.getByRole("heading", { level: 3, name: "2 stopplaatsen, lopen" }),
    ).toBeVisible();
    await expect(page.getByText(/Hemelsbreed geschat/)).toBeVisible();
    await expect(
      page.getByRole("link", { name: "Open in Google Maps" }),
    ).toHaveAttribute("href", /google\.com\/maps\/dir/);
  });
});

test.describe("the shell", { tag: "@smoke" }, () => {
  test("shows the brand, the theme switch and the footer's contact band", async ({
    page,
  }) => {
    await page.goto("/");

    const banner = page.getByRole("banner");

    await expect(
      banner.getByRole("link", { name: "Zwolle Routes" }),
    ).toBeVisible();
    await expect(
      page.getByRole("button", { name: /Schakel naar/ }),
    ).toBeVisible();
    await expect(page.locator("footer#contact")).toContainText(
      "info@zwolleroutes.nl",
    );
    await expect(page.locator("footer#contact")).toContainText(
      "Grote Markt 20",
    );
  });

  test("shows the brand's own assets, none of them broken", async ({
    page,
  }) => {
    await page.goto("/");

    await expect(page.locator("img").first()).toBeVisible();

    const broken = await page.evaluate(
      () =>
        [...document.images].filter(
          (image) => image.complete && image.naturalWidth === 0,
        ).length,
    );
    expect(broken).toBe(0);
  });

  test("never scrolls sideways on the way in", async ({ page }) => {
    await page.goto("/");

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
