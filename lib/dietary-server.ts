import { cookies } from "next/headers";

const COOKIE_NAME = "aurora-dietary";
const VALID_KEYS = ["meat", "animal_products", "dairy", "alcohol"] as const;

/**
 * Read dietary exclusions from the aurora-dietary cookie.
 * Used by SSR components (HomeSections, ForYouSections, recipes page) to pass preferences to API.
 */
export async function getDietaryFromCookie(): Promise<string[]> {
  try {
    const cookieStore = await cookies();
    const value = cookieStore.get(COOKIE_NAME)?.value;
    if (!value) return [];
    const decoded = decodeURIComponent(value);
    return decoded
      .split(",")
      .map((s) => s.trim().toLowerCase())
      .filter((k) => VALID_KEYS.includes(k as (typeof VALID_KEYS)[number]));
  } catch {
    return [];
  }
}
