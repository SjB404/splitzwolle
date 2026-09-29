import { expect, test } from "./fixtures";

test.describe("the theme switch", () => {
  test("starts light in a fresh browser", async ({ page }) => {
    await page.goto("/");

    await expect(page.locator("body")).toHaveClass(/\blight\b/);
    await expect(
      page.getByRole("button", { name: "Schakel naar donker thema" }),
    ).toHaveAttribute("aria-pressed", "false");
  });

  test("flips the palette and says what it will do next", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();

    await expect(page.locator("body")).toHaveClass(/\bdark\b/);
    const back = page.getByRole("button", { name: "Schakel naar licht thema" });
    await expect(back).toHaveAttribute("aria-pressed", "true");

    await back.click();

    await expect(page.locator("body")).toHaveClass(/\blight\b/);
  });

  test("remembers the choice across a reload, before the first paint", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();

    expect(
      await page.evaluate(() => localStorage.getItem("zwolle-routes:theme")),
    ).toBe("dark");

    await page.reload({ waitUntil: "domcontentloaded" });

    /* index.html's own script writes the class during the parse, so the dark palette is there before anything is painted */
    expect(await page.evaluate(() => document.body.className)).toContain(
      "dark",
    );
    await expect(
      page.getByRole("button", { name: "Schakel naar licht thema" }),
    ).toBeVisible();
  });

  test("keeps the choice while the reader moves around the site", async ({
    page,
  }) => {
    await page.goto("/");
    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Points of Interest", exact: true })
      .click();

    await expect(page).toHaveURL("/points-of-interest");
    await expect(page.locator("body")).toHaveClass(/\bdark\b/);
  });

  test("paints the dark palette on the page the reader is on, not just the body class", async ({
    page,
  }) => {
    await page.goto("/");
    const lightBackground = await page.evaluate(
      () => getComputedStyle(document.body).backgroundColor,
    );

    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();

    const darkBackground = await page.evaluate(() => {
      /* transitions freeze mid flight in a throttled tab, so they are switched off before the colour is read */
      const style = document.createElement("style");
      style.textContent =
        "*{transition:none!important;animation:none!important}";
      document.head.append(style);

      return getComputedStyle(document.body).backgroundColor;
    });

    expect(darkBackground).not.toBe(lightBackground);
  });
});
