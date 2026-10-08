/* the map module had no tests at all: it is the one place the app talks to google, so the api is faked here —
   the loader, the options, the colours and the two api calls are all exercised without a key or a network */

import { AREA_CORNERS, AREA_CENTER } from "../../src/data/area.ts";
import type { LatLng } from "../../src/types.ts";

const PERPELBUS: LatLng = { lat: 52.5121724, lng: 6.0898097 };
const SASSENPOORT: LatLng = { lat: 52.5099842, lng: 6.0955212 };

interface FakeGoogleOptions {
  /* what the routes api answers; throw to refuse the call, like a key without that api does */
  computeRoutes?: (request: RoutesRequest) => unknown | Promise<unknown>;
  onBounds?: (southWest: LatLng, northEast: LatLng) => void;
}

interface RoutesRequest {
  origin: LatLng;
  destination: LatLng;
  intermediates: unknown[];
  travelMode: string;
}

/** one api answer that follows the streets */
function apiRoute(distanceMeters = 1234, durationMillis = 600_000) {
  return {
    routes: [
      {
        path: [PERPELBUS, SASSENPOORT].map((point) => ({
          toJSON: () => point,
        })),
        distanceMeters,
        durationMillis,
      },
    ],
  };
}

function fakeGoogle(options: FakeGoogleOptions = {}) {
  return {
    maps: {
      /* the api's control corners, named member for named member: `mapOptions` reads RIGHT_TOP to pin the zoom control */
      ControlPosition: {
        TOP_LEFT: 1,
        TOP_CENTER: 2,
        TOP_RIGHT: 3,
        LEFT_CENTER: 4,
        LEFT_TOP: 5,
        LEFT_BOTTOM: 6,
        RIGHT_TOP: 7,
        RIGHT_CENTER: 8,
        RIGHT_BOTTOM: 9,
        BOTTOM_LEFT: 10,
        BOTTOM_CENTER: 11,
        BOTTOM_RIGHT: 12,
      },
      /* the api's own bounds class, reduced to the two corners it was handed */
      LatLngBounds: class {
        constructor(southWest: LatLng, northEast: LatLng) {
          options.onBounds?.(southWest, northEast);
        }
      },
      importLibrary: async () => ({
        Route: {
          computeRoutes: async (request: RoutesRequest) =>
            options.computeRoutes ? options.computeRoutes(request) : apiRoute(),
        },
      }),
    },
  };
}

/** a fresh copy of the module, so the session-wide refusals and the request cache never leak between tests */
async function freshModule(
  env: { key?: string; staticMaps?: string; mapId?: string } = {},
) {
  vi.resetModules();
  vi.stubEnv("VITE_GOOGLE_MAPS_API_KEY", env.key ?? "");
  vi.stubEnv("VITE_GOOGLE_MAPS_STATIC_MAPS", env.staticMaps ?? "false");
  vi.stubEnv("VITE_GOOGLE_MAPS_MAP_ID", env.mapId ?? "");

  return await import("../../src/data/googleMaps.ts");
}

describe("the key", () => {
  beforeEach(() => {
    /* a script the loader added in another test must not be counted as this test's */
    document
      .querySelectorAll("script[src*='maps.googleapis.com']")
      .forEach((script) => script.remove());
  });

  it("is absent in a checkout without one, which is what sends every map to its fallback", async () => {
    const maps = await freshModule();

    expect(maps.hasGoogleMapsKey).toBe(false);
    expect(maps.hasStaticMaps).toBe(false);
  });

  it("is read from the environment, and the static maps service is a second switch", async () => {
    const off = await freshModule({ key: "test-key" });
    expect(off.hasGoogleMapsKey).toBe(true);
    expect(off.hasStaticMaps).toBe(false);

    const on = await freshModule({ key: "test-key", staticMaps: "true" });
    expect(on.hasStaticMaps).toBe(true);
  });

  it("ignores a key that is only whitespace", async () => {
    const maps = await freshModule({ key: "   " });

    expect(maps.hasGoogleMapsKey).toBe(false);
  });
});

