"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@aurora-studio/starter-core";
import { useDietaryExclusions } from "@/components/DietaryExclusionsContext";
import { ProductImage } from "@aurora-studio/starter-core";

type Props = {
  /** Pass when on product detail page */
  currentProductId?: string | null;
  /** "cart" = scroll to #basket-bundle; "for-you" = on For You page, no link; "default" = link to basket suggestions */
  variant?: "default" | "cart" | "for-you";
};

/**
 * Contextual hint well — subtle hint based on cart and mission.
 * Renders at top of cart, PDP, or home when we have something relevant to show.
 * Proactive hint when a project kit / bundle matches the cart.
 */
export function HolmesContextualWell({ currentProductId, variant = "default" }: Props) {
  const { items } = useCart();
  const { excludeDietary } = useDietaryExclusions();
  const [hint, setHint] = useState<string | null>(null);
  const [products, setProducts] = useState<Array<{ id: string; name: string; url: string; image_url?: string }>>([]);
  const [hasCombo, setHasCombo] = useState(false);
  const [comboTitle, setComboTitle] = useState<string | null>(null);

  useEffect(() => {
    const cartNames = items.map((i) => i.name).filter(Boolean);
    const cartIds = items.map((i) => i.recordId).filter(Boolean);
    if (cartNames.length === 0 && !currentProductId) {
      setHint(null);
      setProducts([]);
      setHasCombo(false);
      setComboTitle(null);
      return;
    }
    const sid =
      typeof window !== "undefined"
        ? (window as { holmes?: { getSessionId?: () => string } }).holmes?.getSessionId?.()
        : null;
    const qs = new URLSearchParams();
    if (sid) qs.set("sid", sid);
    if (cartNames.length) qs.set("cart_names", cartNames.join(","));
    if (cartIds.length) qs.set("cart_ids", cartIds.join(","));
    if (currentProductId) qs.set("current_product", currentProductId);
    if (excludeDietary.length) qs.set("excludeDietary", excludeDietary.join(","));
    fetch(`/api/holmes/contextual-hint?${qs.toString()}`)
      .then((r) => r.json())
      .then((data) => {
        if (data?.hint) {
          setHint(data.hint);
          setProducts((data.products ?? []).slice(0, 2));
        } else {
          setHint(null);
          setProducts([]);
        }
        setHasCombo(Boolean(data?.hasCombo));
        setComboTitle(data?.comboTitle ?? null);
      })
      .catch(() => {
        setHint(null);
        setProducts([]);
        setHasCombo(false);
        setComboTitle(null);
      });
  }, [items.map((i) => `${i.recordId}:${i.name}`).join(","), currentProductId, excludeDietary]);

  // Proactive bundle hint: complements + deal suggestions for what’s already in the basket
  if (hasCombo && !hint) {
    const cartCopy =
      variant === "cart" && comboTitle
        ? `We suggest parts and a bundle that pair with your basket${comboTitle ? ` — ${comboTitle}` : ""}.`
        : `We have complementary SKUs and a bundle offer that fit what’s in your basket${comboTitle ? ` — ${comboTitle}` : ""}.`;
    return (
      <div className="pattern-well mb-6 p-4 rounded-md border border-aurora-primary/35 bg-aurora-primary/[0.06] shadow-[inset_0_1px_0_rgb(255_255_255/0.4),0_1px_2px_rgb(15_23_42/0.04)]">
        <p className="text-sm font-semibold text-aurora-text mb-2">{cartCopy}</p>
        {variant === "cart" ? (
          <a
            href="#basket-bundle"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-aurora-primary/12 text-aurora-primary text-sm font-bold hover:bg-aurora-primary/20 transition-colors duration-150"
            onClick={(e) => {
              e.preventDefault();
              document.getElementById("basket-bundle")?.scrollIntoView({ behavior: "smooth" });
            }}
          >
            See suggestions
          </a>
        ) : variant === "for-you" ? null : (
          <Link
            href="/cart#basket-bundle"
            className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-aurora-primary/12 text-aurora-primary text-sm font-bold hover:bg-aurora-primary/20 transition-colors duration-150"
          >
            Open basket suggestions
          </Link>
        )}
      </div>
    );
  }

  if (!hint) return null;

  return (
    <div className="pattern-well mb-6 p-4 rounded-md border border-aurora-primary/35 shadow-[inset_0_1px_0_rgb(255_255_255/0.35),0_1px_2px_rgb(15_23_42/0.04)]">
      <p className="text-sm font-semibold text-aurora-text mb-2">{hint}</p>
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {products.map((p) => (
            <Link
              key={p.id}
              href={p.url}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-md bg-aurora-primary/12 text-aurora-primary text-sm font-bold hover:bg-aurora-primary/20 transition-colors duration-150"
            >
              <span className="w-6 h-6 rounded overflow-hidden shrink-0">
                <ProductImage
                  src={p.image_url}
                  className="w-full h-full"
                  thumbnail
                  fallback={<span className="text-xs">-</span>}
                />
              </span>
              {p.name}
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}
