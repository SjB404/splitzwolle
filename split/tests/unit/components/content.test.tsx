import { screen } from "@testing-library/react";
import RouteCard from "../../../src/shared/content/routeCard.tsx";
import RouteGrid from "../../../src/shared/content/routeGrid.tsx";
import { ROUTES } from "../../../src/data/routes.ts";
import { publicRoutePath } from "../../../src/data/navigation.ts";
import { renderWithRouter } from "../helpers.tsx";

const POPULAR = ROUTES.find((route) => route.popular)!;
const QUIET = ROUTES.find(
  (route) => !route.popular && route.id === "musea-in-het-centrum",
)!;

/* a card holds a router link and a motion element, so it needs both providers */
const renderCard = (route: (typeof ROUTES)[number], showPopular?: boolean) =>
  renderWithRouter(<RouteCard route={route} showPopular={showPopular} />);

describe("RouteCard", () => {
  it("links its title at the route's own page", () => {
    renderCard(POPULAR);

    expect(screen.getByRole("link", { name: POPULAR.title })).toHaveAttribute(
      "href",
      publicRoutePath(POPULAR.id),
    );
    expect(
      screen.getByRole("heading", { level: 3, name: POPULAR.title }),
    ).toBeInTheDocument();
  });

  it("prints the distance and the duration in dutch", () => {
    const { container } = renderCard(POPULAR);

    expect(container.textContent).toContain(
      `${POPULAR.distanceKm.toFixed(1).replace(".", ",")} km`,
    );
    expect(container.textContent).toContain("20 min");
  });

  it("prints the score and how many people gave it", () => {
    renderCard(POPULAR);

    expect(screen.getByText("4,9")).toBeInTheDocument();
    expect(
      screen.getByText(`(${POPULAR.reviews} beoordelingen)`),
    ).toBeInTheDocument();
  });

  it("labels the card with the area and the theme", () => {
    renderCard(POPULAR);

    expect(screen.getByText(POPULAR.area)).toBeInTheDocument();
    expect(screen.getByText(POPULAR.theme)).toBeInTheDocument();
  });

  it("marks a popular route", () => {
    renderCard(POPULAR);

    expect(screen.getByText("Populair")).toBeInTheDocument();
  });

  it("leaves the badge off a route nobody called popular", () => {
    renderCard(QUIET);

    expect(screen.queryByText("Populair")).toBeNull();
  });

  it("leaves the badge off where the section already says so", () => {
    renderCard(POPULAR, false);

    expect(screen.queryByText("Populair")).toBeNull();
  });

  it("draws the route from its own coordinates when there is no map picture", () => {
    const { container } = renderCard(POPULAR);

    expect(container.querySelector("svg")).toBeInTheDocument();
    expect(container.querySelector("polyline")).toBeInTheDocument();
  });

  it("announces the preview picture for screen readers", () => {
    renderCard(POPULAR);

    expect(
      screen.queryByRole("img", {
        name: `Kaart met de route ${POPULAR.title}`,
      }),
    ).toBeNull(); /* no static map key in the tests, so the shape stands in */
    expect(screen.getByText("Bekijk")).toBeInTheDocument();
  });
});

describe("RouteGrid", () => {
  it("renders one card per route", () => {
    renderWithRouter(<RouteGrid routes={ROUTES.slice(0, 3)} />);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(3);
    expect(screen.getAllByRole("link")).toHaveLength(3);
  });

  it("renders nothing for an empty list", () => {
    const { container } = renderWithRouter(<RouteGrid routes={[]} />);

    expect(container.querySelectorAll("article")).toHaveLength(0);
  });

  it("marks every popular card", () => {
    const popular = ROUTES.filter((route) => route.popular);

    renderWithRouter(<RouteGrid routes={popular} />);

    expect(screen.getAllByText("Populair")).toHaveLength(popular.length);
  });

  it("forwards the popular-badge switch to every card", () => {
    const popular = ROUTES.filter((route) => route.popular);

    renderWithRouter(<RouteGrid routes={popular} showPopular={false} />);

    expect(screen.queryAllByText("Populair")).toHaveLength(0);
  });
});
