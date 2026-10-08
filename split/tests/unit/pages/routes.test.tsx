import { afterEach, describe, expect, it } from "vitest";
import {
  fireEvent,
  render,
  screen,
  waitFor,
  within,
} from "@testing-library/react";
import App from "../../../src/App.tsx";
import {
  ROUTES,
  ROUTE_PAGE_SIZE,
  routePoints,
} from "../../../src/data/routes.ts";
import { POINTS_OF_INTEREST } from "../../../src/data/pointsOfInterest.ts";
import { pointsInArea } from "../../../src/data/area.ts";
import { directionsUrl } from "../../../src/data/directions.ts";
import {
  ROUTES_PATH,
  builderPath,
  publicRoutePath,
} from "../../../src/data/navigation.ts";
import { readSavedRouteIds } from "../../../src/data/savedRoutes.ts";

const AREA_POINTS = pointsInArea(POINTS_OF_INTEREST);
const ROUTE = ROUTES[0];
const BIKE_ROUTE = ROUTES.find((route) => route.theme === "Fiets")!;

/* App brings its own BrowserRouter; set the url before it mounts */
function renderAt(path: string) {
  window.history.pushState({}, "", path);
  return render(<App />);
}

const clickPlace = (point = AREA_POINTS[0]) =>
  fireEvent.click(screen.getByRole("button", { name: point.name }));

const pickedLine = (count: number) =>
  `${count} van ${AREA_POINTS.length} plekken`;
const EMPTY_LINE = `${AREA_POINTS.length} plekken in de binnenstad`;

/* a card is queried by its single "Open de route" link */
const cards = () => screen.queryAllByRole("link", { name: /^Open de route / });
const titles = () =>
  cards()
    .map((link) =>
      link.getAttribute("aria-label")!.replace("Open de route ", ""),
    )
    .sort();
const dataTitles = (routes = ROUTES) =>
  routes.map((route) => route.title).sort();

afterEach(() => {
  window.localStorage.clear();
});

