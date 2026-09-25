import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { guardRetailerRoute } from "@/lib/api-auth";

// Re-fetches price/availability for products already on a list, so we never
// have to keep long-lived copies of Kroger's data (see PRICE_TTL_MS).
export async function GET(request: Request) {
  const blocked = await guardRetailerRoute(request, "products-refresh");
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId") ?? undefined;
  const ids = (searchParams.get("ids") ?? "")
    .split(",")
    .map((s) => s.trim())
    .filter(Boolean)
    .slice(0, 50);
  if (!storeId || ids.length === 0) {
    return NextResponse.json({ products: [], live: isLiveRetailer() });
  }
  try {
    const products = await getRetailerProvider().getProducts(ids, storeId);
    return NextResponse.json({ products, live: isLiveRetailer() });
  } catch {
    return NextResponse.json({ products: [], live: false, error: "refresh_failed" }, { status: 200 });
  }
}
