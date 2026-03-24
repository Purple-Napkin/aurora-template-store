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
        <div className="relative overflow-hidden rounded-lg bg-gradient-to-br from-aurora-primary/12 via-aurora-surface to-aurora-surface border border-aurora-primary/35 px-5 py-6 sm:px-6 sm:py-8 hover:border-aurora-primary/55 transition-[border-color,box-shadow] duration-150 ease-out shadow-[inset_0_1px_0_rgb(255_255_255/0.45),0_2px_14px_rgb(29_78_216/0.1)] hover:shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_4px_18px_rgb(29_78_216/0.14)]">
          <div
            className="absolute top-4 right-4 flex items-center justify-center w-9 h-9 rounded-md bg-aurora-primary/15 text-aurora-primary ring-1 ring-inset ring-aurora-primary/20"
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
          <span className="inline-flex items-center gap-2 text-sm font-bold text-aurora-primary">
            View bundle →
          </span>
        </div>
      </Link>
    );
  }

  return (
    <div className="w-full relative overflow-hidden rounded-lg sm:rounded-xl bg-gradient-to-br from-aurora-primary/12 via-aurora-surface to-aurora-surface border border-aurora-primary/35 px-6 py-10 sm:px-10 sm:py-14 shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_2px_16px_rgb(29_78_216/0.08)]">
      <h1 className="font-display text-2xl sm:text-3xl md:text-4xl font-bold text-aurora-text mb-2">
        Working on {displayTitle}?
      </h1>
      <p className="text-aurora-muted text-base sm:text-lg max-w-xl mb-6">
        Review parts, grab missing consumables or the right driver for your screws, and add everything in one pass.
      </p>
      <Link
        href={`/combos/${encodeURIComponent(recipeSlug)}`}
        className="inline-flex items-center gap-2 px-6 py-3 rounded-md bg-aurora-primary text-white font-bold shadow-[inset_0_1px_0_rgb(255_255_255/0.12)] transition-[filter,transform] duration-150 ease-out hover:brightness-105 hover:-translate-y-px"
      >
        View bundle
      </Link>
    </div>
  );
}
