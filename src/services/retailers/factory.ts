import "server-only";
import type { RetailerProvider } from "@aislepilot/domain/provider";
import { MockKrogerProvider } from "@aislepilot/domain/providers/mock-kroger";
import { KrogerProvider } from "@/providers/kroger";

let cached: RetailerProvider | null = null;

/**
 * Select the retailer provider. Uses the mock provider unless live Kroger
 * credentials are present AND USE_MOCK_RETAILER_DATA is not "true". Credentials
 * are read from server env only. Falls back to mock on any misconfiguration.
 */
export function getRetailerProvider(): RetailerProvider {
  if (cached) return cached;

  const useMock = (process.env.USE_MOCK_RETAILER_DATA ?? "true") !== "false";
  const clientId = process.env.KROGER_CLIENT_ID;
  const clientSecret = process.env.KROGER_CLIENT_SECRET;
  const baseUrl = process.env.KROGER_BASE_URL ?? "https://api.kroger.com/v1";

  if (!useMock && clientId && clientSecret) {
    cached = new KrogerProvider({ clientId, clientSecret, baseUrl });
  } else {
    cached = new MockKrogerProvider();
  }
  return cached;
}

export function isLiveRetailer(): boolean {
  return getRetailerProvider().getCapabilities().live;
}
