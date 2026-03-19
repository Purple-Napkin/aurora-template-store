"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/components/CartProvider";
import { ProductImage } from "@/components/ProductImage";

type Props = {
  /** Pass when on product detail page */
  currentProductId?: string | null;
};

/**
 * Holmes "paying attention" well - subtle hint based on cart and mission.
 * Renders at top of cart, PDP, or home when Holmes has something relevant.
 */
export function HolmesContextualWell({ currentProductId }: Props) {
  const { items } = useCart();
  const [hint, setHint] = useState<string | null>(null);
  const [products, setProducts] = useState<Array<{ id: string; name: string; url: string; image_url?: string }>>([]);

  useEffect(() => {
    const cartNames = items.map((i) => i.name).filter(Boolean);
    if (cartNames.length === 0 && !currentProductId) {
      setHint(null);
      setProducts([]);
      return;
    }
    const sid =
      typeof window !== "undefined"
        ? (window as { holmes?: { getSessionId?: () => string } }).holmes?.getSessionId?.()
        : null;
    const qs = new URLSearchParams();
    if (sid) qs.set("sid", sid);
    if (cartNames.length) qs.set("cart_names", cartNames.join(","));
    if (currentProductId) qs.set("current_product", currentProductId);
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
      })
      .catch(() => {
        setHint(null);
        setProducts([]);
      });
  }, [items.map((i) => i.name).join(","), currentProductId]);

  if (!hint) return null;

  return (
    <div className="mb-6 p-4 rounded-xl bg-aurora-surface border border-aurora-primary/30">
      <p className="text-sm text-aurora-text mb-2">{hint}</p>
      {products.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {products.map((p) => (
            <Link
              key={p.id}
              href={p.url}
              className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg bg-aurora-primary/15 text-aurora-primary text-sm font-medium hover:bg-aurora-primary/25 transition-colors"
            >
              <span className="w-6 h-6 rounded overflow-hidden shrink-0">
                <ProductImage
                  src={p.image_url}
                  className="w-full h-full"
                  objectFit="contain"
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
