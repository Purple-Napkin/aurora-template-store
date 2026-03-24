"use client";

import Link from "next/link";
import { useMissionAware } from "./MissionAwareHome";
import { ListChecks } from "lucide-react";

/**
 * Holmes-influenced shopping list templates. Shown when inference matches
 * (e.g. "Travel essentials" when travel prep detected from cart).
 */
export function ShoppingListTemplates() {
  const homeData = useMissionAware();
  const templates = homeData?.shoppingListTemplates;

  if (!templates?.length) return null;

  return (
    <section className="py-6">
      <h2 className="text-[0.6rem] font-bold text-aurora-muted uppercase tracking-[0.16em] mb-4">
        Suggested lists
      </h2>
      <div className="flex flex-wrap gap-2.5">
        {templates.map((t) => {
          const searchQuery = t.searchTerms?.length
            ? t.searchTerms.join(" ")
            : t.label.toLowerCase().replace(/\s+/g, "+");
          const href = `/catalogue?q=${encodeURIComponent(searchQuery)}`;
          return (
            <Link
              key={t.slug}
              href={href}
              className="flex items-center gap-3 px-4 py-3 rounded-md bg-aurora-surface border border-aurora-border font-bold text-aurora-text shadow-[inset_0_1px_0_rgb(255_255_255/0.5),0_1px_2px_rgb(15_23_42/0.05)] transition-[border-color,transform,box-shadow] duration-150 ease-out hover:-translate-y-px hover:border-aurora-primary/45 hover:shadow-[0_2px_10px_rgb(29_78_216/0.1)]"
            >
              <span className="flex items-center justify-center w-9 h-9 rounded-md bg-aurora-primary/12 text-aurora-primary ring-1 ring-inset ring-aurora-primary/10">
                <ListChecks className="w-5 h-5" aria-hidden />
              </span>
              <div>
                <span className="block">{t.label}</span>
                {t.description && (
                  <span className="block text-xs text-aurora-muted font-normal mt-0.5">
                    {t.description}
                  </span>
                )}
              </div>
            </Link>
          );
        })}
      </div>
    </section>
  );
}
