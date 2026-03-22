"use client";

import { Sparkles, ArrowLeft } from "lucide-react";
import { RecipeFolioCarousel } from "@/components/RecipeFolioCarousel";

/**
 * Kits matched to the cart (Holmes recipe/combo API under the hood).
 */
export default function ForYouCombosPage() {
  return (
    <div className="min-h-screen bg-aurora-bg relative pb-20">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 py-8">
        <a
          href="/for-you"
          className="inline-flex items-center gap-2 text-aurora-primary hover:text-aurora-primary-dark mb-6 text-sm font-medium transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Back to For You
        </a>
        <div className="mb-8">
          <h1 className="text-2xl font-bold flex items-center gap-2 text-aurora-text">
            <Sparkles className="w-6 h-6 text-aurora-primary" aria-hidden />
            Kits for your cart
          </h1>
          <p className="text-aurora-muted mt-1">
            Project kits matched to what&apos;s in your basket — flip through to pick one.
          </p>
        </div>

        <RecipeFolioCarousel />
      </div>
    </div>
  );
}
