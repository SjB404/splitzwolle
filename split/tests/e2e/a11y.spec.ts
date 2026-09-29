import { expect, test } from "./fixtures";
import { ALL_PATHS, ROUTES_PATH } from "./app";

/*
  What a lint rule cannot see, read off the real accessibility tree of a real browser: every picture has
  something to say, every control has a name, every page has one headline, and no id is used twice.
  The checks run on every url the app serves, so a new route or page is audited without a test edit.
*/

/* pinned: on the builder the picker's h3 ("Plekken van toen") sits directly under the page's h1, with the
   section's h2 further down; every other page runs h1 → h2 → h3. A new skip anywhere else fails. */
const KNOWN_HEADING_JUMPS: Record<string, number> = {
  [ROUTES_PATH]: 1,
};

const CHECKS = () => {
  const issues: string[] = [];
  const name = (element: Element) =>
    (element.getAttribute("aria-label") ?? element.textContent ?? "").trim();

  for (const image of document.querySelectorAll("img")) {
    const decorative =
      image.getAttribute("aria-hidden") === "true" ||
      image.getAttribute("role") === "presentation";
    if (!decorative && !(image.getAttribute("alt") ?? "").trim()) {
      issues.push(`an image has no alt text: ${image.getAttribute("src")}`);
    }
  }

  for (const control of document.querySelectorAll("a, button")) {
    if (
      name(control).length === 0 &&
      !control.getAttribute("aria-labelledby")
    ) {
      issues.push(
        `a ${control.tagName.toLowerCase()} has no accessible name: ${control.outerHTML.slice(0, 90)}`,
      );
    }
  }

  for (const field of document.querySelectorAll("input, select, textarea")) {
    const id = field.getAttribute("id");
    const labelled =
      field.getAttribute("aria-label") ??
      field.getAttribute("aria-labelledby") ??
      field.closest("label") ??
      (id ? document.querySelector(`label[for="${CSS.escape(id)}"]`) : null);

    if (!labelled) {
      issues.push(
        `a ${field.tagName.toLowerCase()}[type=${field.getAttribute("type")}] has no label`,
      );
    }
  }

  const ids = new Map<string, number>();
  for (const element of document.querySelectorAll("[id]")) {
    ids.set(element.id, (ids.get(element.id) ?? 0) + 1);
  }
  for (const [id, count] of ids) {
    if (count > 1) issues.push(`the id ${id} is used ${count} times`);
  }

  const headings = [...document.querySelectorAll("h1, h2, h3, h4, h5, h6")];
  const first = headings.filter((heading) => heading.tagName === "H1");

  if (first.length !== 1)
    issues.push(`the page has ${first.length} h1 headings`);

  for (let index = 1; index < headings.length; index += 1) {
    const before = Number(headings[index - 1].tagName[1]);
    const after = Number(headings[index].tagName[1]);

    if (after > before + 1) {
      issues.push(
        `the heading level jumps from h${before} to h${after}: ${headings[index].textContent?.trim().slice(0, 40)}`,
      );
    }
  }

  for (const landmark of ["banner", "main", "contentinfo"]) {
    if (
      !document.querySelector(
        landmark === "contentinfo"
          ? "footer"
          : landmark === "banner"
            ? "header"
            : "main",
      )
    ) {
      issues.push(`the page has no ${landmark} landmark`);
    }
  }

  return issues;
};

test.describe(
  "every page is readable by a screen reader",
  { tag: "@a11y" },
  () => {
    for (const path of ALL_PATHS) {
      test(`${path} has names, labels and one headline`, async ({ page }) => {
        await page.goto(path);

        /* the heading order is checked on its own below, because two overview pages are known to skip a level */
        const issues = (await page.evaluate(CHECKS)).filter(
          (issue) => !issue.startsWith("the heading level jumps"),
        );

        expect(issues).toEqual([]);
      });
    }

    for (const path of ALL_PATHS) {
      test(`${path} keeps its heading levels in order`, async ({ page }) => {
        await page.goto(path);

        const jumps = (await page.evaluate(CHECKS)).filter((issue) =>
          issue.startsWith("the heading level jumps"),
        );

        expect(jumps, jumps.join("; ")).toHaveLength(
          KNOWN_HEADING_JUMPS[path] ?? 0,
        );
      });
    }

    test("carries the landmarks the shell promises", async ({ page }) => {
      await page.goto("/");

      await expect(page.getByRole("banner")).toHaveCount(1);
      await expect(page.getByRole("main")).toHaveCount(1);
      await expect(page.getByRole("contentinfo")).toHaveCount(1);
    });
  },
);
