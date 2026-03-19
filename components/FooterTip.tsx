"use client";

import { Heart } from "lucide-react";

/**
 * Short, friendly tip above the footer – fills the gap with a warm touch.
 */
export function FooterTip() {
  return (
    <section className="bg-aurora-surface/40">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-8 sm:py-10">
        <p className="text-center text-aurora-muted text-sm sm:text-base leading-relaxed">
          <span className="inline-flex items-center gap-1.5 text-aurora-primary" aria-hidden>
            <Heart className="h-4 w-4 fill-current" />
          </span>
          {" "}
          Spot the little veggie in the corner? Give it a tap – it&apos;s full of handy tips to make your shop a little easier.
        </p>
      </div>
    </section>
  );
}
