import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { cacheStores } from "@/lib/retailer-cache";
import { guardRetailerRoute } from "@/lib/api-auth";

export async function GET(request: Request, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await guardRetailerRoute(request, "store");
  if (blocked) return blocked;

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
