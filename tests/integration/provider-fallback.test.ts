import { describe, it, expect, afterEach, vi } from "vitest";

const OLD_ENV = { ...process.env };

afterEach(() => {
  process.env = { ...OLD_ENV };
  vi.resetModules();
});

describe("retailer provider fallback", () => {
  it("uses the mock provider when no Kroger credentials are set", async () => {
    process.env.USE_MOCK_RETAILER_DATA = "true";
    delete process.env.KROGER_CLIENT_ID;
    delete process.env.KROGER_CLIENT_SECRET;
    const { getRetailerProvider } = await import("@/services/retailers/factory");
    expect(getRetailerProvider().getCapabilities().live).toBe(false);
  });

  it("falls back to mock when USE_MOCK_RETAILER_DATA is not disabled even with creds", async () => {
    vi.resetModules();
    process.env.USE_MOCK_RETAILER_DATA = "true";
    process.env.KROGER_CLIENT_ID = "id";
    process.env.KROGER_CLIENT_SECRET = "secret";
    const { getRetailerProvider } = await import("@/services/retailers/factory");
    expect(getRetailerProvider().getCapabilities().live).toBe(false);
  });

  it("selects the live provider only when creds present and mock disabled", async () => {
    vi.resetModules();
    process.env.USE_MOCK_RETAILER_DATA = "false";
    process.env.KROGER_CLIENT_ID = "id";
    process.env.KROGER_CLIENT_SECRET = "secret";
    const { getRetailerProvider } = await import("@/services/retailers/factory");
    expect(getRetailerProvider().getCapabilities().live).toBe(true);
  });
});