describe("loadGoogleMaps", () => {
  beforeEach(() => {
    document
      .querySelectorAll("script[src*='maps.googleapis.com']")
      .forEach((script) => script.remove());
  });

  it("refuses without a key, and adds no script", async () => {
    const maps = await freshModule();

    await expect(maps.loadGoogleMaps()).rejects.toThrow(
      "VITE_GOOGLE_MAPS_API_KEY is not set",
    );
    expect(
      document.querySelectorAll("script[src*='maps.googleapis.com']"),
    ).toHaveLength(0);
  });

  it("loads the api once, with the parameters the app needs", async () => {
    const maps = await freshModule({ key: "test-key" });

    const first = maps.loadGoogleMaps();
    const second = maps.loadGoogleMaps();

    expect(second).toBe(first);

    const scripts = document.querySelectorAll<HTMLScriptElement>(
      "script[src*='maps.googleapis.com']",
    );
    expect(scripts).toHaveLength(1);

    const url = new URL(scripts[0].src);
    expect(url.searchParams.get("key")).toBe("test-key");
    expect(url.searchParams.get("v")).toBe("weekly");
    expect(url.searchParams.get("loading")).toBe("async");
    expect(url.searchParams.get("libraries")).toBe("maps,marker");
    expect(url.searchParams.get("language")).toBe("nl");
    expect(url.searchParams.get("region")).toBe("NL");
    expect(url.searchParams.get("callback")).toBe(
      "__zwolleRoutesGoogleMapsReady",
    );
    expect(scripts[0].async).toBe(true);

    /* the api announces itself through the callback the loader installed */
    (
      window as unknown as { __zwolleRoutesGoogleMapsReady: () => void }
    ).__zwolleRoutesGoogleMapsReady();
    await expect(first).resolves.toBeUndefined();
  });

  it("reports a rejected key to whoever is listening, at once or later", async () => {
    const maps = await freshModule({ key: "test-key" });
    const early = vi.fn();
    const late = vi.fn();

    const unsubscribe = maps.onGoogleMapsAuthFailure(early);
    /* the loader is what installs the api's own failure hook */
    void maps.loadGoogleMaps();
    window.gm_authFailure?.();

    expect(early).toHaveBeenCalledTimes(1);

    /* a map that mounts after the failure still has to hear about it */
    maps.onGoogleMapsAuthFailure(late);
    expect(late).toHaveBeenCalledTimes(1);

    unsubscribe();
    window.gm_authFailure?.();
    expect(early).toHaveBeenCalledTimes(1);
  });

  it("does not call a listener before the key is rejected", async () => {
    const maps = await freshModule({ key: "test-key" });
    const listener = vi.fn();

    maps.onGoogleMapsAuthFailure(listener);

    expect(listener).not.toHaveBeenCalled();
  });
});

describe("mapOptions", () => {
  it("centres on the covered area and cannot be panned out of it", async () => {
    const maps = await freshModule({ key: "test-key" });
    let bounds: { southWest: LatLng; northEast: LatLng } | null = null;

    vi.stubGlobal(
      "google",
      fakeGoogle({
        onBounds: (southWest, northEast) => (bounds = { southWest, northEast }),
      }),
    );

    const options = maps.mapOptions();

    expect(options.center).toEqual(AREA_CENTER);
    expect(options.zoom).toBe(14);
    expect(options.minZoom).toBe(13);
    expect(options.gestureHandling).toBe("cooperative");
    expect(options.disableDefaultUI).toBe(true);
    expect(options.clickableIcons).toBe(false);
    /* the zoom control is the api's chrome the map keeps, and it is pinned to the top-right: the bottom-right corner is the share button's (DESIGN.md §7, §8) */
    expect(options.zoomControlOptions).toEqual({
      position: 7,
    });
    expect(bounds).toEqual(AREA_CORNERS);
    /* strictBounds would also stop fitBounds from framing the places, which is a measured trap */
    expect(options.restriction).not.toHaveProperty("strictBounds");
  });

  it("uses the api's development map id until the project has a cloud one", async () => {
    const demo = await freshModule({ key: "test-key" });
    vi.stubGlobal("google", fakeGoogle({ onBounds: () => {} }));
    expect(demo.mapOptions().mapId).toBe("DEMO_MAP_ID");

    const cloud = await freshModule({ key: "test-key", mapId: "cloud-id" });
    vi.stubGlobal("google", fakeGoogle({ onBounds: () => {} }));
    expect(cloud.mapOptions().mapId).toBe("cloud-id");
  });

  it("builds fresh bounds every time, because the api does not exist at import time", async () => {
    const maps = await freshModule({ key: "test-key" });
    const onBounds = vi.fn();
    vi.stubGlobal("google", fakeGoogle({ onBounds }));

    maps.mapOptions();
    maps.mapOptions();

    expect(onBounds).toHaveBeenCalledTimes(2);
  });
});

