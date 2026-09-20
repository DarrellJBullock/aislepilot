import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { cacheStores } from "@/lib/retailer-cache";
import { requireUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!checkRateLimit(`store:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { id } = await params;
  const provider = getRetailerProvider();
  try {
    const store = await provider.getStore(id);
    await cacheStores([store]);
    return NextResponse.json({ store, live: isLiveRetailer() });
  } catch {
    return NextResponse.json({ store: null, live: false, error: "store_not_found" }, { status: 200 });
  }
}
