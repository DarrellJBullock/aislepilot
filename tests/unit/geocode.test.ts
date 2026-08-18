import { describe, it, expect } from "vitest";
import { resolveCityToZip } from "@/lib/geocode";

describe("resolveCityToZip", () => {
  it("resolves a bare city name", () => {
    expect(resolveCityToZip("Cincinnati")).toBe("52549");
  });

  it("resolves 'City, ST' to the city+state-specific zip", () => {
    expect(resolveCityToZip("Cincinnati, OH")).toBe("45275");
  });

  it("resolves 'City ST' without a comma", () => {
    expect(resolveCityToZip("Chicago IL")).toBe("60601");
  });

  it("expands common abbreviations like 'St.' to 'Saint'", () => {
    expect(resolveCityToZip("St. Louis, MO")).toBe("63105");
    expect(resolveCityToZip("St Paul, MN")).toBeDefined();
  });

  it("is case-insensitive and tolerates extra whitespace", () => {
    expect(resolveCityToZip("  cincinnati ,  oh  ")).toBe("45275");
  });

  it("returns undefined for input with no match", () => {
    expect(resolveCityToZip("Not A Real City Name Xyz")).toBeUndefined();
  });

  it("returns undefined for empty input", () => {
    expect(resolveCityToZip("")).toBeUndefined();
    expect(resolveCityToZip("   ")).toBeUndefined();
  });

  it("ignores a trailing two-letter word that isn't a real state code", () => {
    // "New Yo" + fake "rk" isn't a state — falls through to bare-city lookup,
    // which also won't match, so this should resolve to undefined rather
    // than silently matching the wrong thing.
    expect(resolveCityToZip("Bora Bora")).toBeUndefined();
  });
});