describe("routeLineColors", () => {
  it("draws the brand orange over a white casing", async () => {
    const maps = await freshModule({ key: "test-key" });

    expect(maps.routeLineColors()).toEqual({
      line: "#f68221",
      casing: "#ffffff",
    });
  });

  it("reads the colour off the theme when the token is there", async () => {
    const maps = await freshModule({ key: "test-key" });
    document.body.style.setProperty("--color-orange-500", "#123456");

    expect(maps.routeLineColors().line).toBe("#123456");

    document.body.style.removeProperty("--color-orange-500");
  });
});

describe("mapColorScheme", () => {
  it("follows the class on <body>, because the tiles paint themselves", async () => {
    const maps = await freshModule({ key: "test-key" });

    document.body.className = "light";
    expect(maps.mapColorScheme()).toBe("LIGHT");

    document.body.className = "dark";
    expect(maps.mapColorScheme()).toBe("DARK");
  });
});

describe("staticMapUrl", () => {
  it("answers nothing without a key, or without a place to draw", async () => {
    const withoutKey = await freshModule();
    expect(withoutKey.staticMapUrl([PERPELBUS])).toBeNull();

    const maps = await freshModule({ key: "test-key" });
    expect(maps.staticMapUrl([])).toBeNull();
  });

  it("asks for a card sized picture of one place", async () => {
    const maps = await freshModule({ key: "test-key" });

    const url = maps.staticMapUrl([PERPELBUS])!;

    expect(url).toContain("size=320x200");
    expect(url).toContain("scale=2");
    expect(url).toContain(`center=${PERPELBUS.lat},${PERPELBUS.lng}`);
    expect(url).toContain("zoom=16");
    expect(url).toContain("markers=color:0xf68221|size:small");
    /* one place is a marker, not a line */
    expect(url).not.toContain("path=");
  });

  it("draws a line through the places when there are two or more", async () => {
    const maps = await freshModule({ key: "test-key" });

    const url = maps.staticMapUrl([PERPELBUS, SASSENPOORT])!;

    expect(url).toContain(
      `path=color:0xf68221ff|weight:4|${PERPELBUS.lat},${PERPELBUS.lng}|${SASSENPOORT.lat},${SASSENPOORT.lng}`,
    );
    expect(url).not.toContain("center=");
  });
});

