import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";
import { requireUser } from "@/lib/api-auth";
import { checkRateLimit } from "@/lib/rate-limit";

export async function GET(request: Request) {
  const user = await requireUser(request);
  if (!user) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!checkRateLimit(`barcode:${user.id}`, 30, 60_000)) {
    return NextResponse.json({ error: "rate_limited" }, { status: 429 });
  }

  const { searchParams } = new URL(request.url);
  const upc = searchParams.get("upc")?.trim();
  const storeId = searchParams.get("storeId") ?? undefined;
  if (!upc) {
    return NextResponse.json({ product: null, live: isLiveRetailer() });
  }
  const provider = getRetailerProvider();
  try {
    const product = await provider.lookupBarcode(upc, storeId);
    return NextResponse.json({ product, live: isLiveRetailer() });
  } catch {
    return NextResponse.json({ product: null, live: false }, { status: 200 });
  }
}
