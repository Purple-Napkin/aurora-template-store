"use client";

import { useEffect, useRef, useState } from "react";
import type { ReactNode } from "react";
import Link from "next/link";
import { ProductImage } from "@aurora-studio/starter-core";
import { ChefHat } from "lucide-react";
import { getTimeOfDay } from "@aurora-studio/starter-core";
import { useStore } from "@aurora-studio/starter-core";
import { RecipeProductCollage } from "./RecipeProductCollage";
import {
  BlurbBlock,
  ContentBlockProductCard,
  groupHalfWidthSections,
  type StoreContentSection,
} from "./storeContentBlocksUi";

type Section = {
  type?: string;
  title: string;
  subtitle?: string;
  products?: Array<{ id: string; name: string; price?: number; image_url?: string }>;
  cards?: Array<{ title: string; imageUrl: string | null; linkUrl: string }>;
  imageUrl?: string | null;
  blockKind?: "product_list" | "search_terms" | "blurb" | "image_blurb";
  body?: string;
  linkHref?: string;
  linkLabel?: string;
  layoutWidth?: "full" | "half";
};

type HomeData = {
  sections: Section[];
  hero?: unknown;
  timeOfDay?: "morning" | "afternoon" | "evening";
};

/** Trust signal for section - builds user confidence */
function getTrustSignal(section: Section, timeOfDay: string, storeName?: string): string | null {
  switch (section.type) {
    case "meals":
      return timeOfDay === "evening"
        ? "Evening rush — popular picks on the trade counter"
        : `Highlights for ${timeOfDay}`;
    case "for_you":
      return "Based on your browsing";
    case "top_up":
      return "Popular essentials";
    case "featured":
      if (section.blockKind === "search_terms") return "Matched search picks";
      if (section.blockKind === "product_list") return "Curated picks";
      return storeName ? `Popular at ${storeName}` : "Popular right now";
    default:
      return null;
  }
}

type RecipeWithProducts = {
  id: string;
  slug: string;
  title: string;
  description: string | null;
  productImageUrls?: string[];
};

