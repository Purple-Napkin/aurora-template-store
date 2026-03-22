import type { SearchHit } from "@aurora-studio/starter-core";
import { toCents } from "@aurora-studio/starter-core";

/** Prefer hits with price + image when Meilisearch / listing views return duplicate recordIds. */
function hitQuality(h: SearchHit): number {
  const r = h as Record<string, unknown>;
  let s = 0;
  const price =
    h.price ?? r.price ?? r.list_price ?? r.sale_price ?? r.unit_amount ?? r.retail_price;
  if (price != null && Number.isFinite(Number(price)) && Number(price) > 0) s += 4;
  if (h.image_url) s += 2;
  const n = h.name ?? h.title;
  if (n && String(n).trim()) s += 1;
  return s;
}

export function dedupeSearchHitsByRecordId(hits: SearchHit[]): SearchHit[] {
  const map = new Map<string, SearchHit>();
  for (const h of hits) {
    const id = String(h.recordId ?? h.id ?? "").trim();
    if (!id) continue;
    const cur = map.get(id);
    if (!cur || hitQuality(h) > hitQuality(cur)) map.set(id, h);
  }
  return [...map.values()];
}

/** Decimal major units (e.g. 12.99 = £12.99). Falls back to integer minor (pence) in `unit_amount` when no decimal price fields. */
export function getPriceMajor(record: Record<string, unknown>): number | undefined {
  const r = record as SearchHit;
  const p =
    r.price ??
    record.price ??
    record.list_price ??
    record.sale_price ??
    record.retail_price ??
    record.amount ??
    record.value;
  if (p != null && Number.isFinite(Number(p))) return Number(p);
  const ua = record.unit_amount;
  if (ua != null && Number.isFinite(Number(ua))) {
    const n = Number(ua);
    if (Number.isInteger(n) && n > 0) return n / 100;
  }
  return undefined;
}

export function resolveCataloguePriceCents(
  record: Record<string, unknown>,
  sellByWeight: boolean,
  pricePerUnit: number | undefined
): number | undefined {
  if (sellByWeight && pricePerUnit != null) return Math.round(Number(pricePerUnit) * 100);
  const major = getPriceMajor(record);
  return major != null ? toCents(major) : undefined;
}

/** When `stock_quantity` (or aliases) exists on the search hit — matches reference “In stock” row. */
export function getStockStatus(
  record: Record<string, unknown>
): { label: string; inStock: boolean } | null {
  const raw = record.stock_quantity ?? record.stock ?? record.qty_available;
  if (raw === null || raw === undefined || raw === "") return null;
  const n = Number(raw);
  if (!Number.isFinite(n)) return null;
  if (n > 0) return { label: "In stock", inStock: true };
  return { label: "Out of stock", inStock: false };
}
