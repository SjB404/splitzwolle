import { expect, test, horizontalOverflow } from "./fixtures";
import {
  ALL_PATHS,
  CONTACT_PATH,
  HOME_PATH,
  POI_PATH,
  ROUTES_PATH,
  ROUTE_PAGES,
  STATIC_PAGES,
} from "./app";

const WIDTHS = [320, 390, 768, 1024, 1440, 1920];

/* --radius-box, 1.5rem at the app's root size */
const CORNER = "24px";
const BOXES =
  "article, .chip, .badge, .field, .field > input, .field > select, .field > textarea, .button, menu";
const MENU_ROW = "header a.button.left-align";

test.describe("the layout never scrolls sideways", { tag: "@layout" }, () => {
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
  /* one --radius-box: 1.5rem is a pill on a 48px control and a corner on a card */
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
        expect.soft(radius, `<${tag} class="${classes}">`).toBe(CORNER);
      }
    });
  }

  /* the sweep reads radii; the contact page's pills are also measured for height here */
  test("a thin bar is a 48px pill, even inside beerCSS's scoped wrapper", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto(CONTACT_PATH);

    const bars = [
      { label: "the name field", selector: ".field:has(#naam)" },
      { label: "the submit", selector: "form button[type='submit']" },
      { label: "an accordion row", selector: "summary.none" },
    ];

    for (const { label, selector } of bars) {
      const box = await page
        .locator(selector)
        .first()
        .evaluate((element) => ({
          height: element.getBoundingClientRect().height,
          radius: getComputedStyle(element).borderTopLeftRadius,
        }));

      expect.soft(box.height, label).toBe(48);
      expect.soft(box.radius, label).toBe(CORNER);
    }
  });

  /* a panel that clips its own corners already draws them, so its children stay square */
  test("a child inside a clipped panel is square", async ({ page }) => {
    const panels = [
      {
        path: HOME_PATH,
        label: "the hero panel",
        panel: "#home div.surface.overflow-hidden",
      },
      { path: POI_PATH, label: "a place card", panel: "article.overflow-hidden" },
      { path: POI_PATH, label: "the map frame", panel: "div.surface.overflow-hidden" },
      {
        path: ROUTES_PATH,
        label: "a route card",
        panel: "article.overflow-hidden",
      },
      {
        path: ROUTE_PAGES[0].path,
        label: "the reviews panel",
        panel: "section.overflow-hidden",
      },
    ];

    for (const { path, label, panel } of panels) {
      await page.goto(path);

      const children = await page.evaluate(
        (selector) =>
          [...document.querySelectorAll(selector)].map((box) =>
            [...box.children].map((child) => ({
              tag: child.tagName.toLowerCase(),
              classes: child.className.toString(),
              radius: getComputedStyle(child).borderTopLeftRadius,
            })),
          ),
        panel,
      );

      expect(children.length, `${label} is not on ${path}`).toBeGreaterThan(0);

      for (const boxes of children) {
        expect(boxes.length, `${label} holds no child`).toBeGreaterThan(0);

        for (const { tag, classes, radius } of boxes) {
          expect.soft(radius, `${label}: <${tag} class="${classes}">`).toBe("0px");
        }
      }
    }
  });

  test("the hero shows its pictures whole, and the panel shrinks to them", async ({
    page,
  }) => {
    for (const [width, height] of [
      [1440, 900],
      [1280, 620],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(HOME_PATH);

      /* images must have loaded before their natural size is read */
      await page.waitForFunction(() =>
        [...document.querySelectorAll<HTMLImageElement>("#home img")].every(
          (image) => image.complete && image.naturalWidth > 0,
        ),
      );

      const measure = await page.evaluate(() => {
        const panel = document.querySelector(
          "#home div.surface.overflow-hidden",
        ) as HTMLElement;
        const picture = panel.firstElementChild!.getBoundingClientRect();
        const panelBox = panel.getBoundingClientRect();

        return {
          container: panel.parentElement!.getBoundingClientRect().width,
          panel: panelBox.width,
          slack: panelBox.width - picture.width,
          pictures: [...panel.querySelectorAll<HTMLImageElement>("img")].map(
            (image) => {
              const box = image.getBoundingClientRect();
              const natural = image.naturalWidth / image.naturalHeight;
              const rendered = box.width / box.height;

              return {
                alt: image.alt,
                /* 0 when every pixel fits inside the box */
                crop: 1 - Math.min(rendered / natural, natural / rendered),
                fit: getComputedStyle(image).objectFit,
              };
            },
          ),
        };
      });

      const at = `${width}x${height}`;

      expect.soft(measure.pictures, at).toHaveLength(2);

      for (const picture of measure.pictures) {
        expect.soft(picture.fit, `${at}: ${picture.alt}`).toBe("contain");
        expect
          .soft(picture.crop, `${at}: ${picture.alt} is cropped`)
          .toBeLessThan(0.001);
      }

      /* the panel adds only its 2px boundary, or 64px when the rail sits beside it */
      expect
        .soft(measure.slack, `${at}: the panel is not hugging the picture`)
        .toBeGreaterThanOrEqual(4);
      expect
        .soft(measure.slack, `${at}: the panel is not hugging the picture`)
        .toBeLessThanOrEqual(68);
      expect
        .soft(measure.panel, `${at}: the panel overruns its column`)
        .toBeLessThanOrEqual(measure.container + 1);
    }

    await page.setViewportSize({ width: 1280, height: 620 });
    await page.goto(HOME_PATH);

    const short = await page.evaluate(() => {
      const panel = document.querySelector(
        "#home div.surface.overflow-hidden",
      ) as HTMLElement;

      return {
        panel: panel.getBoundingClientRect().width,
        container: panel.parentElement!.getBoundingClientRect().width,
      };
    });

    expect(short.panel).toBeLessThan(short.container);
  });

  /* home carries every box family, so a renamed class cannot silently empty the sweep */
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

  /* beerCSS buttons are content-box; the override layer's border-box rule keeps them 48px */
  test("a control beside a field is exactly as tall as the field's own", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });

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

  /* as content-box the full-width menu rows overrun their column by their padding */
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
