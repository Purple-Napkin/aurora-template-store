#!/usr/bin/env node
/**
 * Marketplace catalog from init/catalog-seed.json (committed source of truth).
 *
 *   pnpm seed:catalog:apply   — POST generated SQL for vendors → zones → categories → products
 *
 * To refresh init/catalog-seed.json from a tenant, from this template directory:
 *   node scripts/catalog-seed.mjs export
 * Env: .env.local (+ optional ../../.env — see load-template-env.mjs).
 */
import { createHash } from "crypto";
import { readFileSync, writeFileSync, existsSync } from "fs";
import { join, dirname, resolve } from "path";
import { fileURLToPath, pathToFileURL } from "url";
import { AuroraClient } from "@aurora-studio/sdk";
import { loadAllTemplateEnv } from "./load-template-env.mjs";

loadAllTemplateEnv(import.meta.url);

const args = process.argv.slice(2);
const cmd = args[0] || "apply";
const dryRun = args.includes("--dry-run");

const CATALOG_PATH = join(process.cwd(), "init", "catalog-seed.json");

const apiUrl = (process.env.AURORA_API_URL || process.env.NEXT_PUBLIC_AURORA_API_URL || "").replace(
  /\/$/,
  ""
);
const apiKey = process.env.AURORA_API_KEY || process.env.NEXT_PUBLIC_AURORA_API_KEY || "";

const UUID_COLS = new Set([
  "id",
  "category_id",
  "vendor_id",
  "zone_id",
  "room_type_id",
]);

function sqlLiteral(val) {
  if (val === null || val === undefined) return "NULL";
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number" && Number.isFinite(val)) return String(val);
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'::jsonb`;
  }
  const s = String(val);
  return `'${s.replace(/'/g, "''")}'`;
}

function sqlUuid(val) {
  if (val == null || val === "") return "NULL";
  return `'${String(val).replace(/'/g, "''")}'::uuid`;
}

function formatCell(col, val) {
  if (val === null || val === undefined) return "NULL";
  if (UUID_COLS.has(col)) return sqlUuid(val);
  if (typeof val === "boolean") return val ? "true" : "false";
  if (typeof val === "number" && Number.isFinite(val)) return String(val);
  if (typeof val === "object") {
    return `'${JSON.stringify(val).replace(/\\/g, "\\\\").replace(/'/g, "''")}'::jsonb`;
  }
  return sqlLiteral(val);
}

/**
 * @param {Record<string, unknown>[]} products
 */
function productColumnOrder(products) {
  const keys = new Set();
  for (const p of products) {
    for (const k of Object.keys(p)) {
      if (k === "tenant_id" || k === "created_at" || k === "updated_at") continue;
      keys.add(k);
    }
  }
  return [...keys].sort();
}

/** Stable UUID for vendor_products.id (one row per product link). */
function deterministicVendorProductRowId(productId) {
  const h = createHash("sha256").update(`aurora-seed-vendor-product|${productId}`).digest();
  const buf = Buffer.allocUnsafe(16);
  h.copy(buf, 0, 0, 16);
  buf[6] = (buf[6] & 0x0f) | 0x40;
  buf[8] = (buf[8] & 0x3f) | 0x80;
  const x = buf.toString("hex");
  return `${x.slice(0, 8)}-${x.slice(8, 12)}-${x.slice(12, 16)}-${x.slice(16, 20)}-${x.slice(20)}`;
}

function deleteSkuPatterns(meta) {
  if (meta.deleteProductSkuPatterns?.length) return meta.deleteProductSkuPatterns;
  if (meta.deleteProductSkuLike) return [meta.deleteProductSkuLike];
  return [];
}

