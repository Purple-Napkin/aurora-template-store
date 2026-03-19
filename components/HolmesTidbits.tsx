"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { holmesTidbits } from "@/lib/aurora";
import { HolmesSprinkleIcon } from "@/components/HolmesSprinkleIcon";

type HolmesTidbit = {
  id: string;
  category: string;
  content: string;
  source_url?: string;
};

const CATEGORY_LABELS: Record<string, string> = {
  origin: "Origin",
  pairing: "Pairs well",
  tip: "Tip",
};

type Props = {
  entity: string;
  entityType?: "recipe" | "ingredient" | "product";
  /** Compact layout for inline use (e.g. product card) */
  variant?: "default" | "compact";
};

/**
 * Holmes tidbits - origin, pairing, tip for recipes, ingredients, products.
 * Renders nothing if no tidbits. Prominent but unobtrusive.
 */
export function HolmesTidbits({
  entity,
  entityType = "recipe",
  variant = "default",
}: Props) {
  const [tidbits, setTidbits] = useState<HolmesTidbit[]>([]);

  useEffect(() => {
    if (!entity?.trim()) {
      setTidbits([]);
      return;
    }
    holmesTidbits(entity.trim(), entityType)
      .then((res) => setTidbits(res.tidbits ?? []))
      .catch(() => setTidbits([]));
  }, [entity, entityType]);

  if (tidbits.length === 0) return null;

  if (variant === "compact") {
    return (
      <div className="flex flex-wrap gap-2">
        {tidbits.slice(0, 2).map((t) => (
          <span
            key={t.id}
            className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-aurora-primary/10 text-aurora-muted text-xs border border-aurora-primary/20"
          >
            <HolmesSprinkleIcon />
            <span>{t.content}</span>
          </span>
        ))}
      </div>
    );
  }

  return (
    <div className="p-4 rounded-xl bg-aurora-surface/60 border border-aurora-border">
      <div className="flex items-center gap-2 mb-2.5">
        <HolmesSprinkleIcon className="shrink-0" />
        <span className="text-xs font-medium text-aurora-muted uppercase tracking-wider">
          Holmes insight
        </span>
      </div>
      <div className="space-y-2.5">
        {tidbits.slice(0, 3).map((t) => (
          <div key={t.id}>
            <span className="text-[10px] uppercase tracking-wider text-aurora-muted/80 mr-1.5">
              {CATEGORY_LABELS[t.category] ?? t.category}
            </span>
            <p className="text-sm text-aurora-text leading-relaxed">
              {t.content}
              {t.source_url && (
                <Link
                  href={t.source_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="ml-1.5 text-aurora-accent hover:underline text-xs"
                >
                  Learn more
                </Link>
              )}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
}
