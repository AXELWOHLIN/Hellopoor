import { NextResponse } from "next/server";
import { fetchStores } from "@/lib/scraper";

export async function GET() {
  try {
    const stores = await fetchStores();
    return NextResponse.json({ stores }, {
      headers: { "Cache-Control": "public, s-maxage=86400, stale-while-revalidate=43200" },
    });
  } catch (error) {
    console.error("Failed to fetch stores:", error);
    return NextResponse.json(
      { error: "Failed to fetch stores" },
      { status: 500 }
    );
  }
}
