"use client";

import { useEffect } from "react";

/**
 * Dispatches holmes:refreshHome so the Holmes script re-fetches home
 * personalization when the user navigates to the home page.
 * Also listens for holmes:ready and re-dispatches refresh — so when the script
 * loads after we mount (e.g. slow network), we trigger the fetch.
 */
export function HolmesHomeRefresher() {
  useEffect(() => {
    document.dispatchEvent(new CustomEvent("holmes:refreshHome"));
    const onReady = () => {
      document.dispatchEvent(new CustomEvent("holmes:refreshHome"));
    };
    document.addEventListener("holmes:ready", onReady);
    return () => document.removeEventListener("holmes:ready", onReady);
  }, []);
  return null;
}
