/**
 * Mission bar dismiss state - shared between ActiveMissionBar and catalogue narrowing.
 * When dismissed, we skip narrowCatalog UI (show full categories).
 */

export const MISSION_BAR_DISMISS_KEY = "holmes_mission_bar_dismissed";

export function isMissionBarDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(MISSION_BAR_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}
