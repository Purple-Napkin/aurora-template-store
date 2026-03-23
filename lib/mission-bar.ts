/**
 * Mission bar dismiss state - shared between IntentPresenceBar and catalogue narrowing.
 * When dismissed, we skip narrowCatalog UI (show full categories).
 */

export const MISSION_BAR_DISMISS_KEY = "holmes_mission_bar_dismissed";
export const MISSION_BAR_COLLAPSED_KEY = "holmes_mission_bar_collapsed";

export function isMissionBarDismissed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(MISSION_BAR_DISMISS_KEY) === "1";
  } catch {
    return false;
  }
}

export function isMissionBarCollapsed(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return sessionStorage.getItem(MISSION_BAR_COLLAPSED_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMissionBarCollapsed(value: boolean): void {
  try {
    if (value) {
      sessionStorage.setItem(MISSION_BAR_COLLAPSED_KEY, "1");
    } else {
      sessionStorage.removeItem(MISSION_BAR_COLLAPSED_KEY);
    }
  } catch {
    /* ignore */
  }
}
