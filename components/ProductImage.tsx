"use client";

import { useState } from "react";
import {
  resolveProductImageUrl,
  getImageUrlFromRecord,
  getThumbnailImageUrl,
} from "@/lib/image-url";
import { useStoreConfigImageBase } from "./StoreConfigContext";

type ProductImageProps = {
  src?: string | null;
  alt?: string;
  baseUrl?: string | null;
  className?: string;
  fallback?: React.ReactNode;
  /** For record-based usage - pass record to extract url */
  record?: Record<string, unknown>;
  /**
   * How to fit the image in its container when aspect ratios differ.
   * - "contain": Preserve aspect ratio, show full image (may letterbox). Use for product thumbs with mixed aspect ratios.
   * - "cover": Fill container, crop if needed. Default.
   */
  objectFit?: "cover" | "contain";
  /**
   * When true, requests CDN-optimized thumbnail size for Contentful URLs (reduces payload for small displays).
   */
  thumbnail?: boolean;
};

const DEFAULT_FALLBACK = (
  <span
    className="w-full h-full flex items-center justify-center text-aurora-muted text-2xl"
    aria-hidden
  >
    –
  </span>
);

const objectFitClass = {
  cover: "object-cover",
  contain: "object-contain",
} as const;

/**
 * Product image with onError fallback to avoid broken image icons.
 * Uses imageBaseUrl from store config (or baseUrl prop) for relative URLs.
 * Use objectFit="contain" for product cards to preserve portrait/landscape aspect ratios.
 */
export function ProductImage({
  src,
  alt = "",
  baseUrl,
  className,
  fallback = DEFAULT_FALLBACK,
  record,
  objectFit = "cover",
  thumbnail = false,
}: ProductImageProps) {
  const [errored, setErrored] = useState(false);
  const configBase = useStoreConfigImageBase();

  const rawUrl = record !== undefined ? getImageUrlFromRecord(record) : src;
  let resolved = resolveProductImageUrl(rawUrl, baseUrl ?? configBase);
  if (resolved && thumbnail) {
    resolved = getThumbnailImageUrl(resolved) ?? resolved;
  }

  const fitClass = objectFitClass[objectFit];
  const base = (className ?? "w-full h-full")
    .replace(/\bobject-(cover|contain)\b/g, "")
    .trim();
  const mergedClassName = base ? `${base} ${fitClass}`.trim() : `w-full h-full ${fitClass}`;

  if (!resolved || errored) {
    return (
      <div className="w-full h-full flex items-center justify-center min-h-[1px]">
        {fallback}
      </div>
    );
  }

  return (
    <img
      src={resolved}
      alt={alt}
      className={mergedClassName}
      onError={() => setErrored(true)}
    />
  );
}
