import Script from "next/script";
import { getHolmesScriptUrl } from "@aurora-studio/sdk";

/**
 * Loads Holmes script when Aurora API and tenant are configured.
 * Rendered as server component so script is in initial HTML.
 * To disable Holmes: set cookie holmes_holdout=1 (the script checks this).
 */
export function ConditionalHolmesScript() {
  const apiUrl = process.env.NEXT_PUBLIC_AURORA_API_URL;
  const tenantSlug = process.env.NEXT_PUBLIC_TENANT_SLUG;

  if (!apiUrl || !tenantSlug) {
    return null;
  }

  const src = getHolmesScriptUrl(apiUrl, tenantSlug);
  return <Script src={src} strategy="afterInteractive" />;
}
