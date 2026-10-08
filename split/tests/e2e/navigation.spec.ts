import { expect, test } from "./fixtures";
import {
  CONTACT_DETAILS,
  FOOTER_COLUMNS,
  HOME_PATH,
  LOGIN_PATH,
  NAV_LINKS,
  ROUTES_PATH,
  UNKNOWN_PATH,
  isActiveLink,
} from "./app";

/* the bar's links that go to a page; Contact points at a band inside a page and is its own case */
const PAGE_LINKS = NAV_LINKS.filter((link) => !link.to.includes("#"));

test.describe("the top bar", { tag: "@nav" }, () => {
  for (const { label, to } of PAGE_LINKS) {
    test(`follows ${label} and marks it as the page you are on`, async ({
      page,
      errors,
    }) => {
      const expected = to.split("#")[0];

      /* start somewhere else, so the click really is what moves the reader */
      await page.goto(expected === ROUTES_PATH ? HOME_PATH : ROUTES_PATH);

      await page
        .getByRole("banner")
        .getByRole("link", { name: label, exact: true })
        .click();
      await expect(page).toHaveURL(expected);

      /* the app's own rule decides who is active, so this follows a rule change instead of pinning one */
      for (const link of PAGE_LINKS) {
        const target = page
          .getByRole("banner")
          .getByRole("link", { name: link.label, exact: true });

        if (isActiveLink(expected, link.to)) {
          await expect.soft(target).toHaveAttribute("aria-current", "page");
        } else {
          await expect.soft(target).not.toHaveAttribute("aria-current", "page");
        }
      }

      expect(errors).toEqual([]);
    });
  }

  test("sends the contact link down to the footer band", async ({ page }) => {
    await page.goto(ROUTES_PATH);

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Contact", exact: true })
      .click();

    await expect(page).toHaveURL(/\/#contact$/);
    await expect(page.locator("footer#contact")).toBeInViewport();
  });

  test("takes the brand name home", async ({ page }) => {
    await page.goto(ROUTES_PATH);

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Zwolle Routes" })
      .click();

    await expect(page).toHaveURL("/");
  });

  test("offers a search shortcut into the builder", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Zoek een route" })
      .click();

    await expect(page).toHaveURL(ROUTES_PATH);
  });
});

test.describe("the account link", { tag: "@nav" }, () => {
  /* pinned finding: /inloggen is linked from three places but has no route of its own */
  test("has no page behind it yet, and lands on the 404", async ({ page }) => {
    await page.goto("/");

    await page
      .getByRole("banner")
      .getByRole("link", { name: "Inloggen op je account" })
      .click();

    await expect(page).toHaveURL(LOGIN_PATH);
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Deze pagina bestaat niet",
    );
  });

  test("is offered again in the footer's account column", async ({ page }) => {
    await page.goto("/");
    const account = FOOTER_COLUMNS.find((column) =>
      column.links.some((link) => link.to === LOGIN_PATH),
    )!;

    const group = page.getByRole("navigation", { name: account.title });

    for (const link of account.links) {
      await expect
        .soft(group.getByRole("link", { name: link.label }))
        .toHaveAttribute("href", link.to);
    }

    await group.getByRole("link", { name: "Inloggen", exact: true }).click();
    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Deze pagina bestaat niet",
    );
  });
});

test.describe("the footer", { tag: "@nav" }, () => {
  test("carries every group the footer is built from", async ({ page }) => {
    await page.goto("/");

    for (const column of FOOTER_COLUMNS) {
      const group = page.getByRole("navigation", { name: column.title });

      await expect.soft(group).toBeVisible();

      for (const link of column.links) {
        await expect
          .soft(group.getByRole("link", { name: link.label }))
          .toHaveAttribute("href", link.to);
      }
    }
  });

  test("prints reachable contact details", async ({ page }) => {
    await page.goto("/");

    const footer = page.locator("footer#contact");

    await expect(
      footer.getByRole("link", { name: CONTACT_DETAILS.email }),
    ).toHaveAttribute("href", `mailto:${CONTACT_DETAILS.email}`);
    await expect(
      footer.getByRole("link", { name: CONTACT_DETAILS.phone }),
    ).toHaveAttribute("href", `tel:${CONTACT_DETAILS.phoneHref}`);
    await expect(footer).toContainText(CONTACT_DETAILS.address);
    await expect(footer).toContainText(`© ${new Date().getFullYear()}`);
  });

  test("follows a footer link", async ({ page }) => {
    const column = FOOTER_COLUMNS[0];
    const link = column.links.find((candidate) => candidate.to !== HOME_PATH)!;

    await page.goto(HOME_PATH);
    await page
      .getByRole("navigation", { name: column.title })
      .getByRole("link", { name: link.label })
      .click();

    await expect(page).toHaveURL(link.to);
  });
});

test.describe("the mobile menu", { tag: "@nav" }, () => {
  test.use({ viewport: { width: 390, height: 844 } });

  test("opens, navigates and closes itself", async ({ page, errors }) => {
    const target = PAGE_LINKS.at(-1)!;

    await page.goto("/");
    const menu = page.getByRole("button", { name: "Menu" });

    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("a.left-align")).toHaveCount(0);

    await menu.click();

    await expect(menu).toHaveAttribute("aria-expanded", "true");
    await expect(page.locator("a.left-align").first()).toBeVisible();

    await page.locator("a.left-align", { hasText: target.label }).click();

    await expect(page).toHaveURL(target.to);
    await expect(menu).toHaveAttribute("aria-expanded", "false");
    await expect(page.locator("a.left-align")).toHaveCount(0);

    expect(errors).toEqual([]);
  });

  test("keeps the desktop links out of the way", async ({ page }) => {
    await page.goto("/");

    await expect(
      page
        .getByRole("banner")
        .getByRole("link", { name: PAGE_LINKS[1].label, exact: true }),
    ).toBeHidden();
    await expect(
      page.getByRole("banner").getByRole("link", { name: "Zoek een route" }),
    ).toBeHidden();
  });
});

test.describe("the 404", { tag: "@nav" }, () => {
  test("offers a way home and a way to the routes", async ({ page }) => {
    await page.goto(UNKNOWN_PATH);

    await expect(
      page.getByText(/De link klopt niet of de pagina is verplaatst/),
    ).toBeVisible();

    await page.getByRole("link", { name: "Terug naar home" }).click();
    await expect(page).toHaveURL("/");

    await page.goto(UNKNOWN_PATH);
    await page
      .getByRole("link", { name: "Alle routes bekijken" })
      .first()
      .click();
    await expect(page).toHaveURL(ROUTES_PATH);
  });

  test("has its own wording for a route that does not exist", async ({
    page,
  }) => {
    await page.goto(`${ROUTES_PATH}/deze-route-bestaat-niet`);

    await expect(page.getByRole("heading", { level: 1 })).toHaveText(
      "Route niet gevonden",
    );
    await expect(
      page.getByText(/Deze route bestaat niet \(meer\)/),
    ).toBeVisible();
  });
});
