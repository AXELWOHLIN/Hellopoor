import { NextResponse } from "next/server";
import { matchRecipes } from "@/lib/xai";
import type { SaleItem, Recipe, FoodPreference } from "@/lib/types";

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const {
      saleItems,
      recipes,
      preferences,
    }: {
      saleItems: SaleItem[];
      recipes: Recipe[];
      preferences: FoodPreference[];
    } = body;

    if (!saleItems?.length || !recipes?.length) {
      return NextResponse.json(
        { error: "Both saleItems and recipes arrays are required" },
        { status: 400 }
      );
    }

    const matches = await matchRecipes({
      saleItems,
      recipes,
      preferences: preferences || [],
    });

    return NextResponse.json({ matches });
  } catch (error) {
    console.error("Failed to match recipes:", error);
    const message =
      error instanceof Error ? error.message : "Failed to match recipes";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
