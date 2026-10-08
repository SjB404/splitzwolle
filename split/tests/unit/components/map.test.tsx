import { fireEvent, render, screen } from "@testing-library/react";
import MapLegend from "../../../src/components/mapLegend.tsx";
import RouteShape from "../../../src/components/routeShape.tsx";
import MapSnapshot from "../../../src/components/mapSnapshot.tsx";
import type { LatLng } from "../../../src/types.ts";

const POINTS: LatLng[] = [
  { lat: 52.51, lng: 6.09 },
  { lat: 52.52, lng: 6.1 },
  { lat: 52.53, lng: 6.11 },
];

describe("MapLegend", () => {
  it("renders one item per entry, in order", () => {
    render(
      <MapLegend
        items={[
          { shape: "route", label: "Route" },
          { shape: "historic", label: "Plek van toen" },
          { shape: "current", label: "Plek van nu" },
        ]}
      />,
    );

    expect(
      screen.getAllByRole("listitem").map((item) => item.textContent),
    ).toEqual(["Route", "Plek van toen", "Plek van nu"]);
  });

  it("keeps its swatches out of the accessibility tree", () => {
    const { container } = render(
      <MapLegend items={[{ shape: "route", label: "Route" }]} />,
    );

    expect(container.querySelector('[aria-hidden="true"]')).toBeInTheDocument();
  });

  it("renders an empty list for no items", () => {
    const { container } = render(<MapLegend items={[]} />);

    expect(container.querySelectorAll("li")).toHaveLength(0);
  });
});

describe("RouteShape", () => {
  it("draws a casing, a line and one dot per place", () => {
    const { container } = render(<RouteShape points={POINTS} />);

    expect(container.querySelectorAll("polyline")).toHaveLength(2);
    expect(container.querySelectorAll("circle")).toHaveLength(3);
  });

  it("draws the two ends bigger than the stops in between", () => {
    const { container } = render(<RouteShape points={POINTS} />);

    expect(
      [...container.querySelectorAll("circle")].map((dot) =>
        dot.getAttribute("r"),
      ),
    ).toEqual(["6", "4.5", "6"]);
  });

  it("keeps the drawing out of the accessibility tree", () => {
    const { container } = render(<RouteShape points={POINTS} />);

    expect(container.querySelector("svg")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("draws nothing without points", () => {
    const { container } = render(<RouteShape points={[]} />);

    expect(container.firstChild).toBeNull();
  });

  it("drops coordinates that are not real ones", () => {
    const broken = [
      { lat: Number.NaN, lng: 6.09 },
      { lat: 52.52, lng: Number.POSITIVE_INFINITY },
      undefined as unknown as LatLng,
    ];

    const { container } = render(<RouteShape points={broken} />);

    expect(container.firstChild).toBeNull();
  });

  it("draws the good points when only some are broken", () => {
    const partly = [POINTS[0], { lat: Number.NaN, lng: 6.1 }, POINTS[1]];

    const { container } = render(<RouteShape points={partly} />);

    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });

  it("collapses a place the route doubles back on, so no two dots share a key", () => {
    const { container } = render(
      <RouteShape points={[POINTS[0], POINTS[0], POINTS[1]]} />,
    );

    expect(container.querySelectorAll("circle")).toHaveLength(2);
  });

  it("draws a single place as one dot", () => {
    const { container } = render(<RouteShape points={[POINTS[0]]} />);

    expect(container.querySelectorAll("circle")).toHaveLength(1);
  });

  it("keeps its polyline inside the drawing box", () => {
    const { container } = render(<RouteShape points={POINTS} />);
    const polyline = container.querySelector("polyline");

    for (const pair of (polyline?.getAttribute("points") ?? "").split(" ")) {
      const [x, y] = pair.split(",").map(Number);
      expect(x).toBeGreaterThanOrEqual(0);
      expect(x).toBeLessThanOrEqual(320);
      expect(y).toBeGreaterThanOrEqual(0);
      expect(y).toBeLessThanOrEqual(200);
    }
  });
});

describe("MapSnapshot", () => {
  /* static maps is off in tests, so the fallback is what renders */
  it("falls back to the shape it is given when no picture can be asked for", () => {
    render(
      <MapSnapshot
        points={POINTS}
        alt="Kaart met de route"
        fallback={<span>de route</span>}
      />,
    );

    expect(screen.getByText("de route")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });

  it("asks for a picture when the service is switched on, and keeps the fallback if it fails", async () => {
    vi.resetModules();
    vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "test-key");
    vi.stubEnv("VITE_GOOGLE_MAPS_STATIC_MAPS", "true");

    const { default: MapSnapshot } =
      await import("../../../src/components/mapSnapshot.tsx");
    render(
      <MapSnapshot
        points={POINTS}
        alt="Kaart met de route"
        fallback={<span>de route</span>}
      />,
    );

    const image = screen.getByRole("img", { name: "Kaart met de route" });

    expect(image.getAttribute("src")).toContain(
      "maps.googleapis.com/maps/api/staticmap",
    );
    expect(image).toHaveAttribute("loading", "lazy");

    fireEvent.error(image);

    expect(screen.getByText("de route")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});
