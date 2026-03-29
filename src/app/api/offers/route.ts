import { NextResponse } from "next/server";
import { fetchOffers } from "@/lib/scraper";

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const storeId = searchParams.get("storeId");

  if (!storeId) {
    return NextResponse.json(
      { error: "storeId query parameter is required" },
      { status: 400 }
    );
  }

  try {
    const offers = await fetchOffers(storeId);
    return NextResponse.json({ offers }, {
      headers: { "Cache-Control": "public, s-maxage=3600, stale-while-revalidate=1800" },
    });
  } catch (error) {
    console.error("Failed to fetch offers:", error);
    return NextResponse.json(
      { error: "Failed to fetch offers" },
      { status: 500 }
    );
  }
}
