"use client";

import { useState, useEffect } from "react";
import { X, RotateCcw, Sparkles, ChevronDown, ChevronUp } from "lucide-react";
import { useMissionAware } from "./MissionAwareHome";
import { useCart } from "@aurora-studio/starter-core";
import {
  MISSION_BAR_DISMISS_KEY,
  isMissionBarDismissed,
  isMissionBarCollapsed,
  setMissionBarCollapsed,
} from "@/lib/mission-bar";
import { holmesMissionLockClear } from "@aurora-studio/starter-core";
import type { ActiveMission } from "./MissionAwareHome";

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

/** Store-template narrative: DIY / intent demo (not returned from generic home-personalization). */
function storeMissionBarHeadline(m: ActiveMission): string {
  if (m.key === "recipe_mission" || m.key === "combo_mission") {
    if (m.band === "high") {
      return "We’re comparing your basket to the job you look to be doing—surfacing matching fixings, bits, consumables, and bundle deals that usually go with those SKUs.";
    }
    if (m.band === "medium") {
      return "We inferred a project from your behaviour; complements and promoted bundles are tuned to that task—not a generic catalogue.";
    }
  }
  if (m.summary && /ideas|for your/i.test(m.summary)) {
    return m.summary.replace(/\.$/, "").replace(/your meal/i, "your cart");
  }
  return `${m.label} for your cart`;
}

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
          className="flex items-center gap-2 px-3 py-2 rounded-full shadow-lg border border-aurora-border/60 bg-aurora-surface/95 backdrop-blur-sm hover:shadow-md hover:scale-[1.02] transition-all text-aurora-text"
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
      <div className="rounded-2xl border border-aurora-border/80 bg-aurora-surface/95 backdrop-blur-md shadow-lg shadow-aurora-primary/5 overflow-hidden">
        <div className="px-4 py-3 flex items-start sm:items-center justify-between gap-3">
          <div className="flex items-start sm:items-center gap-3 min-w-0 flex-1">
            <div className="flex items-center justify-center w-9 h-9 rounded-xl bg-aurora-primary/10 shrink-0">
              <Sparkles className="w-4 h-4 text-aurora-primary" aria-hidden />
            </div>
            <div className="min-w-0 flex-1">
              <p className="text-sm font-semibold text-aurora-text">{storeMissionBarHeadline(activeMission!)}</p>
              {(isBundleMission && hasCartItems) || activeMission!.band !== "low" ? (
                <a
                  href={
                    isBundleMission && hasCartItems
                      ? "/cart#basket-bundle"
                      : "/catalogue"
                  }
                  className="inline-flex items-center gap-1 text-xs text-aurora-primary hover:underline mt-1.5 font-medium"
                >
                  {isBundleMission && hasCartItems
                    ? "Basket suggestions →"
                    : "Browse catalogue →"}
                </a>
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
