import Link from "next/link";
import { holmesRecentRecipes } from "@aurora-studio/starter-core";
import { getDietaryFromCookie } from "@/lib/dietary-server";
import { Wrench } from "lucide-react";

/**
 * Displays recent recipes from the Holmes cache on the home page.
 * Links to /combos/[slug] (Holmes recipe/combo records).
 */
export async function RecentRecipes() {
  const excludeDietary = await getDietaryFromCookie();
  const dietaryOpts = excludeDietary.length ? { excludeDietary } : undefined;
  const { recipes } = await holmesRecentRecipes(8, undefined, dietaryOpts);

  if (!recipes?.length) return null;

  return (
    <section className="py-8">
      <h2 className="text-lg font-bold mb-3 flex items-center gap-2 text-aurora-text">
        <Wrench className="w-5 h-5 text-aurora-primary shrink-0" />
        Popular project kits
      </h2>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {recipes.map((r) => (
          <Link
            key={r.id}
            href={`/combos/${encodeURIComponent(r.slug)}`}
            className="group block p-3 rounded-md bg-aurora-surface border border-aurora-border hover:border-aurora-primary transition-colors"
          >
            <h3 className="font-semibold text-sm sm:text-base truncate group-hover:text-aurora-primary">
              {r.title}
            </h3>
            {r.description && (
              <p className="text-aurora-muted text-xs sm:text-sm line-clamp-2 mt-1">
                {r.description}
              </p>
            )}
          </Link>
        ))}
      </div>
    </section>
  );
}
