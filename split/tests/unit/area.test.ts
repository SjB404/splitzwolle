import {
  AREA_BOUNDS,
  AREA_CENTER,
  AREA_CORNERS,
  AREA_NAME,
  isInArea,
  pointsInArea,
} from "../../src/data/area.ts";
import { POINTS_OF_INTEREST } from "../../src/data/pointsOfInterest.ts";
import type { LatLng } from "../../src/types.ts";

describe("the covered area", () => {
  it("is a box with a south-west and a north-east corner", () => {
    expect(AREA_CORNERS).toEqual({
      southWest: { lat: AREA_BOUNDS.south, lng: AREA_BOUNDS.west },
      northEast: { lat: AREA_BOUNDS.north, lng: AREA_BOUNDS.east },
    });
    expect(AREA_BOUNDS.north).toBeGreaterThan(AREA_BOUNDS.south);
    expect(AREA_BOUNDS.east).toBeGreaterThan(AREA_BOUNDS.west);
  });

  it("has the middle of the box as its centre", () => {
    expect(AREA_CENTER).toEqual({
      lat: (AREA_BOUNDS.south + AREA_BOUNDS.north) / 2,
      lng: (AREA_BOUNDS.west + AREA_BOUNDS.east) / 2,
    });
  });

  it("names the area in Dutch", () => {
    expect(AREA_NAME).toBe("de binnenstad en het Noorder Eiland");
  });
});

describe("isInArea", () => {
  it("accepts the box's own corners and middle", () => {
    expect(isInArea(AREA_CORNERS.southWest)).toBe(true);
    expect(isInArea(AREA_CORNERS.northEast)).toBe(true);
    expect(isInArea(AREA_CENTER)).toBe(true);
  });

  const outside: [string, LatLng][] = [
    [
      "south of the box",
      { lat: AREA_BOUNDS.south - 0.0001, lng: AREA_CENTER.lng },
    ],
    [
      "north of the box",
      { lat: AREA_BOUNDS.north + 0.0001, lng: AREA_CENTER.lng },
    ],
    [
      "west of the box",
      { lat: AREA_CENTER.lat, lng: AREA_BOUNDS.west - 0.0001 },
    ],
    [
      "east of the box",
      { lat: AREA_CENTER.lat, lng: AREA_BOUNDS.east + 0.0001 },
    ],
  ];

  it.each(outside)("rejects a point just %s", (_where, point) => {
    expect(isInArea(point)).toBe(false);
  });
});

describe("pointsInArea", () => {
  it("keeps every place of the dataset inside the box", () => {
    expect(pointsInArea(POINTS_OF_INTEREST)).toHaveLength(
      POINTS_OF_INTEREST.length,
    );
  });

  it("drops the places outside it", () => {
    const faraway = {
      ...POINTS_OF_INTEREST[0],
      id: "kampen",
      coordinates: { lat: 52.555, lng: 5.911 },
    };

    expect(pointsInArea([...POINTS_OF_INTEREST, faraway])).toHaveLength(
      POINTS_OF_INTEREST.length,
    );
  });

  it("answers a new list and leaves the input alone", () => {
    const input = [...POINTS_OF_INTEREST];
    expect(pointsInArea(input)).not.toBe(input);
    expect(input).toHaveLength(POINTS_OF_INTEREST.length);
  });
});
