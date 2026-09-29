import { fireEvent, render, screen } from "@testing-library/react";
import MapLegend from "../../../src/shared/map/mapLegend.tsx";
import MapChip from "../../../src/shared/map/mapChip.tsx";
import RouteShape from "../../../src/shared/map/routeShape.tsx";
import MapSnapshot from "../../../src/shared/map/mapSnapshot.tsx";
import { MapImage } from "../../../src/shared/map/mapArtwork.tsx";
import { MAP_IMAGES } from "../../../src/data/maps.ts";
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

describe("MapChip", () => {
  it("shows its label with a hidden dot", () => {
    const { container } = render(<MapChip label="2 van 9 plekken" />);

    expect(screen.getByText("2 van 9 plekken")).toBeInTheDocument();
    expect(container.querySelector("span span")).toHaveAttribute(
      "aria-hidden",
      "true",
    );
  });

  it("takes a class name for its own placement", () => {
    const { container } = render(
      <MapChip label="Kaart" className="absolute" />,
    );

    expect(container.firstElementChild).toHaveClass("absolute");
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
  /* the static maps service is off in the test environment, which is exactly what the fallback is for */
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
      await import("../../../src/shared/map/mapSnapshot.tsx");
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

    /* a picture the api refuses to serve leaves the shape on screen, for good */
    fireEvent.error(image);

    expect(screen.getByText("de route")).toBeInTheDocument();
    expect(screen.queryByRole("img")).toBeNull();
  });
});

describe("MapImage", () => {
  it("renders the picture with the export's own size", () => {
    render(<MapImage image={MAP_IMAGES.historic} />);
    const image = screen.getByRole("img", { name: MAP_IMAGES.historic.alt });

    expect(image).toHaveAttribute("src", MAP_IMAGES.historic.src);
    expect(image).toHaveAttribute("width", "1520");
    expect(image).toHaveAttribute("height", "984");
  });

  it("loads lazily by default and eagerly when it is the first paint", () => {
    const { rerender } = render(<MapImage image={MAP_IMAGES.satellite} />);
    expect(screen.getByRole("img")).toHaveAttribute("loading", "lazy");

    rerender(<MapImage image={MAP_IMAGES.satellite} priority />);

    const image = screen.getByRole("img");
    expect(image).toHaveAttribute("loading", "eager");
    expect(image.getAttribute("fetchpriority")).toBe("high");
  });

  it("hides a decorative picture from screen readers", () => {
    const { container } = render(
      <MapImage image={MAP_IMAGES.places} decorative />,
    );
    const image = container.querySelector("img");

    expect(image).toHaveAttribute("alt", "");
    expect(image).toHaveAttribute("aria-hidden", "true");
  });

  it("takes a different alt when the caller has better words", () => {
    render(<MapImage image={MAP_IMAGES.places} alt="De kaart van de route" />);

    expect(
      screen.getByRole("img", { name: "De kaart van de route" }),
    ).toBeInTheDocument();
  });

  it("takes a class name for its own sizing", () => {
    const { container } = render(
      <MapImage image={MAP_IMAGES.roads} className="h-full w-full" />,
    );

    expect(container.querySelector("img")).toHaveClass("h-full", "w-full");
  });
});
