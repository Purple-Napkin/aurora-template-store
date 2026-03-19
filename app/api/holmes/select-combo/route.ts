import { NextRequest, NextResponse } from "next/server";

const baseUrl =
  process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey =
  process.env.AURORA_API_KEY ?? process.env.NEXT_PUBLIC_AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/**
 * Proxy Holmes select-combo to Aurora.
 * Sets the user's selected recipe/combo for the session.
 */
export async function POST(req: NextRequest) {
  try {
    if (!baseUrl || !apiKey || !tenantSlug) {
      return NextResponse.json({ error: "Aurora API not configured" }, { status: 503 });
    }
    const body = await req.json();
    const { sid, slug, title } = body as { sid?: string; slug?: string; title?: string };
    if (!sid || typeof sid !== "string" || !slug || typeof slug !== "string") {
      return NextResponse.json({ error: "sid and slug required" }, { status: 400 });
    }
    const url = `${baseUrl.replace(/\/$/, "")}/v1/tenants/${tenantSlug}/store/holmes/select-combo`;
    const res = await fetch(url, {
      method: "POST",
      headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
      body: JSON.stringify({ sid: sid.trim(), slug: slug.trim(), title: title?.trim() }),
    });
    if (!res.ok) {
      return NextResponse.json({ error: "Failed to set selected combo" }, { status: res.status });
    }
    return NextResponse.json({ ok: true });
  } catch (e) {
    return NextResponse.json({ error: "Failed to set selected combo" }, { status: 500 });
  }
}
