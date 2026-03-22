import { getStoreConfig, holmesRecentRecipes, holmesRecipeProducts } from "@aurora-studio/starter-core";
import { getDietaryFromCookie } from "@/lib/dietary-server";
import type { StoreFeaturedProject } from "@/lib/store-featured-project";
import { CommandSurface } from "./CommandSurface";

const DEFAULT_LOGO = "/template-logo.png";

type StoreConfig = {
  branding?: { logo_url?: string | null } | null;
  storefrontHero?: {
    image_url?: string | null;
    layout?: string;
    size?: string;
  } | null;
};

export async function HeroCommandSurface() {
  const envLogo = process.env.NEXT_PUBLIC_LOGO_URL ?? DEFAULT_LOGO;
  let config: StoreConfig | null = null;
  try {
    config = (await getStoreConfig()) as StoreConfig;
  } catch {
    config = null;
  }
  const sh = config?.storefrontHero;
  const brandingLogo = config?.branding?.logo_url?.trim() || null;
  const heroOverride = sh?.image_url?.trim() || null;
  const displayUrl = heroOverride || brandingLogo || envLogo;
  const layoutNorm =
    typeof sh?.layout === "string" ? sh.layout.trim().toLowerCase().replace(/-/g, "_") : "";
  const heroLayout = layoutNorm === "full_width" ? "full_width" : "split";
  const sizeNorm = typeof sh?.size === "string" ? sh.size.trim().toLowerCase() : "";
  const heroSize =
    sizeNorm === "compact" || sizeNorm === "tall" ? sizeNorm : "default";

  let featuredProject: StoreFeaturedProject | null = null;
  try {
    const excludeDietary = await getDietaryFromCookie();
    const dietaryOpts = excludeDietary.length ? { excludeDietary } : undefined;
    const { recipes } = await holmesRecentRecipes(1, undefined, dietaryOpts);
    const first = recipes?.[0];
    if (first?.slug && first?.title) {
      const { products } = await holmesRecipeProducts(first.slug, 6, dietaryOpts);
      const imageUrl =
        (products ?? [])
          .map((p) => (p as { image_url?: string }).image_url)
          .find((u): u is string => !!u && String(u).trim().length > 0) ?? null;
      featuredProject = {
        slug: first.slug,
        title: first.title,
        description: first.description ?? null,
        imageUrl,
      };
    }
  } catch {
    featuredProject = null;
  }

  return (
    <CommandSurface
      heroImageUrl={displayUrl}
      heroLayout={heroLayout}
      heroSize={heroSize}
      featuredProject={featuredProject}
    />
  );
}
