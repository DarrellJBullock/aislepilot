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

  it("is undefined for unrecognized or fictional banners", () => {
    expect(getBannerLogoUrl("Delaware Storm")).toBeUndefined();
    expect(getBannerLogoUrl(undefined)).toBeUndefined();
  });
});
