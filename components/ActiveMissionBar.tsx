"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { X, RotateCcw } from "lucide-react";
import { useMissionAware } from "./MissionAwareHome";
import { useCart } from "@/components/CartProvider";
import { MISSION_BAR_DISMISS_KEY, isMissionBarDismissed } from "@/lib/mission-bar";
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
  low: "Exploring",
  medium: "Likely",
  high: "High confidence",
};

export function ActiveMissionBar() {
  const missionData = useMissionAware();
  const { items } = useCart();
  const [dismissed, setDismissedState] = useState(false);

  useEffect(() => {
    setDismissedState(isMissionBarDismissed());
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

  const handleReset = () => {
    setDismissed(false);
    setDismissedState(false);
    holmesMissionLockClear();
    missionData?.refresh?.();
    window.dispatchEvent(new CustomEvent("holmes:missionBarReset"));
  };

  const bandLabel = BAND_LABELS[activeMission!.band] ?? activeMission!.band;

  return (
    <div
      className="border-b border-aurora-border bg-aurora-surface/95 supports-[backdrop-filter]:bg-aurora-surface/80 supports-[backdrop-filter]:backdrop-blur-sm"
      data-holmes="active-mission-bar"
    >
      <div className="max-w-7xl mx-auto px-4 sm:px-6 py-2">
        <div className="flex items-center justify-between gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-3 min-w-0">
            <div className="flex items-center gap-3 min-w-0">
              <span className="text-sm font-medium text-aurora-text truncate">
                {activeMission!.label}
              </span>
              <span className="shrink-0 text-xs px-2 py-0.5 rounded-md bg-aurora-primary/15 text-aurora-primary font-medium">
                {bandLabel}
              </span>
              {activeMission!.summary && (
                <span className="hidden sm:inline text-sm text-aurora-muted truncate">
                  {activeMission!.summary}
                </span>
              )}
            </div>
            {isBundleMission && hasCartItems && (
              <Link
                href="/cart#recipe-picker"
                className="text-xs text-aurora-primary hover:underline shrink-0"
              >
                {["recipe_mission", "combo_mission", "cook_dinner", "cook_dinner_tonight"].includes(
                  activeMission!.key
                )
                  ? "Recipes available for your cart →"
                  : "Bundle suggestions for your cart →"}
              </Link>
            )}
          </div>
          <div className="flex items-center gap-1 shrink-0">
            <button
              type="button"
              onClick={handleReset}
              className="p-2 rounded-lg text-aurora-muted hover:text-aurora-text hover:bg-aurora-surface-hover transition-colors"
              aria-label="Reset mission"
              title="Not what I'm doing"
            >
              <RotateCcw className="w-4 h-4" />
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="p-2 rounded-lg text-aurora-muted hover:text-aurora-text hover:bg-aurora-surface-hover transition-colors"
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
