/**
 * Optional CMS warm at process start. Off by default (see grocery template
 * `instrumentation.ts` for rationale). Enable: `AURORA_WARM_HOME_PERSONALIZATION=1`.
 */
export async function register() {
  if (process.env.NEXT_RUNTIME !== "nodejs") return;
  if (process.env.AURORA_WARM_HOME_PERSONALIZATION !== "1") return;
  void import("@/lib/warm-home-personalization-cache")
    .then((m) => m.warmHomePersonalizationCache())
    .catch(() => {});
}