describe("requestDirections", () => {
  it("answers nothing for fewer than two places, without calling the api", async () => {
    const maps = await freshModule({ key: "test-key" });
    const computeRoutes = vi.fn();
    vi.stubGlobal("google", fakeGoogle({ computeRoutes }));

    await expect(maps.requestDirections([], "walking")).resolves.toBeNull();
    await expect(
      maps.requestDirections([PERPELBUS], "walking"),
    ).resolves.toBeNull();
    expect(computeRoutes).not.toHaveBeenCalled();
  });

  it("turns the api's answer into the app's own geometry", async () => {
    const maps = await freshModule({ key: "test-key" });
    vi.stubGlobal(
      "google",
      fakeGoogle({ computeRoutes: () => apiRoute(1234, 600_000) }),
    );

    const geometry = await maps.requestDirections(
      [PERPELBUS, SASSENPOORT],
      "walking",
    );

    expect(geometry).toEqual({
      path: [PERPELBUS, SASSENPOORT],
      distanceKm: 1.234,
      durationMinutes: 10,
      followsStreets: true,
    });
  });

  it("asks in the api's own spelling of the two ways of travelling", async () => {
    const maps = await freshModule({ key: "test-key" });
    const requests: RoutesRequest[] = [];
    vi.stubGlobal(
      "google",
      fakeGoogle({
        computeRoutes: (request) => {
          requests.push(request);
          return apiRoute();
        },
      }),
    );

    await maps.requestDirections([PERPELBUS, SASSENPOORT], "walking");
    await maps.requestDirections([SASSENPOORT, PERPELBUS], "bicycling");

    expect(requests[0].travelMode).toBe("WALKING");
    expect(requests[1].travelMode).toBe("BICYCLING");
  });

  it("sends the places in between as waypoints and keeps the ends", async () => {
    const maps = await freshModule({ key: "test-key" });
    const requests: RoutesRequest[] = [];
    vi.stubGlobal(
      "google",
      fakeGoogle({
        computeRoutes: (request) => {
          requests.push(request);
          return apiRoute();
        },
      }),
    );

    await maps.requestDirections(
      [PERPELBUS, SASSENPOORT, { lat: 52.52, lng: 6.1 }],
      "walking",
    );

    expect(requests[0].origin).toEqual(PERPELBUS);
    expect(requests[0].destination).toEqual({ lat: 52.52, lng: 6.1 });
    expect(requests[0].intermediates).toHaveLength(1);
  });

  it("never takes one minute off a short walk", async () => {
    const maps = await freshModule({ key: "test-key" });
    vi.stubGlobal(
      "google",
      fakeGoogle({ computeRoutes: () => apiRoute(90, 20_000) }),
    );

    const geometry = await maps.requestDirections(
      [PERPELBUS, SASSENPOORT],
      "walking",
    );

    expect(geometry?.durationMinutes).toBe(1);
  });

  it("answers null when the api has no route to give", async () => {
    const noRoutes = await freshModule({ key: "test-key" });
    vi.stubGlobal(
      "google",
      fakeGoogle({ computeRoutes: () => ({ routes: [] }) }),
    );
    expect(
      await noRoutes.requestDirections([PERPELBUS, SASSENPOORT], "walking"),
    ).toBeNull();

    const onePoint = await freshModule({ key: "test-key" });
    vi.stubGlobal(
      "google",
      fakeGoogle({
        computeRoutes: () => ({
          routes: [
            {
              path: [{ toJSON: () => PERPELBUS }],
              distanceMeters: 0,
              durationMillis: 0,
            },
          ],
        }),
      }),
    );
    expect(
      await onePoint.requestDirections([PERPELBUS, SASSENPOORT], "walking"),
    ).toBeNull();
  });

  it("remembers a refusal for the session instead of asking again", async () => {
    const maps = await freshModule({ key: "test-key" });
    const computeRoutes = vi.fn(() => {
      throw new Error("REQUEST_DENIED");
    });
    vi.stubGlobal("google", fakeGoogle({ computeRoutes }));

    await expect(
      maps.requestDirections([PERPELBUS, SASSENPOORT], "walking"),
    ).resolves.toBeNull();
    await expect(
      maps.requestDirections([SASSENPOORT, PERPELBUS], "bicycling"),
    ).resolves.toBeNull();

    expect(computeRoutes).toHaveBeenCalledTimes(1);
  });

  it("answers the same question from memory, so a reader is not charged twice", async () => {
    const maps = await freshModule({ key: "test-key" });
    const computeRoutes = vi.fn(() => apiRoute());
    vi.stubGlobal("google", fakeGoogle({ computeRoutes }));

    const first = await maps.requestDirections(
      [PERPELBUS, SASSENPOORT],
      "walking",
    );
    const second = await maps.requestDirections(
      [PERPELBUS, SASSENPOORT],
      "walking",
    );

    expect(computeRoutes).toHaveBeenCalledTimes(1);
    expect(second).toEqual(first);
  });

  it("caches a no-route answer too", async () => {
    const maps = await freshModule({ key: "test-key" });
    const computeRoutes = vi.fn(() => ({ routes: [] }));
    vi.stubGlobal("google", fakeGoogle({ computeRoutes }));

    await maps.requestDirections([PERPELBUS, SASSENPOORT], "walking");
    await maps.requestDirections([PERPELBUS, SASSENPOORT], "walking");

    expect(computeRoutes).toHaveBeenCalledTimes(1);
  });

  it("does not treat the same places in another order as the same question", async () => {
    const maps = await freshModule({ key: "test-key" });
    const computeRoutes = vi.fn(() => apiRoute());
    vi.stubGlobal("google", fakeGoogle({ computeRoutes }));

    await maps.requestDirections([PERPELBUS, SASSENPOORT], "walking");
    await maps.requestDirections([SASSENPOORT, PERPELBUS], "walking");

    expect(computeRoutes).toHaveBeenCalledTimes(2);
  });
});
