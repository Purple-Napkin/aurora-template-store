"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { ProductImage } from "@/components/ProductImage";

/** Gradient backgrounds when no image - gives each card a distinct feel */
const CARD_GRADIENTS = [
  "from-emerald-500/20 to-teal-600/20",
  "from-amber-500/20 to-orange-600/20",
  "from-rose-500/20 to-pink-600/20",
  "from-violet-500/20 to-purple-600/20",
  "from-sky-500/20 to-blue-600/20",
  "from-lime-500/20 to-green-600/20",
];

type Category = { name: string; slug: string; image_url?: string };

export function CategoryCards() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [suggestedSlugs, setSuggestedSlugs] = useState<string[]>([]);

  useEffect(() => {
    let cancelled = false;
    Promise.all([
      fetch("/api/categories").then((r) => r.json()),
      (() => {
        const sid = (window as { holmes?: { getSessionId?: () => string } }).holmes?.getSessionId?.();
        if (!sid) return Promise.resolve({ suggested: [] });
        return fetch(`/api/category-suggestions?sid=${encodeURIComponent(sid)}`).then((r) =>
          r.ok ? r.json() : { suggested: [] }
        );
      })(),
    ]).then(([catRes, sugRes]) => {
      if (cancelled) return;
      const cats = (catRes.categories ?? []) as Category[];
      setCategories(cats);
      setSuggestedSlugs((sugRes.suggested ?? []) as string[]);
    });
    return () => { cancelled = true; };
  }, []);

  // Order: suggested first, then rest
  const ordered =
    suggestedSlugs.length > 0
      ? [
          ...suggestedSlugs
            .map((slug) => categories.find((c) => c.slug === slug || c.slug === slug.toLowerCase().replace(/\s+/g, "-")))
            .filter((c): c is Category => Boolean(c)),
          ...categories.filter((c) => !suggestedSlugs.some((s) => s === c.slug || s === c.slug.toLowerCase().replace(/\s+/g, "-"))),
        ]
      : categories;

  if (ordered.length === 0) return null;

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3 sm:gap-4">
      {ordered.map((cat, i) => (
        <Link
          key={cat.slug}
          href={`/catalogue?category=${encodeURIComponent(cat.slug)}`}
          className="group block rounded-xl overflow-hidden bg-aurora-surface border border-aurora-border hover:border-aurora-primary/50 hover:shadow-lg hover:shadow-aurora-primary/10 transition-all duration-200"
        >
          <div
            className={`aspect-[4/3] relative bg-gradient-to-br ${
              CARD_GRADIENTS[i % CARD_GRADIENTS.length]
            }`}
          >
            {cat.image_url ? (
              <div className="absolute inset-0">
                <ProductImage
                  src={cat.image_url}
                  className="w-full h-full object-cover opacity-90 group-hover:opacity-100 transition-opacity"
                  fallback={null}
                />
              </div>
            ) : null}
            <div className="absolute inset-0 flex items-end p-3">
              <span className="font-semibold text-sm text-aurora-text drop-shadow-sm bg-aurora-bg/60 px-2 py-0.5 rounded">
                {cat.name}
              </span>
            </div>
          </div>
        </Link>
      ))}
    </div>
  );
}
