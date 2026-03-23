"use client";

import { useState, useEffect, useRef, Suspense } from "react";
import Link from "next/link";
import { usePathname, useSearchParams } from "next/navigation";
import { X, RotateCcw, Info } from "lucide-react";
import { useMissionAware } from "@/components/MissionAwareHome";
import { useCart } from "@aurora-studio/starter-core";
import { getRecipeTitle } from "@/lib/cart-intelligence";
import { isMissionBarDismissed, MISSION_BAR_DISMISS_KEY } from "@/lib/mission-bar";
import { holmesMissionLockClear } from "@aurora-studio/starter-core";
import {
  alignedMissionTrustLine,
  isCookingMissionKey,
  isTravelLikeMission,
} from "@/lib/intent-mission";

const BUNDLE_MISSION_KEYS = new Set([
  "recipe_mission",
  "combo_mission",
  "cook_dinner",
  "cook_dinner_tonight",
  "travel_prep",
  "routine_shop",
  "urgent_replenishment",
]);

function missionCta(key: string, itemCount: number): { href: string; label: string } {
  if (BUNDLE_MISSION_KEYS.has(key) && itemCount >= 2) {
    return { href: "/cart#basket-bundle", label: "Basket suggestions" };
  }
  if (isTravelLikeMission(key)) {
    return { href: "/catalogue?q=travel+essentials", label: "Shop travel essentials" };
  }
  if (isCookingMissionKey(key)) {
    return itemCount > 0
      ? { href: "/cart", label: "Complete your basket" }
      : { href: "/catalogue", label: "Continue shopping" };
  }
  return { href: "/catalogue", label: "Continue shopping" };
}

function summaryLinkHref(key: string): string | null {
  if (isCookingMissionKey(key)) return "/for-you/recipes";
  if (isTravelLikeMission(key)) return "/catalogue?q=travel+essentials";
  return null;
}

function persistDismissed(value: boolean) {
  try {
    if (value) sessionStorage.setItem(MISSION_BAR_DISMISS_KEY, "1");
    else sessionStorage.removeItem(MISSION_BAR_DISMISS_KEY);
  } catch {
    /* ignore */
  }
}

function bandSuffix(band: string | undefined): string {
  if (band === "high") return " — mode active";
  if (band === "medium") return " — suggestions tuned";
  return " — light context";
}

function IntentPresenceBarInner() {
  const missionData = useMissionAware();
  const { items } = useCart();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [dismissed, setDismissedState] = useState(false);
  const [whyOpen, setWhyOpen] = useState(false);
  const whyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setDismissedState(isMissionBarDismissed());
  }, []);

  useEffect(() => {
    const close = (e: MouseEvent) => {
      if (whyRef.current && !whyRef.current.contains(e.target as Node)) setWhyOpen(false);
    };
    if (whyOpen) document.addEventListener("mousedown", close);
    return () => document.removeEventListener("mousedown", close);
  }, [whyOpen]);

  const activeMission = missionData?.activeMission;
  const catalogueRecipeSearch =
    pathname === "/catalogue" && Boolean(getRecipeTitle(searchParams.get("q") ?? ""));

  const showBar =
    activeMission &&
    activeMission.uiHints?.showMissionBar !== false &&
    !dismissed &&
    !catalogueRecipeSearch;

  if (!showBar) return null;

  const hasCartItems = items.length > 0;
  const summary = alignedMissionTrustLine(
    activeMission.key,
    activeMission.label,
    activeMission.summary,
    hasCartItems
  );
  const cta = missionCta(activeMission.key, items.length);
  const subHref = summaryLinkHref(activeMission.key);
  const summaryClassName =
    "text-xs sm:text-sm text-[var(--aurora-mission-bar-muted)] mt-0.5 line-clamp-2 block";

  const handleDismiss = () => {
    persistDismissed(true);
    setDismissedState(true);
    window.dispatchEvent(new CustomEvent("holmes:missionBarDismissed"));
  };

  const handleReset = () => {
    persistDismissed(false);
    setDismissedState(false);
    holmesMissionLockClear();
    missionData?.refresh?.();
    window.dispatchEvent(new CustomEvent("holmes:missionBarReset"));
  };

  return (
    <div
      className="w-full border-b border-[var(--aurora-mission-bar-border)] bg-[var(--aurora-mission-bar-bg)] text-white shadow-sm"
      data-holmes="intent-presence-bar"
    >
      <div className="max-w-6xl mx-auto px-4 sm:px-6 py-2.5 sm:py-3 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 sm:gap-4">
        <div className="min-w-0 flex-1">
          <p className="text-sm sm:text-base font-semibold tracking-tight">
            <span className="text-[var(--aurora-mission-bar-muted)]">Shop by mission · </span>
            {activeMission.label}
            <span className="font-normal text-[var(--aurora-mission-bar-faint)]">
              {bandSuffix(activeMission.band)}
            </span>
          </p>
          {subHref ? (
            <Link
              href={subHref}
              className={`${summaryClassName} font-medium text-white/95 underline decoration-white/50 underline-offset-2 hover:text-white hover:decoration-white focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white/80 rounded-sm`}
            >
              {summary}
            </Link>
          ) : (
            <p className={summaryClassName}>{summary}</p>
          )}
        </div>
        <div className="flex flex-wrap items-center gap-2 shrink-0">
          <div className="relative" ref={whyRef}>
            <button
              type="button"
              onClick={() => setWhyOpen((o) => !o)}
              className="inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs sm:text-sm font-medium text-[var(--aurora-mission-bar-muted)] hover:bg-white/10 transition-colors"
            >
              <Info className="w-3.5 h-3.5 shrink-0" aria-hidden />
              Why am I seeing this?
            </button>
            {whyOpen && (
              <div className="absolute right-0 top-full mt-1 z-50 w-[min(100vw-2rem,20rem)] rounded-xl border border-white/20 bg-[var(--aurora-mission-bar-bg)] p-3 text-xs text-[var(--aurora-mission-bar-muted)] shadow-xl">
                {summary}
              </div>
            )}
          </div>
          <Link
            href={cta.href}
            className="inline-flex items-center px-3 py-1.5 rounded-lg text-xs sm:text-sm font-semibold bg-white text-[var(--aurora-primary)] hover:bg-white/90 transition-colors"
          >
            {cta.label}
          </Link>
          <button
            type="button"
            onClick={handleReset}
            className="p-2 rounded-lg text-[var(--aurora-mission-bar-muted)] hover:bg-white/10 transition-colors"
            aria-label="Not what I’m doing"
            title="Not what I’m doing"
          >
            <RotateCcw className="w-4 h-4" />
          </button>
          <button
            type="button"
            onClick={handleDismiss}
            className="p-2 rounded-lg text-[var(--aurora-mission-bar-muted)] hover:bg-white/10 transition-colors"
            aria-label="Dismiss"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
}

export function IntentPresenceBar() {
  return (
    <Suspense fallback={null}>
      <IntentPresenceBarInner />
    </Suspense>
  );
}
