import { NextRequest, NextResponse } from "next/server";
import { createAuroraClient } from "@/lib/aurora";

/**
 * Proxy home-personalization from Aurora.
 * When sid is provided and Holmes infers a recipe mission, returns mode: "recipe_mission".
 */
export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const sid = searchParams.get("sid")?.trim() ?? "";
    const client = createAuroraClient();
    const result = await client.store.homePersonalization(sid, undefined);
    return NextResponse.json(result);
  } catch (e) {
    return NextResponse.json({ hero: {}, sections: [] }, { status: 200 });
  }
}
