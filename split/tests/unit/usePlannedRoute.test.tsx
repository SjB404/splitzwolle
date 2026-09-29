/* the hook that turns picked places into a route: the estimate is there at once, the api's answer replaces
   it when it arrives, and an answer for a choice the reader has already left behind is never drawn */

import { act, renderHook, waitFor } from "@testing-library/react";
import {
  STREET_FACTOR,
  haversineKm,
  straightRoute,
} from "../../src/data/routeGeometry.ts";
import { POINTS_OF_INTEREST } from "../../src/data/pointsOfInterest.ts";
import type { PlannedRoute } from "../../src/shared/map/usePlannedRoute.ts";
import type { PointOfInterest, TravelMode } from "../../src/types.ts";

const PLACES = POINTS_OF_INTEREST.slice(0, 3) as PointOfInterest[];
const COORDINATES = PLACES.map((place) => place.coordinates);

interface PlanHookProps {
  points: PointOfInterest[];
  mode: TravelMode;
}

/* the hook is imported fresh per test: the module it reads keeps a session-wide refusal and a request cache */
let planHook: (points: PointOfInterest[], mode: TravelMode) => PlannedRoute;

async function loadHook() {
  vi.resetModules();
  const mod = await import("../../src/shared/map/usePlannedRoute.ts");
  planHook = mod.usePlannedRoute;
}

/* a named wrapper, which is what lets the lint rule see a hook rather than a bare call */
function usePlan({ points, mode }: PlanHookProps) {
  return planHook(points, mode);
}

interface Request {
  travelMode: string;
}

function apiRoute(distanceMeters = 1234, durationMillis = 600_000) {
  return {
    routes: [
      {
        path: COORDINATES.slice(0, 2).map((point) => ({ toJSON: () => point })),
        distanceMeters,
        durationMillis,
      },
    ],
  };
}

/** a fake api that records what it was asked and lets the test decide when it answers */
function fakeGoogle(answer: (request: Request, call: number) => unknown) {
  const requests: Request[] = [];

  vi.stubGlobal("google", {
    maps: {
      importLibrary: async () => ({
        Route: {
          computeRoutes: async (request: Request) => {
            requests.push(request);
            return answer(request, requests.length);
          },
        },
      }),
    },
  });

  return requests;
}

function deferred<T>() {
  let resolve!: (value: T) => void;
  const promise = new Promise<T>((settle) => {
    resolve = settle;
  });

  return { promise, resolve };
}

describe("usePlannedRoute", () => {
  it("answers with nothing to plan for fewer than two places", async () => {
    await loadHook();
    const requests = fakeGoogle(() => apiRoute());
    const points = PLACES.slice(0, 1);

    const { result } = renderHook(usePlan, {
      initialProps: { points, mode: "walking" as TravelMode },
    });

    expect(result.current.pending).toBe(false);
    expect(result.current.distanceKm).toBe(0);
    /* one place is no route, so the path is just that place */
    expect(result.current.path).toEqual([COORDINATES[0]]);
    expect(result.current.points).toEqual(points);
    expect(requests).toHaveLength(0);
  });

  it("has the straight-line estimate ready before the api answers", async () => {
    await loadHook();
    fakeGoogle(() => apiRoute());

    const { result } = renderHook(usePlan, {
      initialProps: {
        points: PLACES.slice(0, 2),
        mode: "walking" as TravelMode,
      },
    });

    const estimate = straightRoute(COORDINATES.slice(0, 2), "walking");

    expect(result.current.pending).toBe(true);
    expect(result.current.followsStreets).toBe(false);
    expect(result.current.distanceKm).toBeCloseTo(estimate.distanceKm, 12);
  });

  it("keeps the estimate when the api will not answer", async () => {
    await loadHook();
    /* no fake api at all: the module reaches for a google that is not there, and refuses */

    const { result } = renderHook(usePlan, {
      initialProps: {
        points: PLACES.slice(0, 2),
        mode: "walking" as TravelMode,
      },
    });

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.followsStreets).toBe(false);
    expect(result.current.distanceKm).toBeCloseTo(
      haversineKm(COORDINATES[0], COORDINATES[1]) * STREET_FACTOR,
      12,
    );
    expect(result.current.mode).toBe("walking");
  });

  it("wears the api's own line when it has one", async () => {
    await loadHook();
    fakeGoogle(() => apiRoute(1234, 600_000));

    const { result } = renderHook(usePlan, {
      initialProps: {
        points: PLACES.slice(0, 2),
        mode: "walking" as TravelMode,
      },
    });

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(result.current.followsStreets).toBe(true);
    expect(result.current.distanceKm).toBe(1.234);
    expect(result.current.durationMinutes).toBe(10);
  });

  it("sends the whole way, in visit order", async () => {
    await loadHook();
    const requests = fakeGoogle(() => apiRoute());

    const { result } = renderHook(usePlan, {
      initialProps: { points: PLACES, mode: "walking" as TravelMode },
    });

    await waitFor(() => expect(result.current.pending).toBe(false));

    expect(requests).toHaveLength(1);
    expect(requests[0].travelMode).toBe("WALKING");
  });

  it("asks again when the reader switches to the bicycle", async () => {
    await loadHook();
    const requests = fakeGoogle(() => apiRoute());

    const { result, rerender } = renderHook(usePlan, {
      initialProps: {
        points: PLACES.slice(0, 2),
        mode: "walking" as TravelMode,
      },
    });

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(requests[0].travelMode).toBe("WALKING");

    rerender({ points: PLACES.slice(0, 2), mode: "bicycling" });

    expect(result.current.pending).toBe(true);
    expect(result.current.mode).toBe("bicycling");

    await waitFor(() => expect(result.current.pending).toBe(false));
    expect(requests[1].travelMode).toBe("BICYCLING");
  });

  it("never keeps an answer for places the reader has left behind", async () => {
    await loadHook();
    fakeGoogle(() => apiRoute(1234, 600_000));

    const { result, rerender } = renderHook(usePlan, {
      initialProps: {
        points: PLACES.slice(0, 2),
        mode: "walking" as TravelMode,
      },
    });

    await waitFor(() => expect(result.current.followsStreets).toBe(true));

    rerender({ points: PLACES, mode: "walking" });

    /* three places were never asked about, so the estimate stands in until they are */
    expect(result.current.pending).toBe(true);
    expect(result.current.followsStreets).toBe(false);
    expect(result.current.distanceKm).toBeCloseTo(
      straightRoute(COORDINATES, "walking").distanceKm,
      12,
    );
  });

  it("drops an answer that arrives for a choice that is already gone", async () => {
    await loadHook();
    const slow = deferred<unknown>();

    /* the first question is answered late, the second never: what is left on screen is the estimate */
    fakeGoogle((_request, call) =>
      call === 1 ? slow.promise : new Promise(() => {}),
    );

    const { result, rerender } = renderHook(usePlan, {
      initialProps: {
        points: PLACES.slice(0, 2),
        mode: "walking" as TravelMode,
      },
    });

    expect(result.current.pending).toBe(true);

    rerender({ points: PLACES, mode: "walking" });

    await act(async () => {
      slow.resolve(apiRoute());
      await Promise.resolve();
    });

    expect(result.current.points).toEqual(PLACES);
    expect(result.current.pending).toBe(true);
    expect(result.current.followsStreets).toBe(false);
  });
});