/** Single adaptive feed - listens for Holmes data, renders with trust signals */
export function AdaptiveFeed({
  children,
  recipes,
  currency = "gbp",
}: {
  children: React.ReactNode;
  recipes: RecipeWithProducts[];
  currency?: string;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [holmesData, setHolmesData] = useState<HomeData | null>(null);
  const { store } = useStore();
  const clientTimeOfDay = getTimeOfDay();
  const timeOfDay = holmesData?.timeOfDay ?? clientTimeOfDay;
  const currencyCode = currency.length >= 3 ? currency.toUpperCase() : "GBP";

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const handler = (e: Event) => {
      const ev = e as CustomEvent<HomeData>;
      if (ev.detail?.sections?.length) {
        e.preventDefault();
        setHolmesData(ev.detail);
      }
    };
    el.addEventListener("holmes:homeSections", handler);
    return () => el.removeEventListener("holmes:homeSections", handler);
  }, []);

  const sections = holmesData?.sections ?? null;

  if (!sections) {
    return (
      <div ref={ref} data-holmes="home-sections" className="py-6">
        {children}
      </div>
    );
  }

  const renderHolmesSection = (sec: Section, key: string): ReactNode => {
    const trustSignal = getTrustSignal(sec, timeOfDay, store?.name);

    if (sec.type === "meals" && recipes.length > 0) {
      return null;
    }

    const isBlurbLike =
      sec.blockKind === "blurb" ||
      sec.blockKind === "image_blurb" ||
      (sec.type === "promo" && !sec.products?.length && !sec.cards?.length);
    if (isBlurbLike) {
      const t = (sec.title || "").trim();
      if (!sec.body?.trim() && !t && !sec.imageUrl) return null;
      return (
        <div key={key} className="min-w-0 h-full">
          <BlurbBlock sec={sec as StoreContentSection} withHolmesMarkers={false} />
        </div>
      );
    }

    if (sec.type === "inspiration") {
      if (!sec.cards?.length) return null;
      return (
        <section key={key} className="space-y-3 min-w-0">
          <div>
            <h2 className="text-lg font-bold text-aurora-text">{sec.title}</h2>
            {sec.subtitle && (
              <p className="text-sm text-aurora-muted mt-0.5">{sec.subtitle}</p>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sec.cards.map((card, j) => (
              <Link
                key={j}
                href={card.linkUrl || "/catalogue"}
                className="block p-3 rounded-xl bg-aurora-surface border border-aurora-border hover:border-aurora-primary/40 transition-all"
              >
                <div className="aspect-square rounded-lg bg-aurora-surface-hover mb-2 overflow-hidden">
                  <ProductImage
                    src={card.imageUrl}
                    className="w-full h-full"
                    thumbnail
                    fallback={
                      <span className="w-full h-full flex items-center justify-center text-aurora-muted text-sm text-center px-2">
                        {card.title}
                      </span>
                    }
                  />
                </div>
                <p className="font-semibold text-sm truncate">{card.title}</p>
              </Link>
            ))}
          </div>
        </section>
      );
    }

    if (sec.products && sec.products.length > 0) {
      return (
        <section key={key} className="space-y-3 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-aurora-text">{sec.title}</h2>
            {trustSignal && (
              <span className="text-xs text-aurora-muted font-medium">{trustSignal}</span>
            )}
          </div>
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-4 sm:gap-5">
            {sec.products.map((prod) => (
              <ContentBlockProductCard
                key={prod.id}
                prod={prod}
                currency={currencyCode}
                withHolmesMarkers={false}
              />
            ))}
          </div>
        </section>
      );
    }

    if (sec.cards && sec.cards.length > 0) {
      return (
        <section key={key} className="space-y-3 min-w-0">
          <div className="flex items-baseline justify-between gap-2">
            <h2 className="text-lg font-bold text-aurora-text">{sec.title}</h2>
            {trustSignal && (
              <span className="text-xs text-aurora-muted font-medium">{trustSignal}</span>
            )}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sec.cards.map((card, j) => (
              <Link
                key={j}
                href={card.linkUrl || "/catalogue"}
                className="block p-3 rounded-xl bg-aurora-surface border border-aurora-border hover:border-aurora-primary/40 transition-all"
              >
                <div className="aspect-square rounded-lg bg-aurora-surface-hover mb-2 overflow-hidden">
                  <ProductImage
                    src={card.imageUrl}
                    className="w-full h-full"
                    thumbnail
                    fallback={
                      <span className="w-full h-full flex items-center justify-center text-aurora-muted text-sm">
                        {card.title}
                      </span>
                    }
                  />
                </div>
                <p className="font-semibold text-sm truncate">{card.title}</p>
              </Link>
            ))}
          </div>
        </section>
      );
    }

    return null;
  };

  const grouped = groupHalfWidthSections(sections as StoreContentSection[]);

  return (
    <div ref={ref} data-holmes="home-sections" className="py-6">
      <div className="space-y-10">
        {recipes.length > 0 && (
          <section className="space-y-3">
            <h2 className="text-lg font-bold text-aurora-text flex items-center gap-2">
              <ChefHat className="w-5 h-5 text-aurora-primary" />
              Kits & bundles
            </h2>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
              {recipes.slice(0, 4).map((r) => (
                <Link
                  key={r.id}
                  href={`/combos/${encodeURIComponent(r.slug)}`}
                  className="block p-3 rounded-xl bg-aurora-surface border border-aurora-border hover:border-aurora-primary/40 transition-all"
                >
                  <div className="aspect-square rounded-lg mb-2 overflow-hidden">
                    <RecipeProductCollage
                      imageUrls={r.productImageUrls ?? []}
                      className="w-full h-full"
                    />
                  </div>
                  <p className="font-semibold text-sm truncate">{r.title}</p>
                </Link>
              ))}
            </div>
          </section>
        )}
        {grouped.map((g, gi) => {
          if (g.mode === "pair") {
            return (
              <div
                key={`pair-${gi}`}
                className="grid grid-cols-1 md:grid-cols-2 gap-6 items-stretch"
              >
                {g.secs.map((sec, si) =>
                  renderHolmesSection(sec as Section, `p-${gi}-${si}`)
                )}
              </div>
            );
          }
          return renderHolmesSection(g.sec as Section, `f-${gi}`);
        })}
      </div>
    </div>
  );
}
