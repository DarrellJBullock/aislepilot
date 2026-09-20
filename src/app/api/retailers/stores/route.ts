import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { cacheStores } from "@/lib/retailer-cache";
import { requireUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!checkRateLimit(`stores:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const zip = searchParams.get("zip") ?? undefined;
  const provider = getRetailerProvider();
  try {
    const stores = await provider.searchStores({ query, zip });
    await cacheStores(stores);
    return NextResponse.json({ stores, live: isLiveRetailer() });
  } catch {
    return NextResponse.json(
      { stores: [], live: false, error: "store_search_failed" },
      { status: 200 },
    );
  }
}
