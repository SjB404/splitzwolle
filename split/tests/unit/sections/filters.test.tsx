import { fireEvent, screen } from "@testing-library/react";
import RouteFilters from "../../../src/components/routeFilters.tsx";
import RouteResults from "../../../src/components/routeResults.tsx";
import PoiFilters from "../../../src/components/poiFilters.tsx";
import PoiResults from "../../../src/components/poiResults.tsx";
import { INITIAL_ROUTE_FILTERS, ROUTES } from "../../../src/data/routes.ts";
import { builderPath } from "../../../src/data/navigation.ts";
import {
  INITIAL_POI_FILTERS,
  POINTS_OF_INTEREST,
  getPointOfInterest,
} from "../../../src/data/pointsOfInterest.ts";
import { renderWithRouter } from "../helpers.tsx";

describe("RouteFilters", () => {
  const render = (onReset?: () => void, matchCount = 8) =>
    renderWithRouter(
      <RouteFilters
        filters={INITIAL_ROUTE_FILTERS}
        matchCount={matchCount}
        onFilterChange={() => {}}
        onReset={onReset}
      />,
    );

  it("shows the five controls a route can be filtered on", () => {
    render();

    expect(
      screen.getByRole("searchbox", { name: "Zoek op titel, wijk of thema" }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText("Populariteit")).toBeInTheDocument();
    expect(screen.getByLabelText("Afstand")).toBeInTheDocument();
    expect(screen.getByLabelText("Type route")).toBeInTheDocument();
    expect(screen.getByLabelText("Moeilijkheid")).toBeInTheDocument();
  });

  it("offers the resting option in every list", () => {
    render();

    const labels = screen
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(labels).toContain("Alle routes");
    expect(labels).toContain("Alle afstanden");
    expect(labels).toContain("Alle thema's");
    expect(labels).toContain("Alle niveaus");
  });

  it("lists the distance buckets and the two difficulties", () => {
    render();

    const labels = screen
      .getAllByRole("option")
      .map((option) => option.textContent);

    expect(labels).toContain("Tot 1,5 km");
    expect(labels).toContain("1,5 – 2,5 km");
    expect(labels).toContain("Meer dan 2,5 km");
    expect(labels).toContain("Makkelijk");
    expect(labels).toContain("Gemiddeld");
  });

  it("reports the match count in a live region, singular included", () => {
    const { unmount } = render(undefined, 1);

    expect(screen.getByText("1 route gevonden")).toHaveAttribute(
      "aria-live",
      "polite",
    );

    unmount();
    render(undefined, 8);

    expect(screen.getByText("8 routes gevonden")).toBeInTheDocument();
  });

  it("sends one patch per control", () => {
    const onFilterChange = vi.fn();
    renderWithRouter(
      <RouteFilters
        filters={INITIAL_ROUTE_FILTERS}
        matchCount={8}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.change(screen.getByRole("searchbox"), {
      target: { value: "peperbus" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ query: "peperbus" });

    fireEvent.change(screen.getByLabelText("Populariteit"), {
      target: { value: "popular" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ popularity: "popular" });

    fireEvent.change(screen.getByLabelText("Afstand"), {
      target: { value: "short" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ distance: "short" });

    fireEvent.change(screen.getByLabelText("Type route"), {
      target: { value: "Wandel" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ theme: "Wandel" });

    fireEvent.change(screen.getByLabelText("Moeilijkheid"), {
      target: { value: "Gemiddeld" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({
      difficulty: "Gemiddeld",
    });

    expect(onFilterChange).toHaveBeenCalledTimes(5);
  });

  it("hides the reset button at rest", () => {
    render();

    expect(screen.queryByRole("button", { name: "Filters wissen" })).toBeNull();
  });

  it("shows the reset and calls back once a filter is set", () => {
    const onReset = vi.fn();
    render(onReset);

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe("RouteResults", () => {
  const render = (
    routes = ROUTES,
    showAll = false,
    onShowAll = () => {},
    onReset = () => {},
    savedIds: string[] = [],
  ) =>
    renderWithRouter(
      <RouteResults
        routes={routes}
        showAll={showAll}
        onShowAll={onShowAll}
        onReset={onReset}
        savedIds={savedIds}
        onToggleSave={() => {}}
      />,
    );

  it("shows one page of routes and how many there are", () => {
    render();

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(6);
    expect(screen.getByText("6 van 8 routes")).toBeInTheDocument();
  });

  it("shows everything once the list is expanded", () => {
    render(ROUTES, true);

    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(8);
    expect(
      screen.queryByRole("button", { name: "Toon meer routes" }),
    ).toBeNull();
  });

  it("offers 'Toon meer routes' only while there is more to show", () => {
    const onShowAll = vi.fn();
    const { unmount } = render(ROUTES, false, onShowAll);

    fireEvent.click(screen.getByRole("button", { name: "Toon meer routes" }));
    expect(onShowAll).toHaveBeenCalledTimes(1);

    unmount();
    render(ROUTES.slice(0, 4));

    expect(
      screen.queryByRole("button", { name: "Toon meer routes" }),
    ).toBeNull();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(4);
  });

  it("says so and offers a way out when nothing matches", () => {
    const onReset = vi.fn();
    render([], false, () => {}, onReset);

    expect(screen.queryAllByRole("heading", { level: 3 })).toHaveLength(0);
    expect(
      screen.getByRole("heading", { level: 2, name: "Geen routes gevonden" }),
    ).toBeInTheDocument();
    expect(
      screen.getByText(
        "Pas de filters aan of zoek op een andere wijk, titel of thema.",
      ),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe("PoiFilters", () => {
  it("offers every category as a chip, with the resting one pressed", () => {
    renderWithRouter(
      <PoiFilters
        filters={INITIAL_POI_FILTERS}
        matchCount={9}
        onFilterChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Alles" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Monumenten" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
    expect(screen.getByRole("button", { name: "Musea" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Culinair" }),
    ).toBeInTheDocument();
  });

  it("presses the chip that matches the filter", () => {
    renderWithRouter(
      <PoiFilters
        filters={{ ...INITIAL_POI_FILTERS, category: "Musea" }}
        matchCount={2}
        onFilterChange={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Musea" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Alles" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports the count with the right plural", () => {
    const { unmount } = renderWithRouter(
      <PoiFilters
        filters={INITIAL_POI_FILTERS}
        matchCount={1}
        onFilterChange={() => {}}
      />,
    );

    expect(screen.getByText("1 bezienswaardigheid")).toHaveAttribute(
      "aria-live",
      "polite",
    );

    unmount();
    renderWithRouter(
      <PoiFilters
        filters={INITIAL_POI_FILTERS}
        matchCount={9}
        onFilterChange={() => {}}
      />,
    );

    expect(screen.getByText("9 bezienswaardigheden")).toBeInTheDocument();
  });

  it("sends a category, a query and a sort", () => {
    const onFilterChange = vi.fn();
    renderWithRouter(
      <PoiFilters
        filters={INITIAL_POI_FILTERS}
        matchCount={9}
        onFilterChange={onFilterChange}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Culinair" }));
    expect(onFilterChange).toHaveBeenLastCalledWith({ category: "Culinair" });

    fireEvent.change(
      screen.getByRole("searchbox", {
        name: "Zoek op naam, wijk of categorie",
      }),
      {
        target: { value: "park" },
      },
    );
    expect(onFilterChange).toHaveBeenLastCalledWith({ query: "park" });

    fireEvent.change(screen.getByLabelText("Sorteer op"), {
      target: { value: "distance" },
    });
    expect(onFilterChange).toHaveBeenLastCalledWith({ sort: "distance" });

    expect(onFilterChange).toHaveBeenCalledTimes(3);
  });

  it("offers the reset only when a filter is active", () => {
    const onReset = vi.fn();
    renderWithRouter(
      <PoiFilters
        filters={INITIAL_POI_FILTERS}
        matchCount={9}
        onFilterChange={() => {}}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe("PoiResults", () => {
  it("lists a card per place under a heading", () => {
    renderWithRouter(
      <PoiResults
        points={POINTS_OF_INTEREST}
        selectedId={null}
        onSelect={() => {}}
        onReset={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 2,
        name: "Alle bezienswaardigheden",
      }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole("heading", { level: 3 })).toHaveLength(
      POINTS_OF_INTEREST.length,
    );
  });

  it("marks the selected place", () => {
    renderWithRouter(
      <PoiResults
        points={POINTS_OF_INTEREST}
        selectedId="peperbus"
        onSelect={() => {}}
        onReset={() => {}}
      />,
    );

    expect(screen.getByRole("button", { name: "Op de kaart" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("says so and offers a way out when nothing matches", () => {
    const onReset = vi.fn();
    renderWithRouter(
      <PoiResults
        points={[]}
        selectedId={null}
        onSelect={() => {}}
        onReset={onReset}
      />,
    );

    expect(
      screen.getByRole("heading", { level: 3, name: "Niets gevonden" }),
    ).toBeInTheDocument();

    fireEvent.click(screen.getByRole("button", { name: "Filters wissen" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });
});

describe("PoiResults' cards", () => {
  const point = getPointOfInterest("sassenpoort")!;

  /* the card is written out in PoiResults, so the grid is what renders it */
  const renderCard = (selectedId: string | null = null, onSelect = () => {}) =>
    renderWithRouter(
      <PoiResults
        points={[point]}
        selectedId={selectedId}
        onSelect={onSelect}
        onReset={() => {}}
      />,
    );

  it("prints the place, its category, its era and how far it is", () => {
    const { container } = renderCard();

    expect(
      screen.getByRole("heading", { level: 3, name: point.name }),
    ).toBeInTheDocument();
    expect(screen.getByText(point.category)).toBeInTheDocument();
    expect(screen.getByText(point.era)).toBeInTheDocument();
    expect(screen.getByText(point.description)).toBeInTheDocument();
    expect(container.textContent).toContain("vanaf de Grote Markt");
  });

  it("offers to put it on the map, and says when it is already there", () => {
    const onSelect = vi.fn();
    const { unmount } = renderCard(null, onSelect);

    fireEvent.click(screen.getByRole("button", { name: "Toon op kaart" }));
    expect(onSelect).toHaveBeenCalledWith(point.id);

    unmount();
    renderCard(point.id);

    expect(screen.getByRole("button", { name: "Op de kaart" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
  });

  it("hands the place to the route builder by url", () => {
    renderCard();

    expect(screen.getByRole("link", { name: "In een route" })).toHaveAttribute(
      "href",
      builderPath([point.id]),
    );
  });

  it("shows the score it was given", () => {
    renderCard();

    expect(screen.getByText("4,9")).toBeInTheDocument();
  });
});
