import { describe, it, expect } from "vitest";
import { canTransition, nextStatus, isResolved, statusAfterMatch } from "@/domain/status";
import { locationConfidence } from "@/domain/status/location";

describe("status transitions", () => {
  it("allows matched -> available -> collected", () => {
    expect(canTransition("matched", "available")).toBe(true);
    expect(canTransition("available", "collected")).toBe(true);
  });

  it("disallows purchased -> anything", () => {
    expect(canTransition("purchased", "available")).toBe(false);
  });

  it("allows same-status no-op", () => {
    expect(canTransition("collected", "collected")).toBe(true);
  });

  it("nextStatus throws on invalid transition", () => {
    expect(() => nextStatus("unmatched", "collected")).toThrow();
  });

  it("statusAfterMatch is available", () => {
    expect(statusAfterMatch()).toBe("available");
  });

  it("isResolved covers terminal states", () => {
    expect(isResolved("collected")).toBe(true);
    expect(isResolved("skipped")).toBe(true);
    expect(isResolved("unavailable")).toBe(true);
    expect(isResolved("available")).toBe(false);
  });
});

describe("locationConfidence", () => {
  it("marks only retailer_verified as verified", () => {
    expect(locationConfidence("retailer_verified").verified).toBe(true);
    expect(locationConfidence("aislepilot_mapped").verified).toBe(false);
    expect(locationConfidence("category_estimate").verified).toBe(false);
    expect(locationConfidence("community_verified").verified).toBe(false);
    expect(locationConfidence("unknown").verified).toBe(false);
  });

  it("defaults to unknown", () => {
    expect(locationConfidence(undefined).source).toBe("unknown");
  });
});
