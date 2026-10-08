import {
  formatDecimal,
  formatDistance,
  formatDuration,
  formatRating,
} from "../../src/format.ts";

describe("formatDecimal", () => {
  it("writes a Dutch comma and one decimal by default", () => {
    expect(formatDecimal(5.2)).toBe("5,2");
    expect(formatDecimal(0.6)).toBe("0,6");
    expect(formatDecimal(0)).toBe("0,0");
  });

  it("honours the number of fraction digits", () => {
    expect(formatDecimal(5.25, 0)).toBe("5");
    expect(formatDecimal(5.25, 1)).toBe("5,3");
    expect(formatDecimal(5.25, 2)).toBe("5,25");
  });

  it("rounds rather than truncates", () => {
    expect(formatDecimal(1.96, 1)).toBe("2,0");
    expect(formatDecimal(1.04, 1)).toBe("1,0");
  });
});

describe("formatDistance", () => {
  it("appends the unit", () => {
    expect(formatDistance(1.1)).toBe("1,1 km");
    expect(formatDistance(1)).toBe("1,0 km");
    expect(formatDistance(2.6)).toBe("2,6 km");
  });
});

describe("formatDuration", () => {
  it("prints minutes under an hour", () => {
    expect(formatDuration(20)).toBe("20 min");
    expect(formatDuration(45)).toBe("45 min");
    expect(formatDuration(59)).toBe("59 min");
  });

  it("prints whole hours without a remainder", () => {
    expect(formatDuration(60)).toBe("1 u");
    expect(formatDuration(120)).toBe("2 u");
  });

  it("pads the minutes of a mixed duration to two digits", () => {
    expect(formatDuration(75)).toBe("1 u 15");
    expect(formatDuration(69)).toBe("1 u 09");
    expect(formatDuration(185)).toBe("3 u 05");
  });
});

describe("formatRating", () => {
  it("is a one decimal Dutch number", () => {
    expect(formatRating(4.9)).toBe("4,9");
    expect(formatRating(5)).toBe("5,0");
  });
});
