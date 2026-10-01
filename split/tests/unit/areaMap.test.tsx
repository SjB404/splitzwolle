/* the shared map, exercised with a fake google maps api: the dots, the visit order, the preview card,
   the line and the measured traps (a theme change rebuilds the map, an auth failure falls back). */

import {
  act,
  fireEvent,
  render,
  screen,
  waitFor,
} from "@testing-library/react";
import { installFakeMaps } from "./fakeMaps.ts";
import { POINTS_OF_INTEREST } from "../../src/data/pointsOfInterest.ts";
import { AREA_CENTER } from "../../src/data/area.ts";
import type { PointOfInterest, RouteGeometry } from "../../src/types.ts";

const CURRENT = POINTS_OF_INTEREST.find((point) => point.era === "Nu")!;
const HISTORIC = POINTS_OF_INTEREST.find((point) => point.era === "Toen")!;
const PLACES = [
  CURRENT,
  HISTORIC,
  ...POINTS_OF_INTEREST.filter(
    (point) => point.id !== CURRENT.id && point.id !== HISTORIC.id,
  ),
].slice(0, 3) as PointOfInterest[];
const LINE: RouteGeometry = {
  path: [PLACES[0].coordinates, PLACES[1].coordinates],
  distanceKm: 0.4,
  durationMinutes: 6,
  followsStreets: false,
};

interface MapProps {
  points?: PointOfInterest[];
  line?: RouteGeometry | null;
  order?: Map<string, number>;
  highlightId?: string | null;
  onClickPoint?: (id: string) => void;
  label?: string;
}

/** the component is imported fresh per test, so the api's own module-level state starts clean */
async function renderMap(props: MapProps = {}) {
  vi.resetModules();
  vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", "test-key");

  const built = installFakeMaps();
  const { default: AreaMap } = await import("../../src/shared/map/areaMap.tsx");

  const view = render(<AreaMap {...mapProps(props)} />);

  /* the loader resolves when the api announces itself, exactly as it does in a browser */
  await act(async () => {
    (
      window as unknown as { __zwolleRoutesGoogleMapsReady?: () => void }
    ).__zwolleRoutesGoogleMapsReady?.();
    await Promise.resolve();
  });

  return {
    ...view,
    built,
    remap: async (next: MapProps) => {
      await act(async () => {
        view.rerender(<AreaMap {...mapProps(next)} />);
        await Promise.resolve();
      });
    },
  };
}

function mapProps(props: MapProps) {
  return {
    points: props.points ?? PLACES,
    line: props.line ?? null,
    order: props.order,
    highlightId: props.highlightId ?? null,
    onClickPoint: props.onClickPoint,
    label: props.label ?? "Alle plekken",
    description: "Kaart van de binnenstad.",
  };
}

