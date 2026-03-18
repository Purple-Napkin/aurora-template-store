import { NextResponse } from "next/server";

const baseUrl =
  process.env.AURORA_API_URL ?? process.env.NEXT_PUBLIC_AURORA_API_URL ?? "";
const apiKey = process.env.AURORA_API_KEY ?? process.env.NEXT_PUBLIC_AURORA_API_KEY ?? "";
const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG ?? "";

/**
 * Proxy to Aurora v1/store/config. Keeps API key server-side so client components
 * (e.g. catalogue page) can fetch store config without exposing credentials.
 */
export async function GET() {
  try {
    if (!baseUrl || !apiKey || !tenantSlug) {
      return NextResponse.json(
        { error: "Aurora API not configured" },
        { status: 503 }
      );
    }
    const url = `${baseUrl.replace(/\/$/, "")}/v1/store/config`;
    const res = await fetch(url, {
      headers: {
        "Content-Type": "application/json",
        "X-Api-Key": apiKey,
      },
    });
    if (!res.ok) {
      const text = await res.text();
      return NextResponse.json(
        { error: text || res.statusText },
        { status: res.status }
      );
    }
    const data = await res.json();
    return NextResponse.json(data);
  } catch (e) {
    const message = e instanceof Error ? e.message : "Store config failed";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
