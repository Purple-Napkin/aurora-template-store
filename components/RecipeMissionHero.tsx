"use client";

import Link from "next/link";
import { Lightbulb } from "lucide-react";

interface RecipeMissionHeroProps {
  recipeTitle: string;
  recipeSlug: string;
  /** When true, renders a compact card above the form (with insight icon) */
  compact?: boolean;
}

export function RecipeMissionHero({ recipeTitle, recipeSlug, compact }: RecipeMissionHeroProps) {
  const displayTitle = recipeTitle.length > 60 ? recipeTitle.slice(0, 57) + "…" : recipeTitle;

  if (compact) {
    return (
      <Link
        href={`/combos/${encodeURIComponent(recipeSlug)}`}
        className="block w-full"
      >
        <div className="relative overflow-hidden rounded-2xl bg-gradient-to-br from-aurora-primary/15 via-aurora-primary/8 to-aurora-surface border border-aurora-primary/30 px-5 py-6 sm:px-6 sm:py-8 hover:border-aurora-primary/50 transition-all shadow-[0_0_24px_rgba(31,169,113,0.12)] hover:shadow-[0_0_28px_rgba(31,169,113,0.18)]">
          <div
            className="insight-icon-glow absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-full bg-aurora-primary/25 text-aurora-primary"
            aria-hidden
          >
            <Lightbulb className="w-5 h-5" strokeWidth={2} />
          </div>
          <h2 className="font-display text-lg sm:text-xl md:text-2xl font-bold text-aurora-text mb-1.5 pr-12">
            Working on {displayTitle}?
          </h2>
          <p className="text-aurora-muted text-sm sm:text-base mb-4 line-clamp-2">
            We lined up this bundle from your intent—open it for line items, compatible add-ons, and any deal pricing.
          </p>
          <span className="inline-flex items-center gap-2 text-sm font-semibold text-aurora-primary">
            View bundle →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="w-full relative overflow-hidden rounded-2xl sm:rounded-3xl bg-gradient-to-br from-aurora-primary/15 via-aurora-primary/8 to-aurora-surface border border-aurora-primary/30 px-6 py-10 sm:px-10 sm:py-14">
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-aurora-text mb-2">
        Working on {displayTitle}?
      </h1>
      <p className="text-aurora-muted text-base sm:text-lg max-w-xl mb-6">
        Review parts, grab missing consumables or the right driver for your screws, and add everything in one pass.
      </p>
      <Link
        href={`/combos/${encodeURIComponent(recipeSlug)}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-aurora-primary text-white font-semibold hover:bg-aurora-primary-dark transition-colors"
      >
        View bundle
      </Link>
    </div>
  );
}
