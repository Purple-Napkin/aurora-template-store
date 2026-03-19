import { createAuroraClient, getStoreConfig } from "@/lib/aurora";
import { CommandSurface } from "./CommandSurface";

const DEFAULT_HERO = "/Hippo-Hero.jpg";

/** Fetches hero image from CMS (hero_banners) or uses default. Passes to CommandSurface. */
export async function HeroCommandSurface() {
  let heroImage = DEFAULT_HERO;

  try {
    const aurora = createAuroraClient();
    const { data } = await aurora.tables("hero_banners").records.list({
      limit: 1,
      sort: "sort_order",
      order: "asc",
    });
    const banner = (data ?? []).find((b: { image_url?: string }) => b.image_url);
    if (banner?.image_url && typeof banner.image_url === "string") heroImage = banner.image_url;
  } catch {
    /* hero_banners table may not exist */
  }

  return <CommandSurface heroImageUrl={heroImage} />;
}
