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

/* the one corner, `--radius-box: 1.5rem` at the root size the app sets */
const CORNER = "24px";
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
     of its own and a page carried all of them at once: a pill search bar directly above a rounded
     rectangle card. The token is what a 48px control clamps to exactly half its height with, so the same
     number is a pill on a control and a corner on a card. A case per page, from the app's own list of
     urls, so a new page is covered without a test edit — and a fresh page each time, because a page here
     starts its own navigation after the load event */
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

  /* the contacts page's thin bars are pills: a field, a submit and an accordion row are each 48px tall,
     where the corner token (1.5rem) is exactly half the box, and 56px — beerCSS's `large`/`extra` — would
     draw a rounded rectangle instead. The page is not in ALL_PATHS' sweeps (a collaborator's page, with its
     own scoped beerCSS), so its bars are checked here. It is also the case that proves the `!` utilities
     land: inside beerCSS's scoped `div.beer` every plain Tailwind utility is reverted away (DESIGN.md §2) */
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

  /* a panel that clips its own corner already draws every outer corner, so a child that fills it stays
     square: with an inherited corner the seam between the two curved away from its neighbour and the
     panel read as two cards in a frame instead of one component (DESIGN.md §5). one case per shape that
     clips and holds more than one box — the hero's picture against its rail, a card's media band against
     its body, the reviews panel's row against the list it opens */
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

  /* the hero's panel shrinks around its picture instead of the picture being cropped into the band:
     the band is one screen tall, and a picture made to fill it was cover-cropped, which took a big part
     of the map off screen. the panel is `w-fit` and the pictures are `object-contain`, so the frame is
     the picture's own size — and this measures the box each picture is drawn in against **the file that
     arrived**, never against a number written down here, which is what keeps the rule true when the
     artwork is swapped for another picture at another ratio */
  test("the hero shows its pictures whole, and the panel shrinks to them", async ({
    page,
  }) => {
    /* a tall window where the width binds, a short one where the ceiling does, and a phone */
    for (const [width, height] of [
      [1440, 900],
      [1280, 620],
      [390, 844],
    ]) {
      await page.setViewportSize({ width, height });
      await page.goto(HOME_PATH);

      /* the crop is read off the files that arrived, so they have to have arrived */
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
                /* 0 when every pixel of the file is inside the box it is drawn in */
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

      /* the panel adds nothing to the picture but its own 2px boundary — and, beside the picture
         above `sm`, where the rail sits, its 64px */
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

    /* and in the window that used to crop hardest, the panel really is narrower than its column */
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
