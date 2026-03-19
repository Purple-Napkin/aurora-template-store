"use client";

import { Sparkles } from "lucide-react";

/**
 * Explains how the insight system works. Used on the About page.
 */
export function InsightBlurb() {
  return (
    <section className="bg-aurora-surface/50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 py-12 sm:py-16">
        <div className="flex items-start gap-4">
          <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-aurora-primary/15 text-aurora-primary">
            <Sparkles className="h-6 w-6" aria-hidden />
          </span>
          <div className="min-w-0">
            <h2 className="font-display text-xl sm:text-2xl font-bold text-aurora-text mb-4">
              How your shopping experience adapts to you
            </h2>
            <div className="space-y-4 text-aurora-muted text-sm sm:text-base leading-relaxed">
              <p>
                As you browse, search, and add items to your basket, our insight system quietly pays attention. It doesn&apos;t track you in a creepy way – it simply notices patterns. What are you searching for? What&apos;s in your cart? Is it 6pm (dinner time) or Saturday morning (big shop)? All of these little signals help it understand what you&apos;re actually trying to do.
              </p>
              <p>
                Once it has a sense of your intent, the whole store shifts to match. If you&apos;ve added pasta sauce and parmesan, it might suggest olive oil and pasta – &quot;Complete your pasta&quot; – because it&apos;s guessed you&apos;re cooking. If you&apos;ve thrown in sunscreen and a travel mug, it might surface travel adapters and mini toiletries, because it thinks you&apos;re packing for a trip. You never have to tap &quot;I&apos;m cooking&quot; or &quot;I&apos;m travelling&quot; – it figures that out from what you&apos;re already doing.
              </p>
              <p>
                The same logic runs through your whole journey. On the home page, the quick-start buttons and category suggestions adapt. On product pages, &quot;You may also like&quot; and &quot;Pairs well with&quot; reflect what you&apos;re building. In your basket, you might see a bundle of items others often buy together, or a gentle nudge to swap to a cheaper olive oil if you&apos;re watching the pennies. At checkout, the flow can simplify when it senses you&apos;re in a hurry.
              </p>
              <p>
                None of this is magic – it&apos;s just a system that watches, infers, and rearranges the shelves for you. The goal is simple: make it feel like someone thoughtful is helping you shop, instead of you having to hunt through a fixed menu. We hope it saves you time and surfaces things you might have missed.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
