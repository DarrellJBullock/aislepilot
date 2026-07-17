import { NextResponse } from "next/server";
import { getRetailerProvider, isLiveRetailer } from "@/services/retailers/factory";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const query = searchParams.get("q") ?? undefined;
  const zip = searchParams.get("zip") ?? undefined;
  const provider = getRetailerProvider();
  try {
    const stores = await provider.searchStores({ query, zip });
    return NextResponse.json({ stores, live: isLiveRetailer() });
  } catch {
    return NextResponse.json(
      { stores: [], live: false, error: "store_search_failed" },
      { status: 200 },
    );
  }
}
