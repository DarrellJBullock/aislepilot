import { describe, it, expect, vi, beforeEach } from "vitest";

const isLiveRetailer = vi.fn();
const getUser = vi.fn();

vi.mock("@/services/retailers/factory", () => ({ isLiveRetailer: () => isLiveRetailer() }));
vi.mock("@/lib/supabase/server", () => ({
  createClient: async () => ({ auth: { getUser } }),
}));

import { guardRetailerRoute } from "@/lib/api-auth";

const req = () => new Request("http://localhost/api/retailers/stores?zip=20001");

describe("guardRetailerRoute", () => {
  beforeEach(() => {
    isLiveRetailer.mockReset();
    getUser.mockReset();
  });

  it("stays open in mock mode (no live Kroger quota to protect)", async () => {
    isLiveRetailer.mockReturnValue(false);
    expect(await guardRetailerRoute(req(), "t-mock")).toBeNull();
    expect(getUser).not.toHaveBeenCalled();
  });

  it("rejects unauthenticated requests when live", async () => {
    isLiveRetailer.mockReturnValue(true);
    getUser.mockResolvedValue({ data: { user: null }, error: null });
    const res = await guardRetailerRoute(req(), "t-unauth");
    expect(res?.status).toBe(401);
  });

  it("allows a signed-in user when live, then rate limits at 30/min", async () => {
    isLiveRetailer.mockReturnValue(true);
    getUser.mockResolvedValue({ data: { user: { id: "u-rate" } }, error: null });
    for (let i = 0; i < 30; i++) {
      expect(await guardRetailerRoute(req(), "t-rate")).toBeNull();
    }
    const res = await guardRetailerRoute(req(), "t-rate");
    expect(res?.status).toBe(429);
  });
});
