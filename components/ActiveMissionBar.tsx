"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, RotateCcw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useMissionAware } from "./MissionAwareHome";
import { useCart } from "@/components/CartProvider";
import {
  MISSION_BAR_DISMISS_KEY,
  isMissionBarDismissed,
  isMissionBarCollapsed,
  setMissionBarCollapsed,
} from "@/lib/mission-bar";
import { holmesMissionLockClear } from "@/lib/holmes-events";

const BUNDLE_MISSION_KEYS = new Set([
  "recipe_mission",
  "combo_mission",
  "cook_dinner",
  "cook_dinner_tonight",
  "travel_prep",
  "routine_shop",
  "urgent_replenishment",
]);

function setDismissed(value: boolean) {
  try {
    if (value) {
      sessionStorage.setItem(MISSION_BAR_DISMISS_KEY, "1");
    } else {
      sessionStorage.removeItem(MISSION_BAR_DISMISS_KEY);
    }
  } catch {
    /* ignore */
  }
}

const BAND_LABELS: Record<string, string> = {
  low: "Just browsing",
  medium: "We think you might like…",
  high: "We've got ideas for you!",
};

export function ActiveMissionBar() {
  const missionData = useMissionAware();
  const { items } = useCart();
  const [dismissed, setDismissedState] = useState(false);
  const [collapsed, setCollapsedState] = useState(false);

  useEffect(() => {
    setDismissedState(isMissionBarDismissed());
    setCollapsedState(isMissionBarCollapsed());
  }, []);

  const activeMission = missionData?.activeMission;
  const showBar =
    activeMission &&
    activeMission.uiHints?.showMissionBar !== false &&
    !dismissed;

  const isBundleMission = activeMission && BUNDLE_MISSION_KEYS.has(activeMission.key);
  const hasCartItems = items.length >= 2;

  if (!showBar) return null;

  const handleDismiss = () => {
    setDismissed(true);
    setDismissedState(true);
    window.dispatchEvent(new CustomEvent("holmes:missionBarDismissed"));
  };

  const handleCollapse = () => {
    setCollapsedState(true);
    setMissionBarCollapsed(true);
  };

  const handleExpand = () => {
    setCollapsedState(false);
    setMissionBarCollapsed(false);
  };

  const handleReset = () => {
    setDismissed(false);
    setDismissedState(false);
    holmesMissionLockClear();
    missionData?.refresh?.();
    window.dispatchEvent(new CustomEvent("holmes:missionBarReset"));
  };

  const bandLabel = BAND_LABELS[activeMission!.band] ?? activeMission!.band;

  // Collapsed: small floating indicator tab
  if (collapsed) {
    return (
      <div
        className="fixed top-20 right-4 z-40"
        data-holmes="active-mission-bar"
      >
        <button
          type="button"
          onClick={handleExpand}
          className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border border-aurora-border/60 bg-white/95 backdrop-blur-sm hover:shadow-md hover:scale-[1.02] transition-all text-aurora-text"
          aria-label="Show shopping insight"
          title="Show shopping insight"
        >
          <Sparkles className="w-4 h-4 text-aurora-primary" />
          <span className="text-xs font-medium">{activeMission!.label}</span>
          <ChevronDown className="w-3.5 h-3.5 text-aurora-muted rotate-[-90deg]" />
        </button>
      </div>
    );
  }

  // Expanded: floating insight card (absolute, overlays content like chat widget)
  return (
    <div
      className="fixed top-20 right-4 z-40 w-[min(100%-2rem,24rem)]"
      data-holmes="active-mission-bar"
    >
      <div className="rounded-2xl border border-aurora-border/80 bg-white/95 backdrop-blur-md shadow-lg shadow-aurora-primary/5 overflow-hidden">
        <div className="px-4 py-3 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-aurora-primary/10 shrink-0">
              <Sparkles className="w-4 h-4 text-aurora-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-xs text-aurora-muted mb-0.5">
                Shopping insight
              </p>
              <div className="flex flex-wrap items-center gap-2">
                <span className="text-sm font-semibold text-aurora-text">
                  {activeMission!.label}
                </span>
                <span className="text-xs px-2 py-0.5 rounded-full bg-aurora-primary/10 text-aurora-primary font-medium">
                  {bandLabel}
                </span>
              </div>
              {activeMission!.summary && (
                <p className="text-sm text-aurora-muted mt-1">
                  {activeMission!.summary}
                </p>
              )}
              {(isBundleMission && hasCartItems) || activeMission!.band !== "low" ? (
                <Link
                  href={isBundleMission && hasCartItems ? "/for-you#recipe-picker" : "/for-you"}
                  className="inline-flex items-center gap-1 text-xs text-aurora-primary hover:underline mt-2 font-medium"
                >
                  {isBundleMission && hasCartItems
                    ? ["recipe_mission", "combo_mission", "cook_dinner", "cook_dinner_tonight"].includes(
                        activeMission!.key
                      )
                      ? "Recipes for your cart →"
                      : "Bundle ideas for your cart →"
                    : "View ideas →"}
                </Link>
              ) : null}
            </div>
          </div>
          <div className="flex items-center gap-0.5 shrink-0">
            <button
              type="button"
              onClick={handleCollapse}
              className="p-2 rounded-lg text-aurora-muted hover:text-aurora-text hover:bg-aurora-surface-hover/80 transition-colors"
              aria-label="Collapse insight"
              title="Collapse"
            >
              <ChevronUp className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg text-aurora-muted hover:text-aurora-text hover:bg-aurora-surface-hover/80 transition-colors"
              aria-label="Not what I'm doing"
              title="Not what I'm doing"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-lg text-aurora-muted hover:text-aurora-text hover:bg-aurora-surface-hover/80 transition-colors"
              aria-label="Dismiss"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
