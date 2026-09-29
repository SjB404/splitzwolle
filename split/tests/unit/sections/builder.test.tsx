import { fireEvent, screen } from "@testing-library/react";
import PoiPicker from "../../../src/sections/routes/poiPicker.tsx";
import RoutePlanSummary from "../../../src/sections/routes/routePlanSummary.tsx";
import type { PlannedRoute } from "../../../src/shared/map/usePlannedRoute.ts";
import { POINTS_OF_INTEREST } from "../../../src/data/pointsOfInterest.ts";
import { renderWithRouter } from "../helpers.tsx";
import type { PointOfInterest, TravelMode } from "../../../src/types.ts";

const PICKER = {
  points: POINTS_OF_INTEREST,
  pickedIds: [] as string[],
  mode: "walking" as TravelMode,
  onToggle: () => {},
  onModeChange: () => {},
  onReset: () => {},
};

describe("PoiPicker", () => {
  it("offers the two ways of travelling, with the current one pressed", () => {
    renderWithRouter(<PoiPicker {...PICKER} />);

    expect(screen.getByRole("button", { name: "Lopen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Fietsen" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("presses the mode it is on", () => {
    renderWithRouter(<PoiPicker {...PICKER} mode="bicycling" />);

    expect(screen.getByRole("button", { name: "Fietsen" })).toHaveAttribute(
      "aria-pressed",
      "true",
    );
    expect(screen.getByRole("button", { name: "Lopen" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports a change of mode", () => {
    const onModeChange = vi.fn();
    renderWithRouter(<PoiPicker {...PICKER} onModeChange={onModeChange} />);

    fireEvent.click(screen.getByRole("button", { name: "Fietsen" }));

    expect(onModeChange).toHaveBeenCalledWith("bicycling");
  });

  it("groups the places by the era they belong to", () => {
    renderWithRouter(<PoiPicker {...PICKER} />);

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Plekken van toen — op de historische kaart/,
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole("heading", {
        level: 3,
        name: /Plekken van nu — wat de stad vandaag is/,
      }),
    ).toBeInTheDocument();
  });

  it("offers every place in the area as a chip", () => {
    renderWithRouter(<PoiPicker {...PICKER} />);

    /* two mode chips plus one per place */
    expect(screen.getAllByRole("button")).toHaveLength(
      2 + POINTS_OF_INTEREST.length,
    );
    expect(screen.getByRole("button", { name: "De Peperbus" })).toHaveAttribute(
      "aria-pressed",
      "false",
    );
  });

  it("reports a toggle with the place's id", () => {
    const onToggle = vi.fn();
    renderWithRouter(<PoiPicker {...PICKER} onToggle={onToggle} />);

    fireEvent.click(screen.getByRole("button", { name: "Sassenpoort" }));

    expect(onToggle).toHaveBeenCalledWith("sassenpoort");
  });

  it("numbers a picked place in visit order, on the chip", () => {
    renderWithRouter(
      <PoiPicker {...PICKER} pickedIds={["sassenpoort", "peperbus"]} />,
    );

    expect(
      screen.getByRole("button", { name: "1. Sassenpoort" }),
    ).toHaveAttribute("aria-pressed", "true");
    expect(
      screen.getByRole("button", { name: "2. De Peperbus" }),
    ).toBeInTheDocument();
  });

  it("offers the reset only once something is picked", () => {
    const { unmount } = renderWithRouter(<PoiPicker {...PICKER} />);

    expect(
      screen.queryByRole("button", { name: "Selectie wissen" }),
    ).toBeNull();

    unmount();
    const onReset = vi.fn();
    renderWithRouter(
      <PoiPicker {...PICKER} pickedIds={["peperbus"]} onReset={onReset} />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Selectie wissen" }));
    expect(onReset).toHaveBeenCalledTimes(1);
  });

  it("skips an era that has no places", () => {
    const onlyNow = POINTS_OF_INTEREST.filter((point) => point.era === "Nu");
    renderWithRouter(<PoiPicker {...PICKER} points={onlyNow} />);

    expect(
      screen.queryByRole("heading", { level: 3, name: /Plekken van toen/ }),
    ).toBeNull();
    expect(
      screen.getByRole("heading", { level: 3, name: /Plekken van nu/ }),
    ).toBeInTheDocument();
  });
});

describe("RoutePlanSummary", () => {
  const stop = (id: string) =>
    POINTS_OF_INTEREST.find((point) => point.id === id) as PointOfInterest;

  function plan(
    points: PointOfInterest[],
    patch: Partial<PlannedRoute> = {},
  ): PlannedRoute {
    return {
      path: points.map((point) => point.coordinates),
      distanceKm: 0.6,
      durationMinutes: 8,
      followsStreets: false,
      points,
      mode: "walking",
      pending: false,
      ...patch,
    };
  }

  it("asks for two places when nothing is picked", () => {
    renderWithRouter(<RoutePlanSummary plan={plan([])} onReset={() => {}} />);

    expect(
      screen.getByText("Kies twee of meer plekken om een route te maken."),
    ).toBeInTheDocument();
  });

  it("asks for one more place when only one is picked", () => {
    renderWithRouter(
      <RoutePlanSummary plan={plan([stop("peperbus")])} onReset={() => {}} />,
    );

    expect(
      screen.getByText(
        "Kies nog een plek: een route heeft minstens twee stopplaatsen.",
      ),
    ).toBeInTheDocument();
  });

  it("lists the stops in visit order, with each one's era", () => {
    const points = [stop("sassenpoort"), stop("peperbus"), stop("melkmarkt")];
    renderWithRouter(
      <RoutePlanSummary plan={plan(points)} onReset={() => {}} />,
    );

    expect(screen.getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByText("Sassenpoort")).toBeInTheDocument();
    expect(screen.getByText("De Peperbus")).toBeInTheDocument();
    expect(screen.getByText("Melkmarkt")).toBeInTheDocument();
    expect(screen.getAllByText("Toen")).toHaveLength(3);
  });

  it("counts the stops and names the way of travelling", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")])}
        onReset={() => {}}
      />,
    );
    expect(
      screen.getByRole("heading", { level: 3, name: "2 stopplaatsen, lopen" }),
    ).toBeInTheDocument();
  });

  it("names the bicycle when the plan is a bicycle ride", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")], {
          mode: "bicycling",
        })}
        onReset={() => {}}
      />,
    );

    expect(
      screen.getByRole("heading", {
        level: 3,
        name: "2 stopplaatsen, fietsen",
      }),
    ).toBeInTheDocument();
  });

  it("prints the distance and the duration in dutch", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")])}
        onReset={() => {}}
      />,
    );

    expect(screen.getByText("Afstand")).toBeInTheDocument();
    expect(screen.getByText("0,6 km")).toBeInTheDocument();
    expect(screen.getByText("Duur")).toBeInTheDocument();
    expect(screen.getByText("8 min")).toBeInTheDocument();
  });

  it("says the route is still being worked out while it waits for the api", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")], { pending: true })}
        onReset={() => {}}
      />,
    );

    expect(screen.getByText("De route wordt berekend…")).toHaveAttribute(
      "aria-live",
      "polite",
    );
  });

  it("says when the numbers came from the streets", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")], {
          followsStreets: true,
        })}
        onReset={() => {}}
      />,
    );

    expect(
      screen.getByText(
        "Via de straten, berekend met de routes van Google Maps.",
      ),
    ).toBeInTheDocument();
  });

  it("says when the numbers are only a straight-line estimate", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")])}
        onReset={() => {}}
      />,
    );

    expect(
      screen.getByText(
        "Hemelsbreed geschat: de route kon niet via de straten berekend worden.",
      ),
    ).toBeInTheDocument();
  });

  it("offers the way out to a real navigation app", () => {
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")])}
        onReset={() => {}}
      />,
    );

    const link = screen.getByRole("link", { name: "Open in Google Maps" });

    expect(link).toHaveAttribute("target", "_blank");
    expect(link.getAttribute("href")).toContain(
      "https://www.google.com/maps/dir/?api=1",
    );
    expect(link.getAttribute("href")).toContain("travelmode=walking");
  });

  it("clears the selection", () => {
    const onReset = vi.fn();
    renderWithRouter(
      <RoutePlanSummary
        plan={plan([stop("peperbus"), stop("melkmarkt")])}
        onReset={onReset}
      />,
    );

    fireEvent.click(screen.getByRole("button", { name: "Selectie wissen" }));

    expect(onReset).toHaveBeenCalledTimes(1);
  });
});
