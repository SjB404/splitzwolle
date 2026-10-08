import { POINTS_OF_INTEREST, getPointOfInterest } from "../../src/data/pointsOfInterest.ts";
import { PLACE_IMAGES } from "../../src/data/placeImages.ts";

describe("the place pictures", () => {
  /* neither a stray key nor a missing one throws; both fall back silently */
  it("keys every place, and only places that exist", () => {
    expect(Object.keys(PLACE_IMAGES).sort()).toEqual(
      POINTS_OF_INTEREST.map((point) => point.id).sort(),
    );
  });

  it.each(Object.entries(PLACE_IMAGES))(
    "resolves %s to an imported file",
    (id, url) => {
      expect.soft(getPointOfInterest(id)).toBeDefined();
      expect.soft(url.length).toBeGreaterThan(0);
    },
  );
});
