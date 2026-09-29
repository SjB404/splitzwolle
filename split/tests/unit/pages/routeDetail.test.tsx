import { fireEvent, render, screen, within } from "@testing-library/react";
import { MemoryRouter, Route, Routes } from "react-router-dom";
import RouteDetailPage from "../../../src/pages/routeDetailPage.tsx";
import NotFoundPage from "../../../src/pages/notFoundPage.tsx";
import { ROUTES, routePoints } from "../../../src/data/routes.ts";
import MotionProvider from "../motionProvider.tsx";

const ROUTE = ROUTES[0];

/* the detail page reads :routeId, so it needs the router's own route tree */
function renderDetail(routeId: string) {
  return render(
    <MotionProvider>
      <MemoryRouter initialEntries={[`/routes/${routeId}`]}>
        <Routes>
          <Route path="/routes/:routeId" element={<RouteDetailPage />} />
        </Routes>
      </MemoryRouter>
    </MotionProvider>,
  );
}

describe("RouteDetailPage", () => {
  it("heads the page with the route's own words", () => {
    renderDetail(ROUTE.id);

    expect(
      screen.getByRole("heading", { level: 1, name: ROUTE.title }),
    ).toBeInTheDocument();
    /* the header band and the story both tell it */
    expect(screen.getAllByText(ROUTE.description)).toHaveLength(2);
    expect(document.title).toBe(`${ROUTE.title} · Zwolle Routes`);
  });

  it("leads with the area and the score", () => {
    renderDetail(ROUTE.id);

    expect(screen.getAllByText(ROUTE.area).length).toBeGreaterThan(0);
    expect(
      screen.getByText(`4,9 · ${ROUTE.reviews} beoordelingen`),
    ).toBeInTheDocument();
  });

  it("carries a crumb back to the overview", () => {
    renderDetail(ROUTE.id);
    const nav = screen.getByRole("navigation", { name: "Kruimelpad" });

    expect(
      within(nav).getByRole("link", { name: "Alle routes" }),
    ).toHaveAttribute("href", "/routes");
    expect(within(nav).getByText(ROUTE.title)).toBeInTheDocument();
  });

  it("prints the facts, the story and the stops", () => {
    renderDetail(ROUTE.id);

    const places = routePoints(ROUTE);
    const stops = screen
      .getByRole("heading", { level: 3, name: "Onderweg" })
      .closest("article")!;

    expect(screen.getByText("Afstand")).toBeInTheDocument();
    expect(screen.getByText("1,1 km")).toBeInTheDocument();
    expect(
      screen.getByRole("heading", { level: 2, name: "Over deze route" }),
    ).toBeInTheDocument();
    expect(within(stops).getAllByRole("listitem")).toHaveLength(places.length);
  });

  it("shows the reviews and the related routes", () => {
    const { container } = renderDetail(ROUTE.id);

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: `Reviews (${ROUTE.reviews})`,
      }),
    ).toBeInTheDocument();
    expect(container.querySelectorAll("progress")).toHaveLength(5);
    expect(
      screen.getByRole("heading", { level: 2, name: "Vergelijkbare routes" }),
    ).toBeInTheDocument();
  });

  it("offers the way into the planner", () => {
    renderDetail(ROUTE.id);

    expect(
      screen.getByRole("link", { name: "Plan deze route" }),
    ).toHaveAttribute("href", "/planning");
  });

  it("takes a review without leaving the page", () => {
    const { container } = renderDetail(ROUTE.id);

    fireEvent.change(
      screen.getByRole("slider", { name: /Kies een beoordeling/ }),
      {
        target: { value: "4" },
      },
    );
    expect(screen.getByText("4 van 5 sterren")).toBeInTheDocument();

    fireEvent.submit(container.querySelector("form")!);

    expect(
      screen.getByRole("heading", { level: 1, name: ROUTE.title }),
    ).toBeInTheDocument();
  });

  it("answers with its own 404 for a route that does not exist", () => {
    renderDetail("kayakroute");

    expect(
      screen.getByRole("heading", { level: 1, name: "Route niet gevonden" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Deze route bestaat niet (meer). Bekijk alle routes om er een te kiezen.",
      ),
    ).toBeInTheDocument();
  });

  it("lists every route without crashing", () => {
    for (const route of ROUTES) {
      const { unmount } = renderDetail(route.id);

      expect(
        screen.getByRole("heading", { level: 1, name: route.title }),
      ).toBeInTheDocument();

      unmount();
    }
  });
});

describe("NotFoundPage", () => {
  it("says the page does not exist and offers two ways out", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", {
        level: 1,
        name: "Deze pagina bestaat niet",
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "De link klopt niet of de pagina is verplaatst. Ga terug naar de homepagina of bekijk alle routes.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Terug naar home" }),
    ).toHaveAttribute("href", "/");
    expect(
      screen.getByRole("link", { name: "Alle routes bekijken" }),
    ).toHaveAttribute("href", "/routes");
  });

  it("takes its own wording when it is asked for", () => {
    render(
      <MemoryRouter>
        <NotFoundPage title="Route niet gevonden" description="Bestaat niet." />
      </MemoryRouter>,
    );

    expect(
      screen.getByRole("heading", { level: 1, name: "Route niet gevonden" }),
    ).toBeInTheDocument();
    expect(screen.getByText("Bestaat niet.")).toBeInTheDocument();
  });

  it("names itself in the tab", () => {
    render(
      <MemoryRouter>
        <NotFoundPage />
      </MemoryRouter>,
    );

    expect(document.title).toBe("Deze pagina bestaat niet · Zwolle Routes");
  });
});
