import { describe, it, expect } from "vitest";
import { getBannerLogoUrl } from "@aislepilot/domain/branding";

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
  });

  it("is undefined for unrecognized or fictional banners", () => {
    expect(getBannerLogoUrl("Delaware Storm")).toBeUndefined();
    expect(getBannerLogoUrl(undefined)).toBeUndefined();
  });
});
