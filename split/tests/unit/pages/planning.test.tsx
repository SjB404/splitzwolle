import { act, fireEvent, screen, within } from "@testing-library/react";
import PlanningPage from "../../../src/pages/planningPage.tsx";
import { renderWithRouter } from "../helpers.tsx";

/* the plan map asks the directions api for a line; let the refusal settle before the test ends */
const settle = () =>
  act(async () => {
    await Promise.resolve();
  });

/* a summary total, read off the row it belongs to instead of from the whole page */
const totalOf = (label: string) =>
  screen.getByText(label).closest("div")?.querySelector("dd")?.textContent;

describe("PlanningPage", () => {
  it("heads the page and explains what it does", () => {
    renderWithRouter(<PlanningPage />);

    expect(
      screen.getByRole("heading", { level: 1, name: "Stel je route samen" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        /De kaart en het overzicht rekenen de afstand en de duur voor je uit/,
      ),
    ).toBeInTheDocument();
  });

  it("starts with three saved routes ticked", () => {
    renderWithRouter(<PlanningPage />);

    expect(
      screen.getByRole("heading", { level: 2, name: "Opgeslagen routes" }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("checkbox")).toHaveLength(3);
    expect(
      screen
        .getAllByRole("checkbox")
        .every((box) => (box as HTMLInputElement).checked),
    ).toBe(true);
    expect(screen.getByText("3 van 3")).toBeInTheDocument();
  });

  it("adds the ticked routes up", async () => {
    renderWithRouter(<PlanningPage />);

    expect(screen.getByText("5,2 km")).toBeInTheDocument();
    expect(screen.getByText("1 u 09")).toBeInTheDocument();
    expect(screen.getByText("3 van 3 routes")).toBeInTheDocument();

    await settle();
  });

  it("recomputes everything when a route is ticked off", async () => {
    renderWithRouter(<PlanningPage />);

    fireEvent.click(
      screen.getByRole("checkbox", {
        name: "Rondje Stadsgracht opnemen in de planning",
      }),
    );

    expect(screen.getByText("2 van 3")).toBeInTheDocument();
    /* the row beside the summary prints the same distance, so the total is read off its own row */
    expect(totalOf("Totale afstand")).toBe("2,6 km");
    expect(totalOf("Verwachte duur")).toBe("35 min");
    expect(screen.getByText("2 van 3 routes")).toBeInTheDocument();

    await settle();
  });

  it("empties the planning again", async () => {
    renderWithRouter(<PlanningPage />);

    for (const box of screen.getAllByRole("checkbox")) {
      fireEvent.click(box);
    }

    expect(screen.getByText("0 van 3")).toBeInTheDocument();
    expect(screen.getByText("0,0 km")).toBeInTheDocument();
    expect(screen.getByText("0 van 3 routes")).toBeInTheDocument();
    expect(
      screen.getByText("Kies links minimaal één route om de kaart te vullen."),
    ).toBeInTheDocument();

    await settle();
  });

  it("points at the overview for another route", () => {
    renderWithRouter(<PlanningPage />);

    expect(
      screen.getByRole("link", { name: "Bekijk alle routes" }),
    ).toHaveAttribute("href", "/routes");
  });

  it("carries a crumb back to the overview", () => {
    renderWithRouter(<PlanningPage />);
    const nav = screen.getByRole("navigation", { name: "Kruimelpad" });

    expect(
      within(nav).getByRole("link", { name: "Alle routes" }),
    ).toHaveAttribute("href", "/routes");
    expect(within(nav).getByText("Planning")).toBeInTheDocument();
  });

  it("links every saved route at its own page", () => {
    renderWithRouter(<PlanningPage />);

    expect(
      screen
        .getAllByRole("link", { name: "Bekijk" })
        .map((link) => link.getAttribute("href")),
    ).toEqual([
      "/routes/historische-singel-route",
      "/routes/rondje-stadsgracht",
      "/routes/musea-in-het-centrum",
    ]);
  });
});
