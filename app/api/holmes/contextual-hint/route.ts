import { NextRequest, NextResponse } from "next/server";
import { createAuroraClient } from "@/lib/aurora";

/**
 * Proxy Holmes contextual hint from Aurora.
 * "Paying attention" suggestion based on cart and mission.
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get("sid")?.trim();
    const cartNames = searchParams.get("cart_names");
    const currentProduct = searchParams.get("current_product")?.trim();
    const cartItemNames = cartNames
      ? cartNames.split(",").map((s) => s.trim()).filter(Boolean)
      : [];
    const client = createAuroraClient();
    const result = await client.store.holmesContextualHint({
      sid: sid || undefined,
      cartNames: cartItemNames.length ? cartItemNames : undefined,
      currentProduct: currentProduct || undefined,
    });
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ hint: null, products: [] }, { status: 200 });
  }
}