export function buildCatalogSql(data) {
  const meta = data.seedMeta || {};
  const mode = meta.catalogApply || "replace_chain";
  const reuseEmail = String(meta.reuseVendorEmail || "").trim();
  const schema = "__TENANT_SCHEMA__";
  const tid = "__TENANT_UUID__";

  const effectiveVendorSql =
    mode === "replace_chain_reuse_vendor" && reuseEmail
      ? `(SELECT COALESCE((SELECT v.id FROM ${schema}.vendors v WHERE v.tenant_id = '${tid}'::uuid AND lower(trim(coalesce(v.email, ''))) = lower(trim(${sqlLiteral(reuseEmail)})) LIMIT 1), ${sqlUuid(meta.vendorId)}))`
      : null;

  const lines = ["BEGIN;", ""];

  if (mode === "replace_chain" || mode === "replace_chain_reuse_vendor") {
    const skuPatterns = deleteSkuPatterns(meta);
    if (skuPatterns.length) {
      const skuOr = skuPatterns.map((pat) => `p.sku LIKE ${sqlLiteral(pat)}`).join(" OR ");
      lines.push(
        `DELETE FROM ${schema}.vendor_products vp USING ${schema}.products p WHERE vp.tenant_id = '${tid}'::uuid AND p.tenant_id = '${tid}'::uuid AND vp.product_id = p.id AND (${skuOr});`
      );
    }
    for (const pat of skuPatterns) {
      lines.push(
        `DELETE FROM ${schema}.products WHERE tenant_id = '${tid}'::uuid AND sku LIKE ${sqlLiteral(pat)};`
      );
    }
    if (meta.deleteRoomTypeIds?.length) {
      const rlist = meta.deleteRoomTypeIds.map((id) => sqlUuid(id)).join(", ");
      lines.push(
        `DELETE FROM ${schema}.guest_reservations WHERE tenant_id = '${tid}'::uuid AND room_type_id IN (${rlist});`
      );
      lines.push(
        `DELETE FROM ${schema}.room_types WHERE tenant_id = '${tid}'::uuid AND id IN (${rlist});`
      );
    }
    if (meta.categorySlugs?.length) {
      const list = meta.categorySlugs.map((s) => sqlLiteral(s)).join(", ");
      lines.push(
        `DELETE FROM ${schema}.categories WHERE tenant_id = '${tid}'::uuid AND slug IN (${list});`
      );
    }
    if (meta.zoneSlugs?.length) {
      const zlist = meta.zoneSlugs.map((s) => sqlLiteral(s)).join(", ");
      lines.push(
        `DELETE FROM ${schema}.zones WHERE tenant_id = '${tid}'::uuid AND slug IN (${zlist});`
      );
    } else if (meta.zoneSlug) {
      lines.push(
        `DELETE FROM ${schema}.zones WHERE tenant_id = '${tid}'::uuid AND slug = ${sqlLiteral(meta.zoneSlug)};`
      );
    }
    if (meta.vendorIds?.length) {
      const vlist = meta.vendorIds.map((id) => sqlUuid(id)).join(", ");
      lines.push(`DELETE FROM ${schema}.vendors WHERE tenant_id = '${tid}'::uuid AND id IN (${vlist});`);
    } else if (meta.vendorId && mode !== "replace_chain_reuse_vendor") {
      lines.push(
        `DELETE FROM ${schema}.vendors WHERE tenant_id = '${tid}'::uuid AND id = ${sqlUuid(meta.vendorId)};`
      );
    }
    lines.push("");
  }

  const vendors = data.vendors || [];
  const zones = data.zones || [];
  const categories = data.categories || [];
  const roomTypes = data.roomTypes || [];
  const products = data.products || [];

  function vendorColumnOrder(vs) {
    const keys = new Set();
    for (const v of vs) {
      for (const k of Object.keys(v)) {
        if (["tenant_id", "created_at", "updated_at"].includes(k)) continue;
        keys.add(k);
      }
    }
    return [...keys].sort();
  }

  const vendorDataCols = vendorColumnOrder(vendors);
  const vendorTail = ["created_at", "updated_at"];
  for (const v of vendors) {
    const insertCols = ["tenant_id", ...vendorDataCols, ...vendorTail];
    const insertVals = [
      `'${tid}'::uuid`,
      ...vendorDataCols.map((c) => formatCell(c, v[c])),
      "now()",
      "now()",
    ];
    if (mode === "grocery_upsert") {
      const conflictUpdateCols = vendorDataCols.filter((c) => c !== "id");
      const setParts = ["tenant_id = EXCLUDED.tenant_id"].concat(
        conflictUpdateCols.map((c) => `${c} = EXCLUDED.${c}`),
        ["updated_at = now()"]
      );
      lines.push(
        `INSERT INTO ${schema}.vendors (${insertCols.join(", ")}) VALUES (${insertVals.join(", ")}) ON CONFLICT (id) DO UPDATE SET ${setParts.join(", ")};`
      );
    } else if (mode === "replace_chain_reuse_vendor" && reuseEmail) {
      const vendorColsLegacy = ["id", "tenant_id", "name", "email", "status", "created_at", "updated_at"];
      const vals = [
        sqlUuid(v.id),
        `'${tid}'::uuid`,
        sqlLiteral(v.name),
        sqlLiteral(v.email ?? null),
        sqlLiteral(v.status ?? "active"),
        "now()",
        "now()",
      ];
      lines.push(
        `INSERT INTO ${schema}.vendors (${vendorColsLegacy.join(", ")}) SELECT ${vals.join(", ")} WHERE NOT EXISTS (SELECT 1 FROM ${schema}.vendors v WHERE v.tenant_id = '${tid}'::uuid AND lower(trim(coalesce(v.email, ''))) = lower(trim(${sqlLiteral(reuseEmail)})));`
      );
    } else {
      lines.push(
        `INSERT INTO ${schema}.vendors (${insertCols.join(", ")}) VALUES (${insertVals.join(", ")});`
      );
    }
  }
  if (vendors.length) lines.push("");

  const zoneCols = ["id", "tenant_id", "slug", "name", "sort_order", "vendor_id", "created_at", "updated_at"];
  for (const z of zones) {
    const vals = [
      sqlUuid(z.id),
      `'${tid}'::uuid`,
      sqlLiteral(z.slug),
      sqlLiteral(z.name),
      sqlLiteral(z.sort_order ?? 1),
      effectiveVendorSql ?? sqlUuid(z.vendor_id),
      "now()",
      "now()",
    ];
    if (mode === "grocery_upsert") {
      lines.push(
        `INSERT INTO ${schema}.zones (${zoneCols.join(", ")}) VALUES (${vals.join(", ")}) ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, slug = EXCLUDED.slug, name = EXCLUDED.name, sort_order = EXCLUDED.sort_order, vendor_id = EXCLUDED.vendor_id, updated_at = now();`
      );
    } else {
      lines.push(`INSERT INTO ${schema}.zones (${zoneCols.join(", ")}) VALUES (${vals.join(", ")});`);
    }
  }
  if (zones.length) lines.push("");

  const catCols = ["id", "tenant_id", "name", "slug", "zone_id", "created_at", "updated_at"];
  for (const c of categories) {
    const vals = [
      sqlUuid(c.id),
      `'${tid}'::uuid`,
      sqlLiteral(c.name),
      sqlLiteral(c.slug),
      sqlUuid(c.zone_id),
      "now()",
      "now()",
    ];
    if (mode === "grocery_upsert") {
      lines.push(
        `INSERT INTO ${schema}.categories (${catCols.join(", ")}) VALUES (${vals.join(", ")}) ON CONFLICT (id) DO UPDATE SET tenant_id = EXCLUDED.tenant_id, name = EXCLUDED.name, slug = EXCLUDED.slug, zone_id = EXCLUDED.zone_id, updated_at = now();`
      );
    } else {
      lines.push(`INSERT INTO ${schema}.categories (${catCols.join(", ")}) VALUES (${vals.join(", ")});`);
    }
  }
  if (categories.length) lines.push("");

  const rtCols = ["id", "tenant_id", "name", "description", "max_occupancy", "image_url", "sort_order", "created_at", "updated_at"];
  for (const r of roomTypes) {
    const vals = [
      sqlUuid(r.id),
      `'${tid}'::uuid`,
      sqlLiteral(r.name),
      sqlLiteral(r.description ?? null),
      r.max_occupancy != null ? String(r.max_occupancy) : "NULL",
      r.image_url != null ? sqlLiteral(r.image_url) : "NULL",
      r.sort_order != null ? String(r.sort_order) : "NULL",
      "now()",
      "now()",
    ];
    lines.push(`INSERT INTO ${schema}.room_types (${rtCols.join(", ")}) VALUES (${vals.join(", ")});`);
  }
  if (roomTypes.length) lines.push("");

  const pCols = productColumnOrder(products);
  const insertTail = ["created_at", "updated_at"];
  for (const p of products) {
    const dataCols = pCols.filter((c) => p[c] !== undefined);
    const insertCols = ["tenant_id", ...dataCols, ...insertTail];
    const insertVals = [
      `'${tid}'::uuid`,
      ...dataCols.map((c) =>
        c === "vendor_id" && effectiveVendorSql ? effectiveVendorSql : formatCell(c, p[c])
      ),
      "now()",
      "now()",
    ];
    const conflictUpdateCols = dataCols.filter((c) => c !== "id");
    const setParts =
      mode === "grocery_upsert"
        ? ["tenant_id = EXCLUDED.tenant_id"].concat(
            conflictUpdateCols.map((c) => `${c} = EXCLUDED.${c}`),
            ["updated_at = now()"]
          )
        : conflictUpdateCols.map((c) => `${c} = EXCLUDED.${c}`).concat(["updated_at = now()"]);
    const guard = meta.productSkuGuard
      ? ` WHERE ${schema}.products.sku LIKE ${sqlLiteral(meta.productSkuGuard)}`
      : "";

    if (mode === "grocery_upsert") {
      lines.push(
        `INSERT INTO ${schema}.products (${insertCols.join(", ")}) VALUES (${insertVals.join(", ")}) ON CONFLICT (id) DO UPDATE SET ${setParts.join(", ")}${guard};`
      );
    } else {
      lines.push(
        `INSERT INTO ${schema}.products (${insertCols.join(", ")}) VALUES (${insertVals.join(", ")});`
      );
    }
  }

  if (mode === "replace_chain" || mode === "replace_chain_reuse_vendor") {
    const vpCols = ["id", "tenant_id", "vendor_id", "product_id", "price", "stock_quantity", "created_at", "updated_at"];
    for (const p of products) {
      if (p.vendor_id == null || p.vendor_id === "") continue;
      const pid = sqlUuid(p.id);
      const vpId = sqlUuid(deterministicVendorProductRowId(String(p.id)));
      const vidSql =
        effectiveVendorSql && meta.vendorId != null && String(p.vendor_id) === String(meta.vendorId)
          ? effectiveVendorSql
          : sqlUuid(p.vendor_id);
      const priceSql =
        typeof p.price === "number" && Number.isFinite(p.price) ? String(p.price) : "NULL";
      const stockSql =
        p.stock_quantity != null && Number.isFinite(Number(p.stock_quantity))
          ? String(Number(p.stock_quantity))
          : "NULL";
      const vals = [vpId, `'${tid}'::uuid`, vidSql, pid, priceSql, stockSql, "now()", "now()"];
      lines.push(`INSERT INTO ${schema}.vendor_products (${vpCols.join(", ")}) VALUES (${vals.join(", ")});`);
    }
    if (products.some((p) => p.vendor_id != null && p.vendor_id !== "")) lines.push("");
  }

  lines.push("");
  lines.push("COMMIT;");
  return lines.join("\n");
}

