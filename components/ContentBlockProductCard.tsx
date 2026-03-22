"use client";

import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import {
  ProductImage,
  ProductSaleBadge,
  getThumbnailImageUrl,
  resolveProductImageUrl,
  useStoreConfigImageBase,
  formatPrice,
  toCents,
} from "@aurora-studio/starter-core";

export type ContentBlockProduct = {
  id: string;
  name: string;
  price?: number;
  image_url?: string;
  on_sale?: boolean;
};

/** `split` = opaque packshots: warm light stage + cream text band (reference: Nescafe card). `radial` = true alpha PNG: coloured well on one tile. */
type CardLayoutMode = "radial" | "split";

function productCardBackdropIndex(id: string, modulo: number): number {
  let h = 0;
  for (let i = 0; i < id.length; i++) {
    h = (h * 31 + id.charCodeAt(i)) | 0;
  }
  return Math.abs(h) % modulo;
}

const RADIAL_LIGHT: readonly string[] = [
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgb(52_211_153)_0%,rgb(110_231_183)_18%,rgb(167_243_208)_40%,rgb(209_250_229)_68%,rgb(236_253_245)_88%,rgb(245_245_244)_100%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgb(250_204_21)_0%,rgb(253_224_71)_20%,rgb(254_240_138)_42%,rgb(254_249_195)_70%,rgb(254_252_232)_90%,rgb(245_245_244)_100%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgb(59_130_246)_0%,rgb(96_165_250)_18%,rgb(147_197_253)_42%,rgb(191_219_254)_68%,rgb(224_231_255)_88%,rgb(245_245_244)_100%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgb(168_85_247)_0%,rgb(192_132_252)_22%,rgb(216_180_254)_44%,rgb(233_213_255)_70%,rgb(243_232_255)_90%,rgb(245_245_244)_100%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgb(244_63_94)_0%,rgb(251_113_133)_20%,rgb(253_164_175)_44%,rgb(254_205_211)_70%,rgb(255_228_230)_90%,rgb(245_245_244)_100%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgb(6_182_212)_0%,rgb(34_211_238)_20%,rgb(103_232_249)_44%,rgb(165_243_252)_70%,rgb(207_250_254)_90%,rgb(245_245_244)_100%)]",
];

const RADIAL_DARK: readonly string[] = [
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgba(16,185,129,0.5)_0%,rgba(52,211,153,0.28)_38%,rgba(255,255,255,0.05)_68%,transparent_92%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgba(245,158,11,0.45)_0%,rgba(251,191,36,0.26)_38%,rgba(255,255,255,0.05)_68%,transparent_92%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgba(59,130,246,0.48)_0%,rgba(96,165,250,0.28)_38%,rgba(255,255,255,0.05)_68%,transparent_92%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgba(168,85,247,0.45)_0%,rgba(192,132,252,0.26)_38%,rgba(255,255,255,0.05)_68%,transparent_92%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgba(244,63,94,0.42)_0%,rgba(251,113,133,0.24)_38%,rgba(255,255,255,0.05)_68%,transparent_92%)]",
  "bg-[radial-gradient(ellipse_92%_88%_at_50%_24%,rgba(6,182,212,0.45)_0%,rgba(34,211,238,0.26)_38%,rgba(255,255,255,0.05)_68%,transparent_92%)]",
];

/**
 * Initial layout before probe: always **split** (opaque packshot). Probe may upgrade to **radial**
 * only when we see enough real transparency — avoids classifying opaque PNGs (or antialiased edges) as radial.
 */
function guessLayoutFromUrl(_src: string | null | undefined): CardLayoutMode {
  return "split";
}

/**
 * Canvas probe:
 * - Meaningful transparency (enough near-clear or semi-clear pixels) → **radial**.
 * - Otherwise → **split** (opaque packshot: light stage + cream band + multiply).
 */
function probeImageLayout(absoluteUrl: string): Promise<CardLayoutMode> {
  return new Promise((resolve) => {
    const img = new Image();
    img.crossOrigin = "anonymous";
    const done = (m: CardLayoutMode) => {
      clearTimeout(tid);
      resolve(m);
    };
    const tid = setTimeout(() => done("split"), 4000);
    img.onload = () => {
      try {
        const sw = 48;
        const sh = 48;
        const canvas = document.createElement("canvas");
        canvas.width = sw;
        canvas.height = sh;
        const ctx = canvas.getContext("2d", { willReadFrequently: true });
        if (!ctx) {
          done("split");
          return;
        }
        ctx.drawImage(img, 0, 0, sw, sh);
        const { data } = ctx.getImageData(0, 0, sw, sh);
        const total = sw * sh;
        /** Near-opaque antialias on packshots often sits in 240–254; real holes are much lower. */
        let strongTransparent = 0;
        let softTransparent = 0;
        for (let y = 0; y < sh; y++) {
          for (let x = 0; x < sw; x++) {
            const i = (y * sw + x) * 4;
            const a = data[i + 3]!;
            if (a < 28) strongTransparent++;
            if (a < 235) softTransparent++;
          }
        }
        const minStrong = Math.max(40, Math.floor(total * 0.004));
        const minSoftRatio = 0.11;
        const looksCutout =
          strongTransparent >= minStrong ||
          softTransparent / total >= minSoftRatio;
        done(looksCutout ? "radial" : "split");
      } catch {
        done("split");
      }
    };
    img.onerror = () => done("split");
    img.src = absoluteUrl;
  });
}

