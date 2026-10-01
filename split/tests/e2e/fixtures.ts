import { test as base, expect } from "@playwright/test";
import type { Page } from "@playwright/test";

/*
  Every test gets:
  - the aborted-network tripwire out of the way: fonts and any google api call are answered locally, so a slow
    or offline CDN can never make the suite flaky (the app hides its maps when the key is missing anyway);
  - a list of console errors and uncaught page errors, so "the page is quiet" can be asserted instead of assumed.
*/
export const test = base.extend<{ errors: string[] }>({
  errors: async ({ page }, provide) => {
    const errors: string[] = [];

    page.on("console", (message) => {
      if (message.type() === "error") errors.push(message.text());
    });
    page.on("pageerror", (error) => errors.push(String(error)));

    await page.route("**/fonts.googleapis.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "text/css", body: "" }),
    );
    await page.route("**/fonts.gstatic.com/**", (route) =>
      route.fulfill({ status: 200, contentType: "font/woff2", body: "" }),
    );
    await page.route("**/maps.googleapis.com/**", (route) =>
      route.fulfill({
        status: 200,
        contentType: "application/javascript",
        body: "",
      }),
    );

    await provide(errors);
  },
});

export { expect };

/** the app must never scroll sideways: the document's own width is the check */
export async function horizontalOverflow(page: Page) {
  return page.evaluate(
    () =>
      document.documentElement.scrollWidth -
      document.documentElement.clientWidth,
  );
}
