import { NextResponse } from "next/server";
import { readFileSync, existsSync } from "fs";
import { join } from "path";

export async function POST() {
  const base = (process.env.AURORA_API_URL || process.env.NEXT_PUBLIC_AURORA_API_URL || "").replace(
    /\/$/,
    ""
  );
  const apiKey = process.env.AURORA_API_KEY;
  if (!base || !apiKey) {
    return NextResponse.json(
      { error: "Server missing AURORA_API_URL (or NEXT_PUBLIC_AURORA_API_URL) or AURORA_API_KEY" },
      { status: 500 }
    );
  }

  const seedPath = join(process.cwd(), "init", "seed.sql");
  if (!existsSync(seedPath)) {
    return NextResponse.json({ error: "init/seed.sql not found on server" }, { status: 500 });
  }

  const sql = readFileSync(seedPath, "utf8");
  if (!sql.includes("__TENANT_UUID__") || !sql.includes("__TENANT_SCHEMA__")) {
    return NextResponse.json({ error: "init/seed.sql is missing tenant placeholders" }, { status: 500 });
  }

  const url = `${base}/v1/apply-seed-sql`;
  const res = await fetch(url, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Api-Key": apiKey,
    },
    body: JSON.stringify({ sql }),
  });

  const text = await res.text();
  let body: unknown;
  try {
    body = JSON.parse(text) as unknown;
  } catch {
    body = { raw: text };
  }

  if (!res.ok) {
    const errMsg =
      typeof body === "object" &&
      body !== null &&
      "error" in body &&
      typeof (body as { error: unknown }).error === "string"
        ? (body as { error: string }).error
        : "Failed to apply example data";
    return NextResponse.json({ error: errMsg, detail: body }, { status: res.status >= 400 ? res.status : 502 });
  }

  return NextResponse.json(body);
}
