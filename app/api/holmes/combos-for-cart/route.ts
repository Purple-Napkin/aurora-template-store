import { NextRequest, NextResponse } from "next/server";

const baseUrl =
  process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey =
  process.env.AURORA_API_KEY ?? process.env.NEXT_PUBLIC_AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/**
 * Proxy Holmes combos-for-cart from Aurora.
 * Returns recipe options for the cart when it has 2+ items.
 */
export async function GET(req: NextRequest) {
  try {
    if (!baseUrl || !apiKey || !tenantSlug) {
      return NextResponse.json({ combos: [] });
    }
    const { searchParams } = new URL(req.url);
    const cartIds = searchParams.get("cart_ids")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const cartNames = searchParams.get("cart_names")?.split(",").map((s) => s.trim()).filter(Boolean) ?? [];
    const limit = Math.min(parseInt(searchParams.get("limit") ?? "3") || 3, 5);
    if (cartIds.length < 2) {
      return NextResponse.json({ combos: [] });
    }
    const qs = new URLSearchParams({ cart_ids: cartIds.join(",") });
    if (cartNames.length) qs.set("cart_names", cartNames.join(","));
    qs.set("limit", String(limit));
    const sid = searchParams.get("sid")?.trim();
    if (sid) qs.set("sid", sid);
    const url = `${baseUrl.replace(/\/$/, "")}/v1/tenants/${tenantSlug}/store/holmes/combos-for-cart?${qs.toString()}`;
    const res = await fetch(url, {
      headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    });
    if (!res.ok) return NextResponse.json({ combos: [] });
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    return NextResponse.json({ combos: [] }, { status: 200 });
  }
}