async function postApplySeedSql(sql) {
  const url = `${apiUrl}/v1/apply-seed-sql`;
  const res = await fetch(url, {
    method: "POST",
    headers: { "Content-Type": "application/json", "X-Api-Key": apiKey },
    body: JSON.stringify({ sql }),
  });
  const text = await res.text();
  let body;
  try {
    body = JSON.parse(text);
  } catch {
    body = text;
  }
  if (!res.ok) {
    console.error(`POST ${url} -> ${res.status}`, body);
    process.exit(1);
  }
  return body;
}

function relationId(v) {
  if (v == null) return null;
  if (typeof v === "string") return v;
  if (typeof v === "object" && "id" in v) return v.id;
  return null;
}

/**
 * @param {(slug: string) => { records: { list: (q: object) => Promise<{ data: unknown[]; total: number }> } }} tables
 */
async function listAll(tables, slug) {
  const out = [];
  let offset = 0;
  const limit = 250;
  for (;;) {
    const page = await tables(slug).records.list({ limit, offset, sort: "created_at", order: "asc" });
    out.push(...page.data);
    offset += page.data.length;
    if (page.data.length === 0 || out.length >= page.total) break;
  }
  return out;
}

const SKU_PREFIX_BY_TEMPLATE = {
  grocery: "SEED-TEMPLATE-GROCERY-%",
  store: "SEED-TEMPLATE-STORE-%",
  travel: "SEED-TEMPLATE-TRAVEL-%",
  hotels: "SEED-LON-HOTEL-%",
};

