import { MAP_IMAGES, MAP_SIZE } from "../../src/data/maps.ts";
import type { MapImageId } from "../../src/types.ts";

const IDS: MapImageId[] = ["historic", "satellite"];

describe("MAP_IMAGES", () => {
  it("describes exactly the two known map exports", () => {
    expect(Object.keys(MAP_IMAGES).sort()).toEqual([...IDS].sort());
  });

  it("gives every one of them a picture and a dutch alt", () => {
    for (const id of IDS) {
      expect(MAP_IMAGES[id].src.length).toBeGreaterThan(0);
      expect(MAP_IMAGES[id].alt.length).toBeGreaterThan(0);
    }
  });

  it("imports the assets instead of pointing at public paths", () => {
    for (const id of IDS) {
      expect(MAP_IMAGES[id].src).toContain("zwolle-");
      expect(MAP_IMAGES[id].src.endsWith(".webp")).toBe(true);
      expect(MAP_IMAGES[id].src.startsWith("/src/assets/maps/")).toBe(true);
    }
  });

  it("points each id at its own file", () => {
    expect(MAP_IMAGES.historic.src).toContain("zwolle-historic-1652");
    expect(MAP_IMAGES.satellite.src).toContain("zwolle-satellite.");
  });

  it("knows the export's own pixel size", () => {
    expect(MAP_SIZE).toEqual({ width: 1520, height: 984 });
  });
});
