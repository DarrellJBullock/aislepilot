import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { requireUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!checkRateLimit(`products:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

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