const cardShell =
  "border border-aurora-border/55 shadow-sm shadow-black/[0.04] transition-[box-shadow,border-color] duration-200 ease-out hover:border-aurora-primary/22 hover:shadow-md hover:shadow-black/[0.07] dark:border-aurora-border/40 dark:shadow-none dark:ring-1 dark:ring-inset dark:ring-white/[0.06] dark:hover:shadow-lg dark:hover:shadow-black/40";

function TitlePrice({
  prod,
  currency = "GBP",
  titleClassName = "text-aurora-text",
}: {
  prod: ContentBlockProduct;
  /** ISO 4217 (e.g. GBP). Must match PDP / cart (`formatPrice` + `toCents` pipeline). */
  currency?: string;
  titleClassName?: string;
}) {
  const cents = prod.price != null ? toCents(Number(prod.price)) : undefined;
  const showPrice = cents != null && cents > 0;
  return (
    <>
      <p
        className={`line-clamp-2 min-h-[2.75rem] text-[0.9375rem] font-bold leading-snug tracking-tight sm:text-base ${titleClassName}`}
      >
        {prod.name}
      </p>
      {showPrice ? (
        <p className="text-lg font-extrabold tracking-tight text-aurora-primary tabular-nums sm:text-xl">
          {formatPrice(cents, currency)}
        </p>
      ) : null}
    </>
  );
}

export function ContentBlockProductCard({
  prod,
  currency = "GBP",
  withHolmesMarkers = true,
}: {
  prod: ContentBlockProduct;
  currency?: string;
  withHolmesMarkers?: boolean;
}) {
  const cardMarkers = withHolmesMarkers
    ? ({ "data-holmes-home-card": true } as const)
    : {};
  const imgMarkers = withHolmesMarkers
    ? ({ "data-holmes-home-card-image": true } as const)
    : {};

  const imageBase = useStoreConfigImageBase();
  const resolved = useMemo(() => {
    const base = imageBase ?? process.env.NEXT_PUBLIC_APP_URL ?? null;
    let r = resolveProductImageUrl(prod.image_url, base);
    if (r) r = getThumbnailImageUrl(r) ?? r;
    return r;
  }, [prod.image_url, imageBase]);

  const [layout, setLayout] = useState<CardLayoutMode>(() =>
    guessLayoutFromUrl(prod.image_url)
  );

  useEffect(() => {
    setLayout(guessLayoutFromUrl(prod.image_url));
    if (!resolved) return;
    let cancelled = false;
    probeImageLayout(resolved).then((m) => {
      if (!cancelled) setLayout(m);
    });
    return () => {
      cancelled = true;
    };
  }, [resolved, prod.image_url]);

  const bi = productCardBackdropIndex(prod.id, RADIAL_LIGHT.length);
  const lightWell = RADIAL_LIGHT[bi];
  const darkWell = RADIAL_DARK[bi];

  const imgShared = {
    src: prod.image_url,
    alt: prod.name,
    baseUrl: process.env.NEXT_PUBLIC_APP_URL,
    objectFit: "cover" as const,
    thumbnail: true as const,
    fallback: (
      <span className="flex h-full min-h-[5rem] w-full items-center justify-center text-aurora-muted text-2xl font-light">
        —
      </span>
    ),
  };

  if (layout === "split") {
    return (
      <Link
        href={`/catalogue/${prod.id}`}
        {...cardMarkers}
        className={`store-cms-product-card group flex h-full min-h-0 flex-col overflow-hidden rounded-xl bg-white p-0 ${cardShell}`}
      >
        {prod.on_sale ? <span className="sr-only">On sale. </span> : null}
        <div
          {...imgMarkers}
          className="store-cb-media relative block aspect-square w-full shrink-0 overflow-hidden bg-white dark:bg-white"
        >
          <ProductImage
            {...imgShared}
            className="absolute inset-0 h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.02]"
          />
          {prod.on_sale ? <ProductSaleBadge /> : null}
        </div>
        <div className="border-t border-stone-200/90 bg-[#faf8f5] px-4 py-3.5 sm:px-5 sm:py-4">
          <div className="flex min-h-0 flex-1 flex-col gap-1.5 text-stone-900">
            <TitlePrice prod={prod} currency={currency} titleClassName="text-stone-900" />
          </div>
        </div>
      </Link>
    );
  }

  return (
    <Link
      href={`/catalogue/${prod.id}`}
      {...cardMarkers}
      className={`store-cms-product-card group flex h-full min-h-0 flex-col rounded-3xl bg-aurora-surface p-4 sm:p-5 ${cardShell}`}
    >
      {prod.on_sale ? <span className="sr-only">On sale. </span> : null}
      <div
        {...imgMarkers}
        className="store-cb-media relative isolate mb-4 aspect-square overflow-hidden rounded-2xl ring-1 ring-black/[0.03] dark:ring-white/[0.07]"
      >
        <div
          className={`pointer-events-none absolute inset-0 dark:hidden ${lightWell}`}
          aria-hidden
        />
        <div
          className={`pointer-events-none absolute inset-0 hidden dark:block ${darkWell}`}
          aria-hidden
        />
        <ProductImage
          {...imgShared}
          className="absolute inset-0 z-10 h-full w-full transition-transform duration-200 ease-out group-hover:scale-[1.03] dark:drop-shadow-[0_6px_18px_rgba(0,0,0,0.35)]"
        />
        {prod.on_sale ? <ProductSaleBadge /> : null}
      </div>
      <div className="flex min-h-0 flex-1 flex-col gap-1.5">
        <TitlePrice prod={prod} currency={currency} />
      </div>
    </Link>
  );
}
