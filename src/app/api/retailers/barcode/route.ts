import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";

export async function GET(request: Request) {
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
