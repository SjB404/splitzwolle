import { directionsUrl } from "../../src/data/directions.ts";
import type { LatLng } from "../../src/types.ts";

const ONE: LatLng = { lat: 52.5, lng: 6.09 };
const TWO: LatLng = { lat: 52.51, lng: 6.1 };
const THREE: LatLng = { lat: 52.52, lng: 6.11 };

describe("directionsUrl", () => {
  it("sends two places as origin and destination, without waypoints", () => {
    expect(directionsUrl([ONE, TWO], "walking")).toBe(
      "https://www.google.com/maps/dir/?api=1&origin=52.5,6.09&destination=52.51,6.1&travelmode=walking",
    );
  });

  it("carries the way of travelling through", () => {
    expect(directionsUrl([ONE, TWO], "bicycling")).toContain(
      "travelmode=bicycling",
    );
  });

  it("puts the places in between on the waypoints list", () => {
    const url = directionsUrl([ONE, TWO, THREE], "walking");
    expect(url).toContain("origin=52.5,6.09");
    expect(url).toContain("destination=52.52,6.11");
    expect(url).toContain("waypoints=52.51,6.1");
  });

  it("joins several waypoints with a literal pipe", () => {
    const url = directionsUrl(
      [ONE, TWO, THREE, { lat: 52.53, lng: 6.12 }],
      "bicycling",
    );
    expect(url).toContain("waypoints=52.51,6.1|52.52,6.11");
  });

  it("leaves the coordinates, commas, pipes and colons unencoded", () => {
    const url = directionsUrl([ONE, TWO, THREE], "walking");
    expect(url).not.toContain("%2C");
    expect(url).not.toContain("%7C");
  });

  it("always starts at the api's own host and format", () => {
    expect(directionsUrl([ONE, TWO], "walking")).toMatch(
      /^https:\/\/www\.google\.com\/maps\/dir\/\?api=1&/,
    );
  });
});
