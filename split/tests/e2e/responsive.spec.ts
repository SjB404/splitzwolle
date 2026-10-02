import { expect, test, horizontalOverflow } from "./fixtures";
import { ALL_PATHS, HOME_PATH, ROUTES_PATH, STATIC_PAGES } from "./app";

const WIDTHS = [320, 390, 768, 1024, 1440, 1920];

/* the one corner, `--radius-box: 2rem` at the root size the app sets */
const TWO_REM = "32px";
/* every box the override layer gives that corner to: a card, a chip, a badge, a field and the control
   inside it, an action, and a dropdown panel */
const BOXES =
  "article, .chip, .badge, .field, .field > input, .field > select, .field > textarea, .button, menu";
/* the row the mobile menu draws per link — a full-width button inside a column */
const MENU_ROW = "header a.button.left-align";

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

test.describe("every box shares one shape", { tag: "@layout" }, () => {
  /* the corner is one token (`--radius-box`) set in `@layer overrides`, because beerCSS ships four radii
     and a page carried all of them at once: a pill search bar directly above a rounded rectangle card.
     A case per page, from the app's own list of urls, so a new page is covered without a test edit —
     and a fresh page each time, because a page here starts its own navigation after the load event */
  for (const path of ALL_PATHS) {
    test(`${path} draws one corner`, async ({ page }) => {
      await page.setViewportSize({ width: 1440, height: 900 });
      await page.goto(path);

      const boxes = await page.evaluate(
        (selector) =>
          [...document.querySelectorAll(selector)].map((box) => ({
            tag: box.tagName.toLowerCase(),
            classes: box.className.toString(),
            radius: getComputedStyle(box).borderTopLeftRadius,
          })),
        BOXES,
      );

      expect(boxes.length, `${path} draws no box at all`).toBeGreaterThan(0);

      for (const { tag, classes, radius } of boxes) {
        expect.soft(radius, `<${tag} class="${classes}">`).toBe(TWO_REM);
      }
    });
  }

  /* the page that carries every family at once, so a renamed class cannot quietly empty the sweep */
  test("looks at the families the app really draws", async ({ page }) => {
    await page.goto(HOME_PATH);

    const boxes = await page.evaluate(
      (selector) =>
        [...document.querySelectorAll(selector)].map(
          (box) => `${box.tagName.toLowerCase()} ${box.className.toString()}`,
        ),
      BOXES,
    );

    for (const family of ["article", "field", "chip", "button"]) {
      expect(boxes.some((box) => box.includes(family)), family).toBe(true);
    }
  });

  /* a beerCSS field is exactly as tall as the control inside it — 48px, material 3's single-line field —
     because the override layer takes the 1px tailwind leaves on the `.field` wrapper down to 0 (a
     transparent border is still a border, and it made the box 50px around a 48px control). the action
     standing beside it takes `h-12` for the same 48px, so the two boxes agree and, on one line, share a
     top and a bottom too. beerCSS draws a button as `content-box`, so without the override layer's
     border-box rule that button would be 48 *plus* its 2px boundary */
  test("a control beside a field is exactly as tall as the field's own", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

    /* the hero's search bar beside "Alle routes bekijken" — they share a line — and the filter row beside
       "Filters wissen", which only exists once something is filtered and which lands on the count's line
       because that row wraps: the content column is capped at 1600px */
    const rows = [
      { path: HOME_PATH, field: "#home-route-search", filter: "", sameLine: true },
      { path: ROUTES_PATH, field: "#route-search", filter: "binnen", sameLine: false },
    ];

    for (const { path, field, filter, sameLine } of rows) {
      await page.goto(path);

      if (filter.length > 0) {
        await page.fill(field, filter);
      }

      const boxes = await page.evaluate((selector) => {
        const box = (element: Element) => {
          const { height, top, bottom } = element.getBoundingClientRect();

          return { height, top, bottom };
        };
        const control = document.querySelector(selector)!;
        const row = control.closest(".field")!.parentElement!;

        return {
          control: box(control),
          action: box(row.querySelector(".button")!),
        };
      }, field);

      const where = `${path}: the action beside ${field}`;

      expect(boxes.action.height, where).toBe(boxes.control.height);

      if (sameLine) {
        expect(
          Math.abs(boxes.action.top - boxes.control.top),
          `${where}, the top`,
        ).toBeLessThanOrEqual(1);
        expect(
          Math.abs(boxes.action.bottom - boxes.control.bottom),
          `${where}, the bottom`,
        ).toBeLessThanOrEqual(1);
      }
    }
  });

  /* the mobile menu is a column of full-width rows: as a `content-box` each row measured 100% of the
     column *plus* its own padding, which poked 16px past the right edge of a phone */
  test("a full-width button stays inside its column", async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 800 });
    await page.goto(HOME_PATH);

    await page.getByRole("button", { name: "Menu" }).click();
    await expect(page.locator(MENU_ROW).first()).toBeVisible();

    const rows = await page.evaluate(
      (selector) =>
        [...document.querySelectorAll(selector)].map((row) => {
          const box = row.getBoundingClientRect();
          const column = row.parentElement!.getBoundingClientRect();

          return {
            past: box.right - column.right,
            short: column.left - box.left,
          };
        }),
      MENU_ROW,
    );

    expect(rows.length).toBeGreaterThan(0);

    for (const { past, short } of rows) {
      expect.soft(past, "the row ends past its column").toBeLessThanOrEqual(0.5);
      expect.soft(short, "the row starts before its column").toBeLessThanOrEqual(0.5);
    }

    expect(await horizontalOverflow(page)).toBeLessThanOrEqual(0);
  });
});