function templateKeyFromPackage() {
  const pkg = JSON.parse(readFileSync(join(process.cwd(), "package.json"), "utf8"));
  const m = pkg.name?.match(/template-([\w-]+)/);
  return m ? m[1] : "unknown";
}

async function exportCatalog() {
  const client = new AuroraClient({
    baseUrl: apiUrl,
    apiKey,
    specUrl: `${apiUrl}/v1/openapi.json`,
  });
  const tables = client.tables.bind(client);
  const vendors = await listAll(tables, "vendors");
  const zones = await listAll(tables, "zones");
  const categories = await listAll(tables, "categories");
  const products = await listAll(tables, "products");

  const slim = (rows, relationKeys) =>
    rows.map((r) => {
      const o = {};
      for (const [k, v] of Object.entries(r)) {
        if (["created_at", "updated_at", "holmes_insights"].includes(k)) continue;
        if (k === "category" || k === "vendor" || k === "zone") continue;
        if (relationKeys.has(k)) {
          o[k] = relationId(v) ?? v;
        } else {
          o[k] = v;
        }
      }
      return o;
    });

  const rel = new Set(["vendor_id", "zone_id", "category_id"]);
  const templateKey = templateKeyFromPackage();
  const skuPat = SKU_PREFIX_BY_TEMPLATE[templateKey] || "SEED-%";
  const categorySlugs = categories.map((c) => c.slug).filter(Boolean);
  const zoneSlugs = zones.map((z) => z.slug).filter(Boolean);
  const vendorIds = [...new Set(vendors.map((v) => v.id))];

  const catalogApply =
    templateKey === "grocery" ? "grocery_upsert" : "replace_chain";

  const seedMeta =
    catalogApply === "grocery_upsert"
      ? {
          catalogApply: "grocery_upsert",
          productSkuGuard: skuPat,
        }
      : {
          catalogApply: "replace_chain",
          deleteProductSkuLike: skuPat.replace(/%$/, "%"),
          categorySlugs,
          zoneSlug: zoneSlugs[0] || null,
          vendorId: vendorIds[0] || null,
        };

  const data = {
    version: 1,
    exportedAt: new Date().toISOString(),
    template: templateKey,
    seedMeta,
    vendors: slim(vendors, new Set()),
    zones: slim(zones, new Set(["vendor_id"])),
    categories: slim(categories, new Set(["zone_id"])),
    products: slim(products, rel),
  };

  writeFileSync(CATALOG_PATH, JSON.stringify(data, null, 2), "utf8");
  console.log(`Wrote ${CATALOG_PATH} (${products.length} products). Review seedMeta, then commit.`);
}

