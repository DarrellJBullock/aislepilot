import { describe, it, expect } from "vitest";
import {
  coverageTier,
  getBannerLogoUrl,
  KROGER_COVERAGE,
  KROGER_FAMILY_BANNERS,
} from "@aislepilot/domain/branding";

describe("getBannerLogoUrl", () => {
  it("returns a favicon URL for known Kroger-family banners", () => {
    expect(getBannerLogoUrl("Kroger")).toBe(
      "https://www.google.com/s2/favicons?domain=kroger.com&sz=128",
    );
    expect(getBannerLogoUrl("Harris Teeter")).toBe(
      "https://www.google.com/s2/favicons?domain=harristeeter.com&sz=128",
    );
  });

  it("is case- and whitespace-insensitive", () => {
    expect(getBannerLogoUrl("  kroger  ")).toBe(getBannerLogoUrl("Kroger"));
    expect(getBannerLogoUrl("king   soopers")).toBe(getBannerLogoUrl("King Soopers"));
  });

  it("matches the actual short banner codes Kroger's live API returns", () => {
    // Confirmed by querying real locations per state — Kroger's API uses
    // internal codes like "HART" and "FRED", not the storefront chain name.
    expect(getBannerLogoUrl("HART")).toBe(
      "https://www.google.com/s2/favicons?domain=harristeeter.com&sz=128",
    );
    expect(getBannerLogoUrl("FRED")).toBe(
      "https://www.google.com/s2/favicons?domain=fredmeyer.com&sz=128",
    );
    expect(getBannerLogoUrl("KINGSOOPERS")).toBe(
      "https://www.google.com/s2/favicons?domain=kingsoopers.com&sz=128",
    );
    expect(getBannerLogoUrl("SMITHS")).toBe(
      "https://www.google.com/s2/favicons?domain=smithsfoodanddrug.com&sz=128",
    );
    expect(getBannerLogoUrl("FRYS")).toBe(
      "https://www.google.com/s2/favicons?domain=frysfood.com&sz=128",
    );
    expect(getBannerLogoUrl("BAKERS")).toBe(
      "https://www.google.com/s2/favicons?domain=bakersplus.com&sz=128",
    );
    expect(getBannerLogoUrl("MARIANOS")).toBe(
      "https://www.google.com/s2/favicons?domain=marianos.com&sz=128",
    );
    expect(getBannerLogoUrl("CITYMARKET")).toBe(
      "https://www.google.com/s2/favicons?domain=citymarket.com&sz=128",
    );
    expect(getBannerLogoUrl("FOOD4LESS")).toBe(
      "https://www.google.com/s2/favicons?domain=food4less.com&sz=128",
    );
    expect(getBannerLogoUrl("FOODSCO")).toBe(
      "https://www.google.com/s2/favicons?domain=foodsco.net&sz=128",
    );
    expect(getBannerLogoUrl("JAYC")).toBe(
      "https://www.google.com/s2/favicons?domain=jaycfoods.com&sz=128",
    );
    expect(getBannerLogoUrl("PAYLESS")).toBe(
      "https://www.google.com/s2/favicons?domain=pay-less.com&sz=128",
    );
    expect(getBannerLogoUrl("RULER")).toBe(
      "https://www.google.com/s2/favicons?domain=rulerfoods.com&sz=128",
    );
  });

  it("is undefined for unrecognized or fictional banners", () => {
    expect(getBannerLogoUrl("Delaware Storm")).toBeUndefined();
    expect(getBannerLogoUrl(undefined)).toBeUndefined();
  });
});

describe("KROGER_FAMILY_BANNERS", () => {
  it("lists all 20 banners with unique codes and names", () => {
    expect(KROGER_FAMILY_BANNERS).toHaveLength(20);
    expect(new Set(KROGER_FAMILY_BANNERS.map((b) => b.code)).size).toBe(20);
    expect(new Set(KROGER_FAMILY_BANNERS.map((b) => b.name)).size).toBe(20);
  });

  it("every banner has a real logo mapping, so none falls back to a pin icon", () => {
    for (const b of KROGER_FAMILY_BANNERS) {
      expect(getBannerLogoUrl(b.code), b.code).toBeDefined();
    }
  });
});

describe("KROGER_COVERAGE", () => {
  it("classifies states, with anything unlisted as none", () => {
    expect(coverageTier("Virginia")).toBe("covered");
    expect(coverageTier("Texas")).toBe("partial");
    expect(coverageTier("New Jersey")).toBe("none");
    expect(coverageTier("Pennsylvania")).toBe("none");
  });

  it("only lists real state names from the map data", async () => {
    const us = (await import("us-atlas/states-10m.json")).default as {
      objects: { states: { geometries: { properties: { name: string } }[] } };
    };
    const names = new Set(us.objects.states.geometries.map((g) => g.properties.name));
    for (const state of Object.keys(KROGER_COVERAGE)) {
      expect(names.has(state), state).toBe(true);
    }
  });
});

describe("mobile coverage map paths", () => {
  it("has an outline for every state in KROGER_COVERAGE", async () => {
    const { US_STATE_PATHS } = await import("../../apps/mobile/src/lib/us-state-paths");
    expect(Object.keys(US_STATE_PATHS)).toHaveLength(51);
    for (const state of Object.keys(KROGER_COVERAGE)) {
      expect(US_STATE_PATHS[state], state).toMatch(/^M/);
    }
  });
});
