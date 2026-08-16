import { describe, it, expect } from "vitest";
import { normalize, tokenize, scoreProduct, matchProducts } from "@aislepilot/domain/matching";
import { catalogForStore } from "@aislepilot/domain/mock/stores";
import { makeProduct } from "../factories";

describe("normalize / tokenize", () => {
  it("lowercases and strips punctuation", () => {
    expect(normalize("2% Reduced-Fat Milk!")).toBe("2 reduced fat milk");
  });
  it("removes stopwords", () => {
    expect(tokenize("a loaf of the bread")).toEqual(["loaf", "bread"]);
  });
});

describe("scoreProduct", () => {
  it("scores exact name matches higher than unrelated", () => {
    const milk = makeProduct({ name: "Whole Milk", category: "Milk" });
    const bread = makeProduct({ name: "White Bread", category: "Bread" });
    expect(scoreProduct("milk", milk)).toBeGreaterThan(scoreProduct("milk", bread));
  });
});

describe("matchProducts against mock catalog", () => {
  const catalog = catalogForStore("store-riverside");

  it("returns several milk products", () => {
    const results = matchProducts("milk", catalog, { storeId: "store-riverside" });
    expect(results.length).toBeGreaterThanOrEqual(3);
    expect(results.every((p) => /milk/i.test(`${p.name} ${p.category}`))).toBe(true);
  });

  it("returns several bread products", () => {
    const results = matchProducts("bread", catalog);
    expect(results.length).toBeGreaterThanOrEqual(3);
  });

  it("returns several paper towel products", () => {
    const results = matchProducts("paper towels", catalog);
    const paperTowels = results.filter((p) => /paper towel/i.test(p.category ?? ""));
    expect(paperTowels.length).toBeGreaterThanOrEqual(3);
  });

  it("matches chicken breast", () => {
    const results = matchProducts("chicken breast", catalog);
    expect(results[0].name.toLowerCase()).toContain("chicken");
  });

  it("returns nothing for gibberish", () => {
    expect(matchProducts("zzxqwv", catalog)).toHaveLength(0);
  });

  it("respects the limit", () => {
    expect(matchProducts("milk", catalog, { limit: 2 }).length).toBeLessThanOrEqual(2);
  });
});
