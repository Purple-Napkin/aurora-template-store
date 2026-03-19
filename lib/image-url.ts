/**
 * Centralized product image URL resolution.
 * Ensures relative URLs get correct base (storefront or CDN) so images load reliably.
 */

const IMAGE_FIELDS = ["image_url", "image", "thumbnail", "photo"] as const;

/**
 * Extract image URL from a product/record.
 */
export function getImageUrlFromRecord(
  record: Record<string, unknown>
): string | null {
  const field = IMAGE_FIELDS.find((f) => record[f]);
  return field ? String(record[field]).trim() || null : null;
}

/**
 * Resolve product image URL for display.
 * - Empty/invalid URLs return null.
 * - Absolute URLs (http/https) returned as-is.
 * - Relative URLs get baseUrl prepended (storefront origin or imageBaseUrl from config).
 */
export function resolveProductImageUrl(
  url: string | null | undefined,
  baseUrl?: string | null
): string | null {
  const raw = typeof url === "string" ? url.trim() : "";
  if (!raw) return null;

  if (raw.startsWith("http://") || raw.startsWith("https://")) {
    return raw;
  }

  const base =
    baseUrl ??
    (typeof window !== "undefined"
      ? window.location?.origin
      : null) ??
    process.env.NEXT_PUBLIC_APP_URL?.trim() ??
    "";

  if (!base) return raw.startsWith("/") ? raw : `/${raw}`;

  const normalized = base.replace(/\/$/, "");
  const path = raw.startsWith("/") ? raw : `/${raw}`;
  return `${normalized}${path}`;
}
