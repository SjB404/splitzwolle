import { expect, test, horizontalOverflow } from "./fixtures";
import { ALL_PATHS, STATIC_PAGES } from "./app";

const WIDTHS = [320, 390, 768, 1024, 1440, 1920];

test.describe("the layout never scrolls sideways", { tag: "@layout" }, () => {
  /* every url the app serves, so a new route or page is covered without a test edit */
  for (const width of WIDTHS) {
    test(`at ${width}px`, async ({ page }) => {
      await page.setViewportSize({ width, height: 900 });

      for (const path of ALL_PATHS) {
        await page.goto(path);

        expect(
          await horizontalOverflow(page),
          `${path} overflows at ${width}px`,
        ).toBeLessThanOrEqual(0);
      }
    });
  }

  test("in the dark palette too", async ({ page }) => {
    const paths = [
      ...STATIC_PAGES.map((page_) => page_.path),
      ALL_PATHS.at(-1)!,
    ];

    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/");
    await page
      .getByRole("button", { name: "Schakel naar donker thema" })
      .click();

    for (const path of paths) {
      await page.goto(path);

      expect(
        await horizontalOverflow(page),
        `${path} overflows in dark mode`,
      ).toBeLessThanOrEqual(0);
      await expect(page.locator("body")).toHaveClass(/\bdark\b/);
    }
  });
});

test.describe(
  "the shell reaches the end of the page",
  { tag: "@layout" },
  () => {
    test("the footer sits below the content, not over it", async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto("/");

      const footer = page.locator("footer#contact");
      await footer.scrollIntoViewIfNeeded();

      await expect(footer).toBeInViewport();

      const overlaps = await page.evaluate(() => {
        const foot = document
          .querySelector("footer#contact")!
          .getBoundingClientRect();
        const main = document.querySelector("main")!.getBoundingClientRect();

        return main.bottom - foot.top;
      });

      expect(overlaps).toBeLessThanOrEqual(1);
    });

    test("no element carries a shadow", async ({ page }) => {
      await page.goto("/routes");

      const shadows = await page.evaluate(
        () =>
          [...document.querySelectorAll("*")].filter(
            (element) => getComputedStyle(element).boxShadow !== "none",
          ).length,
      );

      expect(shadows).toBe(0);
    });
  },
);
