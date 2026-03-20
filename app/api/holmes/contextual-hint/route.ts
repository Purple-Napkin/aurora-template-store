import { NextRequest, NextResponse } from "next/server";

const baseUrl =
  process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey =
  process.env.AURORA_API_KEY ?? process.env.NEXT_PUBLIC_AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/**
 * Proxy Holmes contextual hint from Aurora.
 * "Paying attention" suggestion based on cart and mission.
 */
export async function GET(req: NextRequest) {
  try {
    if (!baseUrl || !apiKey || !tenantSlug) {
      return NextResponse.json({ hint: null, products: [] });
    }
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get("sid")?.trim();
    const cartNames = searchParams.get("cart_names");
    const cartIds = searchParams.get("cart_ids");
    const currentProduct = searchParams.get("current_product")?.trim();
    const qs = new URLSearchParams();
    if (sid) qs.set("sid", sid);
    if (cartNames) qs.set("cart_names", cartNames);
    if (cartIds) qs.set("cart_ids", cartIds);
    if (currentProduct) qs.set("current_product", currentProduct);
    const excludeDietary = searchParams.get("excludeDietary")?.trim();
    if (excludeDietary) qs.set("excludeDietary", excludeDietary);
    const url = `${baseUrl.replace(/\/$/, "")}/v1/tenants/${tenantSlug}/store/holmes/contextual-hint?${qs.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    });
    if (!res.ok) return NextResponse.json({ hint: null, products: [] });
    const result = await res.json();
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ hint: null, products: [] }, { status: 200 });
  }
}
