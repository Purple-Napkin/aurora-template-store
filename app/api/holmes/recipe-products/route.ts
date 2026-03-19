import { NextRequest, NextResponse } from "next/server";
import { createAuroraClient } from "@/lib/aurora";

/**
 * Proxy Holmes recipe products from Aurora.
 * Products for a recipe (paella, curry, pasta) via holmes_insights.recipe_ideas search.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const recipe = searchParams.get("recipe")?.trim();
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "12") || 12, 24);
    if (!recipe) {
      return NextResponse.json({ error: "recipe required", products: [], total: 0 }, { status: 400 });
    }
    const client = createAuroraClient();
    const result = await client.store.holmesRecipeProducts(recipe, limit);
    return NextResponse.json(result);
  } catch (e) {
    const msg = e instanceof Error ? e.message : "Recipe products failed";
    return NextResponse.json({ error: msg, products: [], total: 0 }, { status: 500 });
  }
}
