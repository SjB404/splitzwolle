import { POINTS_OF_INTEREST, getPointOfInterest } from "../../src/data/pointsOfInterest.ts";
import { PLACE_IMAGES } from "../../src/data/placeImages.ts";

describe("the place pictures", () => {
  /* a key that names no place is a picture nothing can ever show, and a place without a key is a
     thumbnail that quietly falls back to a glyph — both are typos, and neither one throws */
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
