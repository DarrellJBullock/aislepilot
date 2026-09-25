import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { guardRetailerRoute } from "@/lib/api-auth";

export async function GET(request: Request) {
  const blocked = await guardRetailerRoute(request, "products");
  if (blocked) return blocked;

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q")?.trim();
  const storeId = searchParams.get("storeId") ?? undefined;
  if (!query) {
    return NextResponse.json({ products: [], live: isLiveRetailer() });
  }
  const provider = getRetailerProvider();
  try {
    const products = await provider.searchProducts({ query, storeId });
    return NextResponse.json({ products, live: isLiveRetailer() });
  } catch {
    return NextResponse.json(
      { products: [], live: false, error: "product_search_failed" },
      { status: 200 },
    );
  }
}