describe("AreaMap", () => {
  it("builds one map, centred on the covered area", async () => {
    const { built } = await renderMap();

    expect(built.maps).toHaveLength(1);
    expect(built.maps[0].options.center).toEqual(AREA_CENTER);
    expect(built.maps[0].options.colorScheme).toBe("LIGHT");
    expect(built.maps[0].options.mapId).toBeDefined();
  });

  it("frames every place it was given", async () => {
    const { built } = await renderMap();

    expect(built.bounds).toHaveLength(1);
    expect(built.bounds[0]).toEqual(PLACES.map((point) => point.coordinates));
    expect(built.maps[0].fitted?.padding).toBe(56);
  });

  it("drops a dot per place, titled with the place's name", async () => {
    const { built } = await renderMap();

    expect(built.markers).toHaveLength(PLACES.length);
    expect(built.markers.map((marker) => marker.title)).toEqual(
      PLACES.map((point) => point.name),
    );
  });

  it("paints the era on the dot", async () => {
    const { built } = await renderMap();

    const marked = (place: PointOfInterest) =>
      built.markers.find((marker) => marker.title === place.name)!.element;

    expect(marked(CURRENT).className).toContain("border-white bg-orange-500");
    expect(marked(HISTORIC).className).toContain("border-white bg-blue-500");
    expect(marked(CURRENT).textContent).toBe("");
  });

  it("numbers a dot in visit order and enlarges it", async () => {
    const { built } = await renderMap({ order: new Map([[PLACES[0].id, 1]]) });
    const ordered = built.markers.find(
      (marker) => marker.title === PLACES[0].name,
    )!;

    expect(ordered.element.textContent).toBe("1");
    expect(ordered.element.className).toContain("h-6");
    expect(ordered.element.className).toContain("scale-125");
  });

  it("hangs a ring on the place the page is about", async () => {
    const { built } = await renderMap({ highlightId: PLACES[1].id });
    const highlighted = built.markers.find(
      (marker) => marker.title === PLACES[1].name,
    )!;

    expect(highlighted.element.className).toContain("scale-125");
    expect(highlighted.element.textContent).toBe("");
  });

  it("reports a clicked dot with the place's id", async () => {
    const onClickPoint = vi.fn();
    const { built } = await renderMap({ onClickPoint });

    built.markers[1].emit("gmp-click");

    expect(onClickPoint).toHaveBeenCalledWith(PLACES[1].id);
  });

  it("shows a preview card while the pointer is over a dot, and takes it away", async () => {
    const { built } = await renderMap();

    fireEvent.mouseEnter(built.markers[0].element);

    expect(await screen.findByText(PLACES[0].name)).toBeInTheDocument();
    expect(
      screen.getByText(new RegExp(PLACES[0].category)),
    ).toBeInTheDocument();

    fireEvent.mouseLeave(built.markers[0].element);

    await waitFor(() => expect(screen.queryByText(PLACES[0].name)).toBeNull());
  });

  it("draws the line of a planned route as a casing under a brand line", async () => {
    const { built } = await renderMap({ line: LINE });

    expect(built.polylines).toHaveLength(2);
    expect(built.polylines[0].options.strokeColor).toBe("#ffffff");
    expect(built.polylines[1].options.strokeColor).toBe("#f68221");
    expect(built.polylines[0].options.path).toEqual(LINE.path);
  });

  it("draws no line for fewer than two places", async () => {
    const { built } = await renderMap({
      line: { ...LINE, path: [PLACES[0].coordinates] },
    });

    expect(built.polylines).toHaveLength(0);
  });

  it("ignores a path that is not made of coordinates", async () => {
    const broken = {
      ...LINE,
      path: [PLACES[0].coordinates, { lat: Number.NaN, lng: 6 }],
    } as unknown as RouteGeometry;

    const { built } = await renderMap({ line: broken });

    expect(built.polylines).toHaveLength(0);
  });

  it("takes a dot off the map when its place is gone", async () => {
    const { built, remap } = await renderMap();

    await remap({ points: PLACES.slice(0, 2) });

    expect(built.markers[2].map).toBeNull();
    expect(built.markers[0].map).not.toBeNull();
  });

  it("empties its host element when it unmounts", async () => {
    const { built, unmount } = await renderMap({ line: LINE });

    expect(built.maps[0].host.childElementCount).toBe(PLACES.length);

    unmount();

    expect(built.maps[0].host.childElementCount).toBe(0);
  });

  it("spreads the dots again whenever the map settles", async () => {
    const { built } = await renderMap();

    /* the api fires idle when the viewport settles; the dots are nudged apart without throwing */
    expect(() => built.maps[0].emit("idle")).not.toThrow();
    expect(built.markers.every((marker) => marker.element.isConnected)).toBe(
      true,
    );
  });

  it("rebuilds the map when the palette changes, because the api reads the scheme once", async () => {
    const { built } = await renderMap();

    await act(async () => {
      document.body.className = "dark";
      await Promise.resolve();
    });

    await waitFor(() => expect(built.maps).toHaveLength(2));
    expect(built.maps[1].options.colorScheme).toBe("DARK");
  });

  it("falls back to its own panel when the api rejects the key", async () => {
    await renderMap();

    await act(async () => {
      window.gm_authFailure?.();
      await Promise.resolve();
    });

    expect(
      await screen.findByText(/De kaart kon niet geladen worden/),
    ).toBeInTheDocument();
  });

  it("says what the map shows, for a reader who cannot use it", async () => {
    await renderMap();

    expect(screen.getByText("Kaart van de binnenstad.")).toBeInTheDocument();
  });

  it("shows the corner chip it was handed", async () => {
    await renderMap({ label: "2 van 9 plekken" });

    expect(screen.getByText("2 van 9 plekken")).toBeInTheDocument();
  });
});
