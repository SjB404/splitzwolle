import {
  PACE_KM_PER_HOUR,
  STREET_FACTOR,
  haversineKm,
  minutesFor,
  straightRoute,
} from "../../src/data/routeGeometry.ts";
import type { LatLng } from "../../src/types.ts";

const GROTE_MARKT: LatLng = { lat: 52.5122429, lng: 6.0927568 };
const MELKMARKT: LatLng = { lat: 52.5129579, lng: 6.0912076 };

describe("haversineKm", () => {
  it("is zero for a point and itself", () => {
    expect(haversineKm(GROTE_MARKT, GROTE_MARKT)).toBe(0);
  });

  it("is symmetric", () => {
    expect(haversineKm(GROTE_MARKT, MELKMARKT)).toBeCloseTo(
      haversineKm(MELKMARKT, GROTE_MARKT),
      12,
    );
  });

  it("measures one degree of latitude as 111,2 km", () => {
    const distance = haversineKm({ lat: 52, lng: 6 }, { lat: 53, lng: 6 });
    expect(distance).toBeGreaterThan(111.1);
    expect(distance).toBeLessThan(111.3);
  });

  it("measures one degree of longitude at the equator as 111,2 km", () => {
    const distance = haversineKm({ lat: 0, lng: 0 }, { lat: 0, lng: 1 });
    expect(distance).toBeGreaterThan(111.1);
    expect(distance).toBeLessThan(111.3);
  });

  it("measures the walk across the Grote Markt in tens of metres", () => {
    const distance = haversineKm(GROTE_MARKT, MELKMARKT);
    expect(distance).toBeGreaterThan(0.05);
    expect(distance).toBeLessThan(0.25);
  });
});

describe("minutesFor", () => {
  it("uses the pace of the way of travelling", () => {
    expect(minutesFor(PACE_KM_PER_HOUR.walking, "walking")).toBe(60);
    expect(minutesFor(PACE_KM_PER_HOUR.bicycling, "bicycling")).toBe(60);
  });

  it("rounds to whole minutes", () => {
    expect(minutesFor(1.1, "walking")).toBe(15);
    expect(minutesFor(1.8, "walking")).toBe(24);
  });

  it("never answers less than a minute", () => {
    expect(minutesFor(0, "walking")).toBe(1);
    expect(minutesFor(0.001, "bicycling")).toBe(1);
  });
});

describe("straightRoute", () => {
  const points = [GROTE_MARKT, MELKMARKT];

  it("keeps the points as the path", () => {
    expect(straightRoute(points, "walking").path).toBe(points);
  });

  it("lengthens the crow-flies distance by the street factor", () => {
    const route = straightRoute(points, "walking");

    expect(route.distanceKm).toBeCloseTo(
      haversineKm(GROTE_MARKT, MELKMARKT) * STREET_FACTOR,
      12,
    );
  });

  it("says the line does not follow the streets", () => {
    expect(straightRoute(points, "walking").followsStreets).toBe(false);
  });

  it("takes the duration from the distance and the pace", () => {
    const route = straightRoute(points, "walking");
    expect(route.durationMinutes).toBe(minutesFor(route.distanceKm, "walking"));
  });

  it("adds up every leg of a four stop route", () => {
    const four = [
      { lat: 52.5122429, lng: 6.0927568 },
      { lat: 52.5129579, lng: 6.0912076 },
      { lat: 52.5099842, lng: 6.0955212 },
      { lat: 52.5091092, lng: 6.0889634 },
    ];
    const expected =
      (haversineKm(four[0], four[1]) +
        haversineKm(four[1], four[2]) +
        haversineKm(four[2], four[3])) *
      STREET_FACTOR;

    expect(straightRoute(four, "bicycling").distanceKm).toBeCloseTo(
      expected,
      12,
    );
  });

  it("answers an empty route for fewer than two points", () => {
    const empty = straightRoute([], "walking");
    expect(empty.distanceKm).toBe(0);
    expect(empty.path).toEqual([]);
    expect(straightRoute([GROTE_MARKT], "walking").distanceKm).toBe(0);
  });
});
