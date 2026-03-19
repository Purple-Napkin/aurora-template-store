"use client";

import { useState } from "react";
import { ProductImage } from "./ProductImage";

function getImageUrls(record: Record<string, unknown>): string[] {
  const images = record.images;
  if (Array.isArray(images) && images.length > 0) {
    return [...new Set(images.filter((u): u is string => typeof u === "string"))];
  }
  const primary = ["image_url", "image", "thumbnail", "photo"].find((f) => record[f]);
  const primaryUrl = primary ? String(record[primary]) : null;
  const extras = ["image_2", "image_3", "image_4"].filter((f) => record[f]).map((f) => String(record[f]));
  if (primaryUrl) return [primaryUrl, ...extras];
  return extras;
}

type ProductImageGalleryProps = {
  record: Record<string, unknown>;
};

export function ProductImageGallery({ record }: ProductImageGalleryProps) {
  const urls = getImageUrls(record);
  const [selected, setSelected] = useState(0);

  if (urls.length === 0) {
    return (
      <div className="pattern-well rounded-component overflow-hidden aspect-square flex items-center justify-center text-aurora-muted text-6xl">
         - 
      </div>
    );
  }

  const mainUrl = urls[selected] ?? urls[0];

  return (
    <div className="space-y-3">
      <div className="pattern-well rounded-xl overflow-hidden aspect-square shadow-sm ring-1 ring-aurora-border/50 p-4">
        <ProductImage
          src={mainUrl}
          className="w-full h-full object-contain cursor-zoom-in"
          fallback={
            <span className="w-full h-full flex items-center justify-center text-aurora-muted text-4xl">-</span>
          }
        />
      </div>
      {urls.length > 1 && (
        <div className="flex gap-2 overflow-x-auto pb-1">
          {urls.map((url, i) => (
            <button
              key={i}
              type="button"
              onClick={() => setSelected(i)}
              className={`shrink-0 w-16 h-16 rounded-lg overflow-hidden border-2 bg-aurora-surface-hover transition-colors ${
                selected === i ? "border-aurora-primary" : "border-aurora-border hover:border-aurora-primary/50"
              }`}
            >
              <ProductImage
                src={url}
                className="w-full h-full object-contain"
                fallback={<span className="w-full h-full flex items-center justify-center text-aurora-muted text-sm">-</span>}
              />
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
