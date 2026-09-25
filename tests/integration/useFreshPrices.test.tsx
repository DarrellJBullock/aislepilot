import { renderHook, waitFor } from "@testing-library/react";
import { describe, it, expect, vi, beforeEach } from "vitest";
import { useFreshPrices } from "@/hooks/useFreshPrices";
import { fetchFreshProducts } from "@/lib/retailer-client";
import { useApp } from "@/lib/store/context";
import { useOnlineStatus } from "@/services/offline/useOnlineStatus";
import { withoutPrices } from "@aislepilot/domain/pricing";
import { makeProduct, makeItem, makeList } from "../factories";

vi.mock("@/lib/retailer-client", () => ({ fetchFreshProducts: vi.fn() }));
vi.mock("@/lib/store/context", () => ({ useApp: vi.fn() }));
vi.mock("@/services/offline/useOnlineStatus", () => ({ useOnlineStatus: vi.fn() }));

const fresh = () => makeProduct({ id: "s:1", pricedAt: new Date().toISOString() });
const stale = () => withoutPrices(makeProduct({ id: "s:1" }));
const listWith = (product = stale()) =>
  makeList([makeItem({ status: "matched", product })], { storeId: "s" });

describe("useFreshPrices", () => {
  const refreshProducts = vi.fn();
  beforeEach(() => {
    vi.mocked(fetchFreshProducts).mockReset();
    refreshProducts.mockReset();
    vi.mocked(useOnlineStatus).mockReturnValue(true);
    vi.mocked(useApp).mockReturnValue({ backend: "supabase", refreshProducts } as never);
  });

  it("re-fetches expired prices once and folds the result into the list", async () => {
    vi.mocked(fetchFreshProducts).mockResolvedValue({ products: [fresh()], live: true });
    const list = listWith();
    const { rerender } = renderHook(() => useFreshPrices(list));
    await waitFor(() => expect(refreshProducts).toHaveBeenCalledWith("l1", [expect.objectContaining({ id: "s:1" })]));
    expect(fetchFreshProducts).toHaveBeenCalledWith(["s:1"], "s");

    rerender(); // same stale set → no second request
    expect(fetchFreshProducts).toHaveBeenCalledTimes(1);
  });

  it("does nothing when prices are fresh, the device is offline, or there is no store", () => {
    renderHook(() => useFreshPrices(listWith(fresh())));
    expect(fetchFreshProducts).not.toHaveBeenCalled();

    vi.mocked(useOnlineStatus).mockReturnValue(false);
    renderHook(() => useFreshPrices(listWith()));
    expect(fetchFreshProducts).not.toHaveBeenCalled();

    vi.mocked(useOnlineStatus).mockReturnValue(true);
    renderHook(() => useFreshPrices({ ...listWith(), storeId: undefined }));
    expect(fetchFreshProducts).not.toHaveBeenCalled();
  });

  it("stays out of the way in local (mock) mode", () => {
    vi.mocked(useApp).mockReturnValue({ backend: "local", refreshProducts } as never);
    renderHook(() => useFreshPrices(listWith()));
    expect(fetchFreshProducts).not.toHaveBeenCalled();
  });
});