describe("RoutesPage, the builder", () => {
  it("heads the page and explains what the area covers", async () => {
    renderAt(ROUTES_PATH);

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Stel je route samen",
      }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Stel je route samen · Zwolle Routes");
  });

  it("offers every place in the area and the two ways of travelling", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    expect(screen.getByRole("button", { name: "Lopen" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Fietsen" })).toBeInTheDocument();

    for (const point of AREA_POINTS) {
      expect
        .soft(screen.getByRole("button", { name: point.name }))
        .toBeInTheDocument();
    }
  });

  it("asks for a second place before it draws anything", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    expect(
      screen.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeInTheDocument();
    expect(screen.getByText(EMPTY_LINE)).toBeInTheDocument();
  });

  it("falls back to a panel when the map api is off", async () => {
    const { container } = renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    expect(
      screen.getByText(/De kaart kon niet geladen worden/),
    ).toBeInTheDocument();
    expect(container.querySelector('[class*="gm-style"]')).toBeNull();
  });

  it("adds a place to the route and numbers it on the map", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    const place = AREA_POINTS[0];
    clickPlace(place);

    /* picking a place navigates; the url is the state */
    await waitFor(() =>
      expect(window.location.pathname).toBe(builderPath([place.id])),
    );

    expect(await screen.findByText(pickedLine(1))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `1. ${place.name}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Kies nog een plek: een route heeft minstens twee stopplaatsen.",
      ),
    ).toBeInTheDocument();
  });

  it("works the route out as soon as there are two places", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    clickPlace(AREA_POINTS[0]);
    clickPlace(AREA_POINTS[1]);

    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "2 stopplaatsen, lopen",
      }),
    ).toBeInTheDocument();

    /* the routes api is unreachable in tests, so the numbers stay an estimate */
    expect(await screen.findByText(/Hemelsbreed geschat/)).toBeInTheDocument();
    expect(screen.getByText(pickedLine(2))).toBeInTheDocument();
    expect(
      screen.getByRole("link", { name: "Open in Google Maps" }),
    ).toBeInTheDocument();
  });

  it("switches the way of travelling", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    clickPlace(AREA_POINTS[0]);
    clickPlace(AREA_POINTS[1]);
    fireEvent.click(screen.getByRole("button", { name: "Fietsen" }));

    expect(
      await screen.findByRole("heading", {
        level: 3,
        name: "2 stopplaatsen, fietsen",
      }),
    ).toBeInTheDocument();
    expect(await screen.findByText(/Hemelsbreed geschat/)).toBeInTheDocument();
  });

  it("clears the picked places again", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    clickPlace(AREA_POINTS[0]);
    clickPlace(AREA_POINTS[1]);
    await screen.findByText(pickedLine(2));

    fireEvent.click(
      screen.getAllByRole("button", { name: "Selectie wissen" })[0],
    );

    expect(
      await screen.findByText(
        "Kies twee of meer plekken om een route te maken.",
      ),
    ).toBeInTheDocument();
    expect(
      screen.queryByRole("button", { name: "Selectie wissen" }),
    ).toBeNull();
  });
});

describe("RoutesPage, the url as the state", () => {
  const [first, second] = AREA_POINTS;

  it("seeds the route with the places handed over in the url", async () => {
    renderAt(builderPath([first.id, second.id]));

    expect(await screen.findByText(pickedLine(2))).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `1. ${first.name}` }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: `2. ${second.name}` }),
    ).toBeInTheDocument();
  });

  it("ignores a place in the url that does not exist", async () => {
    renderAt(builderPath([first.id, "niet-bestaand"]));

    expect(await screen.findByText(pickedLine(1))).toBeInTheDocument();
  });

  it("hands the built route to Google Maps in visit order", async () => {
    const picked = [first, second];
    renderAt(builderPath(picked.map((point) => point.id)));
    await screen.findByText(pickedLine(2));

    expect(
      screen.getByRole("link", { name: "Open in Google Maps" }),
    ).toHaveAttribute(
      "href",
      directionsUrl(
        picked.map((point) => point.coordinates),
        "walking",
      ),
    );
  });

  it("answers a share with no route by opening a popup, not a dead button", async () => {
    renderAt(builderPath([first.id]));
    await screen.findByText(pickedLine(1));

    const share = screen.getByRole("button", { name: "Deel deze route" });

    expect(share).toBeEnabled();

    fireEvent.click(share);

    expect(screen.getByRole("alert")).toHaveTextContent(
      "Kies eerst twee plekken op de kaart.",
    );
  });

  it("offers the share action once there are two places", async () => {
    renderAt(builderPath([first.id, second.id]));
    await screen.findByText(pickedLine(2));

    expect(
      screen.getByRole("button", { name: "Deel deze route" }),
    ).toBeEnabled();
  });
});

describe("RoutesPage, the ready-made routes", () => {
  it("shows a page of routes", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    expect(cards()).toHaveLength(ROUTE_PAGE_SIZE);
    expect(
      screen.getByText(`${ROUTE_PAGE_SIZE} van ${ROUTES.length} routes`),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Toon meer routes" }),
    ).toBeInTheDocument();
  });

  it("expands the list on demand", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Toon meer routes" }));

    await waitFor(() => expect(titles()).toEqual(dataTitles()));
    expect(
      screen.queryByRole("button", { name: "Toon meer routes" }),
    ).toBeNull();
  });

  it("filters the list and collapses it again", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(screen.getByRole("button", { name: "Toon meer routes" }));
    await waitFor(() => expect(titles()).toEqual(dataTitles()));

    fireEvent.change(screen.getByLabelText("Moeilijkheid"), {
      target: { value: "Gemiddeld" },
    });

    await waitFor(() =>
      expect(titles()).toEqual(
        dataTitles(ROUTES.filter((route) => route.difficulty === "Gemiddeld")),
      ),
    );
    expect(
      screen.queryByRole("button", { name: "Toon meer routes" }),
    ).toBeNull();
  });

  it("resets the filters back to every route", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.change(screen.getByLabelText("Type route"), {
      target: { value: "Fiets" },
    });

    await waitFor(() => expect(cards()).toHaveLength(1));

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));

    await waitFor(() => expect(cards()).toHaveLength(ROUTE_PAGE_SIZE));
    expect(
      screen.getByText(`${ROUTES.length} routes gevonden`),
    ).toBeInTheDocument();
  });

  it("keeps the search box and the filters in one search region", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    const region = screen.getByRole("search", {
      name: "Routes zoeken en filteren",
    });

    expect(within(region).getByRole("searchbox")).toBeInTheDocument();
    expect(within(region).getAllByRole("combobox")).toHaveLength(5);
    expect(
      within(region).getByText(`${ROUTES.length} routes gevonden`),
    ).toBeInTheDocument();
  });

  it("opens a ready-made route from anywhere on its card, with the builder already filled", async () => {
    const places = routePoints(ROUTE);
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(
      screen.getByRole("link", { name: `Open de route ${ROUTE.title}` }),
    );

    expect(
      await screen.findByRole("heading", { level: 1, name: ROUTE.title }),
    ).toBeInTheDocument();
    expect(screen.getByText(pickedLine(places.length))).toBeInTheDocument();
  });

  it("saves a route, says so, and filters the list down to the saved ones", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(
      screen.getByRole("button", {
        name: `Bewaar ${ROUTE.title} bij je opgeslagen routes`,
      }),
    );

    await waitFor(() => expect(readSavedRouteIds()).toEqual([ROUTE.id]));
    expect(screen.getByText("Opgeslagen")).toBeInTheDocument();

    fireEvent.change(screen.getByLabelText("Van wie"), {
      target: { value: "saved" },
    });

    await waitFor(() => expect(titles()).toEqual([ROUTE.title]));
  });

  it("takes a saved route back out of the saved ones", async () => {
    renderAt(ROUTES_PATH);
    await screen.findByRole("heading", { level: 1 });

    fireEvent.click(
      screen.getByRole("button", {
        name: `Bewaar ${ROUTE.title} bij je opgeslagen routes`,
      }),
    );

    await waitFor(() => expect(readSavedRouteIds()).toEqual([ROUTE.id]));

    fireEvent.click(
      screen.getByRole("button", {
        name: `Haal ${ROUTE.title} uit je opgeslagen routes`,
      }),
    );

    await waitFor(() => expect(readSavedRouteIds()).toEqual([]));
    expect(screen.queryByText("Opgeslagen")).toBeNull();
  });
});

describe("RoutesPage, a route's own page", () => {
  it("opens with the route's own title, trail and numbers", async () => {
    const { container } = renderAt(publicRoutePath(ROUTE.id));

    expect(
      await screen.findByRole("heading", { level: 1, name: ROUTE.title }),
    ).toBeInTheDocument();
    expect(document.title).toBe(`${ROUTE.title} · Zwolle Routes`);

    const header = within(container.querySelector("section.inverse-surface")!);

    expect(header.getByRole("link", { name: "Alle routes" })).toHaveAttribute(
      "href",
      ROUTES_PATH,
    );
    const trail = header.getByRole("navigation", { name: "Kruimelpad" });

    expect(within(trail).getByText(ROUTE.title)).toBeInTheDocument();
    expect(header.getByText(ROUTE.theme)).toBeInTheDocument();
    expect(header.getByText(ROUTE.area)).toBeInTheDocument();
  });

  it("seeds the builder with the route's own places", async () => {
    renderAt(publicRoutePath(ROUTE.id));

    expect(
      await screen.findByText(pickedLine(ROUTE.poiIds.length)),
    ).toBeInTheDocument();
  });

  it("opens a bicycle route on a bicycle", async () => {
    renderAt(publicRoutePath(BIKE_ROUTE.id));
    await screen.findByRole("heading", { level: 1 });

    expect(screen.getByRole("button", { name: "Fietsen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("keeps the reviews folded away until they are asked for", async () => {
    renderAt(publicRoutePath(ROUTE.id));
    await screen.findByRole("heading", { level: 1 });

    const toggle = screen.getByRole("button", { name: /Reviews bekijken/ });

    expect(toggle).toHaveAttribute("aria-expanded", "false");
    expect(
      screen.queryByRole("heading", { name: `Reviews (${ROUTE.reviews})` }),
    ).toBeNull();

    fireEvent.click(toggle);

    expect(
      await screen.findByRole("heading", {
        name: `Reviews (${ROUTE.reviews})`,
      }),
    ).toBeInTheDocument();
  });

  it("answers an unknown route id with the catch-all page", async () => {
    renderAt(publicRoutePath("niet-bestaand"));

    expect(
      await screen.findByRole("heading", {
        level: 1,
        name: "Route niet gevonden",
      }),
    ).toBeInTheDocument();
    expect(document.title).toBe("Route niet gevonden · Zwolle Routes");
  });
});
