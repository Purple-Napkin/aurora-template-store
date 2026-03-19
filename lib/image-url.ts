/**
 * Centralized product image URL resolution.
 * Ensures relative URLs get correct base (storefront or CDN) so images load reliably.
 * Supports Contentful CDN resize params to request appropriately-sized thumbnails.
 */

const IMAGE_FIELDS = ["image_url", "image", "thumbnail", "photo"] as const;

/** Matches Contentful CDN URLs (images.ctfassets.net or images.eu.ctfassets.net), with or without protocol */
const CONTENTFUL_CDN_RE = /^(https?:)?\/\/images\.(eu\.)?ctfassets\.net\//i;

/**
 * For Contentful CDN URLs, append resize params so the CDN returns an appropriately-sized
 * image. Uses fit=pad to preserve aspect ratio and avoid cropping portrait/landscape images.
 * Other URLs are returned unchanged.
 */
export function getThumbnailImageUrl(
  url: string | null | undefined,
  width = 400,
  height = 400
): string | null {
  const raw = typeof url === "string" ? url.trim() : "";
  if (!raw) return null;
  if (!CONTENTFUL_CDN_RE.test(raw)) return raw;

  try {
    const u = new URL(raw.startsWith("//") ? `https:${raw}` : raw);
    const params = u.searchParams;
    if (params.has("w") || params.has("h")) return raw.startsWith("//") ? `https:${raw}` : raw;
    params.set("w", String(Math.min(4000, width)));
    params.set("h", String(Math.min(4000, height)));
    params.set("fit", "pad");
    params.set("fm", "webp");
    return u.toString();
  } catch {
    return raw;
  }
}

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
  if (raw.startsWith("//")) {
    return `https:${raw}`;
  }

  const base =
    baseUrl ??
    process.env.NEXT_PUBLIC_IMAGE_BASE_URL?.trim() ??
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
