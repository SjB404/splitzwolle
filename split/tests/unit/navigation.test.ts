import {
  CONTACT_DETAILS,
  CUSTOM_ROUTE_PATH,
  FOOTER_COLUMNS,
  HOME_PATH,
  LOGIN_PATH,
  NAV_LINKS,
  PLANNING_PATH,
  POI_PATH,
  PUBLIC_ROUTE_PATH,
  REGISTER_PATH,
  ROUTES_PATH,
  builderPath,
  isActiveLink,
  parsePlaceIds,
  publicRoutePath,
} from "../../src/data/navigation.ts";

/* the bar's links that go to a page, in the order the bar shows them */
const PAGE_LINKS = NAV_LINKS.filter((link) => !link.to.includes("#"));

describe("the path constants", () => {
  it("are the urls the router and the links share", () => {
    expect(HOME_PATH).toBe("/");
    expect(ROUTES_PATH).toBe("/routes");
    expect(POI_PATH).toBe("/points-of-interest");
    expect(LOGIN_PATH).toBe("/inloggen");
    expect(REGISTER_PATH).toBe("/inloggen#registreren");
  });

  it("keeps the old planning url alive so an old link still lands somewhere", () => {
    expect(PLANNING_PATH).toBe("/planning");
    expect(NAV_LINKS.map((link) => link.to)).not.toContain(PLANNING_PATH);
  });
});

describe("builderPath", () => {
  it("names every place in one segment, in visit order", () => {
    expect(builderPath(["peperbus", "melkmarkt"])).toBe(
      `${CUSTOM_ROUTE_PATH}/peperbus,melkmarkt`,
    );
  });

  it("is the plain builder for a route with no places", () => {
    expect(builderPath([])).toBe(ROUTES_PATH);
  });

  it("encodes a place id that needs it, so the url cannot break", () => {
    expect(builderPath(["de librije"])).toBe(
      `${CUSTOM_ROUTE_PATH}/de%20librije`,
    );
  });
});

describe("parsePlaceIds", () => {
  it("reads back exactly what builderPath wrote", () => {
    expect(builderPath(["peperbus", "de librije"])).toBe(
      `${CUSTOM_ROUTE_PATH}/peperbus,de%20librije`,
    );
    expect(parsePlaceIds("peperbus,de%20librije")).toEqual([
      "peperbus",
      "de librije",
    ]);
  });

  it("answers an empty route for a segment that is not there", () => {
    expect(parsePlaceIds(undefined)).toEqual([]);
    expect(parsePlaceIds("")).toEqual([]);
  });

  it("drops empty steps, so a stray comma cannot invent a place", () => {
    expect(parsePlaceIds("peperbus,,melkmarkt")).toEqual([
      "peperbus",
      "melkmarkt",
    ]);
  });
});

describe("publicRoutePath", () => {
  it("puts a ready-made route under its own segment", () => {
    expect(publicRoutePath("binnenstad-highlights")).toBe(
      `${PUBLIC_ROUTE_PATH}/binnenstad-highlights`,
    );
  });

  it("keeps the two kinds of route apart, so one can never open the other", () => {
    expect(PUBLIC_ROUTE_PATH).not.toBe(CUSTOM_ROUTE_PATH);
    expect(publicRoutePath("x").startsWith(CUSTOM_ROUTE_PATH)).toBe(false);
  });
});

describe("NAV_LINKS", () => {
  it("starts at home and ends at the footer's contact band", () => {
    expect(NAV_LINKS[0]).toEqual({ label: "Home", to: HOME_PATH });
    expect(NAV_LINKS[NAV_LINKS.length - 1].to).toBe(`${HOME_PATH}#contact`);
  });

  it("lists every page exactly once", () => {
    const targets = NAV_LINKS.map((link) => link.to);

    expect(new Set(targets).size).toBe(targets.length);
    expect(targets).toEqual(
      expect.arrayContaining([HOME_PATH, ROUTES_PATH, POI_PATH]),
    );
  });

  it("gives every link a dutch label and an internal target", () => {
    for (const link of NAV_LINKS) {
      expect.soft(link.label.length).toBeGreaterThan(0);
      expect.soft(link.to.startsWith("/")).toBe(true);
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

  it("points every link at a path the app serves", () => {
    const known = [HOME_PATH, ROUTES_PATH, POI_PATH, LOGIN_PATH, PLANNING_PATH];

    for (const column of FOOTER_COLUMNS) {
      for (const link of column.links) {
        expect.soft(known).toContain(link.to.split("#")[0]);
      }
    }
  });

  it("keeps the planner out of the footer, now that the builder does its job", () => {
    for (const column of FOOTER_COLUMNS) {
      for (const link of column.links) {
        expect.soft(link.to).not.toBe(PLANNING_PATH);
      }
    }
  });

  it("offers the account links in the account group", () => {
    const account = FOOTER_COLUMNS[1];

    expect(account.links.map((link) => link.to)).toEqual([
      LOGIN_PATH,
      REGISTER_PATH,
    ]);
  });

  it("shows every page in the navigation group too", () => {
    expect(FOOTER_COLUMNS[0].links.map((link) => link.to)).toEqual([
      HOME_PATH,
      ROUTES_PATH,
      POI_PATH,
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

  it("has a case for every link the bar shows", () => {
    for (const link of PAGE_LINKS) {
      const path = link.to.split("#")[0];

      expect.soft(isActiveLink(path, link.to)).toBe(true);
    }
  });
});
