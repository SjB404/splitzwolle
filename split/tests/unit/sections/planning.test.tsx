import { fireEvent, screen } from "@testing-library/react";
import SavedRouteList from "../../../src/sections/planning/savedRouteList.tsx";
import PlanSummary from "../../../src/sections/planning/planSummary.tsx";
import { ROUTES } from "../../../src/data/routes.ts";
import { renderWithRouter } from "../helpers.tsx";
import type { Route } from "../../../src/types.ts";

/* the ids the planning page starts with */
const SAVED_IDS = [
  "historische-singel-route",
  "rondje-stadsgracht",
  "musea-in-het-centrum",
];
const SAVED = SAVED_IDS.map(
  (id) => ROUTES.find((route) => route.id === id)!,
) as Route[];

describe("SavedRouteList", () => {
  it("lists the saved routes with a counter", () => {
    renderWithRouter(
      <SavedRouteList
        routes={SAVED}
        selectedIds={SAVED_IDS}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 2, name: "Opgeslagen routes" }),
    ).toBeInTheDocument();
    expect(screen.getByText("3 van 3")).toBeInTheDocument();
    expect(screen.getAllByRole("listitem")).toHaveLength(3);
  });

  it("ticks the routes that are in the planning", () => {
    renderWithRouter(
      <SavedRouteList
        routes={SAVED}
        selectedIds={["rondje-stadsgracht"]}
        onToggle={() => {}}
      />,
    );

    expect(
      screen.getByRole("checkbox", {
        name: "Rondje Stadsgracht opnemen in de planning",
      }),
    ).toBeChecked();
    expect(
      screen.getByRole("checkbox", {
        name: "Historische Singel-route opnemen in de planning",
      }),
    ).not.toBeChecked();
    expect(screen.getByText("1 van 3")).toBeInTheDocument();
  });

  it("reports a toggle by id", () => {
    const onToggle = vi.fn();
    renderWithRouter(
      <SavedRouteList
        routes={SAVED}
        selectedIds={SAVED_IDS}
        onToggle={onToggle}
      />,
    );

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Rondje Stadsgracht opnemen in de planning",
      }),
    );

    expect(onToggle).toHaveBeenCalledWith("rondje-stadsgracht");
  });

  it("links every row at its own route page", () => {
    renderWithRouter(
      <SavedRouteList
        routes={SAVED}
        selectedIds={SAVED_IDS}
        onToggle={() => {}}
      />,
    );

    expect(
      screen
        .getAllByRole("link", { name: "Bekijk" })
        .map((link) => link.getAttribute("href")),
    ).toEqual(SAVED.map((route) => `/routes/${route.id}`));
  });
});

describe("PlanSummary", () => {
  it("adds the ticked routes up", () => {
    renderWithRouter(<PlanSummary routes={SAVED} />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Routeoverzicht" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Routes")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
    expect(screen.getByText("Totale afstand")).toBeInTheDocument();
    expect(screen.getByText("5,2 km")).toBeInTheDocument();
    expect(screen.getByText("Verwachte duur")).toBeInTheDocument();
    expect(screen.getByText("1 u 09")).toBeInTheDocument();
  });

  it("counts a place only once, even when several routes visit it", () => {
    renderWithRouter(<PlanSummary routes={SAVED} />);

    /* sassenpoort, thorbeckegracht and de fundatie are each on two of the three routes */
    expect(screen.getByText("Stopplaatsen")).toBeInTheDocument();
    expect(screen.getByText("7")).toBeInTheDocument();
  });

  it("says which pace the duration was worked out with", () => {
    renderWithRouter(<PlanSummary routes={SAVED} />);

    expect(
      screen.getByText("Gerekend met een wandeltempo van 4,5 km per uur."),
    ).toBeInTheDocument();
  });

  it("adds up a single route on its own", () => {
    renderWithRouter(<PlanSummary routes={[ROUTES[0]]} />);

    expect(screen.getByText("1,1 km")).toBeInTheDocument();
    expect(screen.getByText("15 min")).toBeInTheDocument();
    expect(screen.getByText("4")).toBeInTheDocument();
  });

  it("counts nothing when nothing is ticked", () => {
    renderWithRouter(<PlanSummary routes={[]} />);

    expect(screen.getByText("0,0 km")).toBeInTheDocument();
    expect(screen.getByText("0 min")).toBeInTheDocument();
  });

  it("sends the reader to their account to save the route", () => {
    renderWithRouter(<PlanSummary routes={SAVED} />);

    expect(screen.getByRole("link", { name: "Route opslaan" })).toHaveAttribute(
      "href",
      "/inloggen",
    );
    expect(
      screen.getByText("Opslaan en delen horen bij je account."),
    ).toBeInTheDocument();
  });
});