async function applyCatalog() {
  if (!existsSync(CATALOG_PATH)) {
    console.error(`Missing ${CATALOG_PATH}. Run: node scripts/catalog-seed.mjs export (with API env set), or restore init/ from git.`);
    process.exit(1);
  }
  const data = JSON.parse(readFileSync(CATALOG_PATH, "utf8"));
  const sql = buildCatalogSql(data);
  if (dryRun) {
    console.log(sql.slice(0, 6000) + (sql.length > 6000 ? "\n... [truncated]" : ""));
    return;
  }
  const body = await postApplySeedSql(sql);
  console.log("Catalog seed applied:", body);
}

async function main() {
  if (!apiUrl || !apiKey) {
    console.error("Set AURORA_API_URL and AURORA_API_KEY in .env.local");
    process.exit(1);
  }
  if (cmd === "export") {
    await exportCatalog();
    return;
  }
  if (cmd === "apply") {
    await applyCatalog();
    return;
  }
  console.error("Usage: node catalog-seed.mjs apply|export [--dry-run]");
  process.exit(1);
}

function isRunAsCli() {
  const entry = process.argv[1];
  if (!entry) return false;
  try {
    return import.meta.url === pathToFileURL(resolve(entry)).href;
  } catch {
    return false;
  }
}

if (isRunAsCli()) {
  main().catch((e) => {
    console.error(e);
    process.exit(1);
  });
}
