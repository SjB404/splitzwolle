import {
  CONTACT_DETAILS,
  FOOTER_COLUMNS,
  HOME_PATH,
  LOGIN_PATH,
  NAV_LINKS,
  PLANNING_PATH,
  POI_PATH,
  REGISTER_PATH,
  ROUTES_PATH,
  isActiveLink,
} from "../../src/data/navigation.ts";

describe("the path constants", () => {
  it("are the urls the router and the links share", () => {
    expect(HOME_PATH).toBe("/");
    expect(ROUTES_PATH).toBe("/routes");
    expect(PLANNING_PATH).toBe("/planning");
    expect(POI_PATH).toBe("/points-of-interest");
    expect(LOGIN_PATH).toBe("/inloggen");
    expect(REGISTER_PATH).toBe("/inloggen#registreren");
  });
});

describe("NAV_LINKS", () => {
  it("starts at home and ends at the footer's contact band", () => {
    expect(NAV_LINKS[0]).toEqual({ label: "Home", to: HOME_PATH });
    expect(NAV_LINKS[NAV_LINKS.length - 1].to).toBe(`${HOME_PATH}#contact`);
  });

  it("lists the four pages exactly once each", () => {
    const targets = NAV_LINKS.map((link) => link.to);

    expect(new Set(targets).size).toBe(targets.length);
    expect(targets).toContain(ROUTES_PATH);
    expect(targets).toContain(PLANNING_PATH);
    expect(targets).toContain(POI_PATH);
  });

  it("gives every link a dutch label and an internal target", () => {
    for (const link of NAV_LINKS) {
      expect(link.label.length).toBeGreaterThan(0);
      expect(link.to.startsWith("/")).toBe(true);
    }
  });
});

describe("FOOTER_COLUMNS", () => {
  it("has a navigation group and an account group", () => {
    expect(FOOTER_COLUMNS.map((column) => column.title)).toEqual([
      "Navigatie",
      "Account",
    ]);
  });

  it("points every link at a declared path", () => {
    const known = [HOME_PATH, ROUTES_PATH, PLANNING_PATH, POI_PATH];

    for (const column of FOOTER_COLUMNS) {
      for (const link of column.links) {
        const path = link.to.split("#")[0];
        expect([...known, LOGIN_PATH]).toContain(path);
      }
    }
  });

  it("offers register and my planning in the account group", () => {
    const account = FOOTER_COLUMNS[1];
    expect(account.links.map((link) => link.to)).toEqual([
      LOGIN_PATH,
      REGISTER_PATH,
      PLANNING_PATH,
    ]);
  });
});

describe("CONTACT_DETAILS", () => {
  it("has an email address, a readable phone number and an address", () => {
    expect(CONTACT_DETAILS.email).toMatch(/^[^@\s]+@[^@\s]+\.[a-z]+$/);
    expect(CONTACT_DETAILS.phone).toMatch(/^\+[\d ]+$/);
    expect(CONTACT_DETAILS.address).toContain("Zwolle");
  });

  it("spells the phone link as the same number without spaces", () => {
    expect(CONTACT_DETAILS.phoneHref).toBe(
      `+${CONTACT_DETAILS.phone.replace(/[^\d]/g, "")}`,
    );
  });
});

describe("isActiveLink", () => {
  const cases: [string, string, boolean][] = [
    ["/", "/", true],
    ["/routes", "/", false],
    ["/routes", "/routes", true],
    ["/routes/binnenstad-highlights", "/routes", true],
    ["/routes", "/routes/binnenstad-highlights", false],
    ["/planning", "/planning", true],
    ["/points-of-interest", "/points-of-interest", true],
    ["/points-of-interest", "/planning", false],
    ["/", "/#contact", true],
    ["/routes", "/#contact", false],
    ["/onbekend", "/routes", false],
  ];

  it.each(cases)(
    "is %s for pathname %s and link %s",
    (pathname, to, expected) => {
      expect(isActiveLink(pathname, to)).toBe(expected);
    },
  );
});
