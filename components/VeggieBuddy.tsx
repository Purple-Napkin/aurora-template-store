"use client";

import { useState, useCallback, useRef, useEffect } from "react";
import { getRandomVeggieTip, getVeggieEmoji } from "@/lib/easter-eggs";

/** Cute floating vegetable that shows a tip when clicked. Easter egg! */
export function VeggieBuddy() {
  const [tip, setTip] = useState<string | null>(null);
  const [visible, setVisible] = useState(false);
  const seedRef = useRef<number>(Math.random());

  const containerRef = useRef<HTMLDivElement>(null);

  const handleClick = useCallback(() => {
    if (tip) {
      setTip(null);
      return;
    }
    setTip(getRandomVeggieTip(seedRef.current));
  }, [tip]);

  useEffect(() => {
    const t = setTimeout(() => setVisible(true), 1500);
    return () => clearTimeout(t);
  }, []);

  useEffect(() => {
    if (!tip) return;
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setTip(null);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [tip]);

  if (!visible) return null;

  return (
    <div ref={containerRef} className="fixed bottom-6 right-6 z-50 flex flex-col items-end gap-2">
      {tip && (
        <button
          type="button"
          onClick={handleClick}
          className="veggie-tip-tooltip max-w-[280px] rounded-2xl border border-aurora-border bg-aurora-surface px-4 py-3 shadow-lg text-left hover:bg-aurora-surface-hover transition-colors"
        >
          <p className="text-sm text-aurora-text leading-relaxed">{tip}</p>
          <p className="mt-2 text-xs text-aurora-muted">Tap again to close</p>
        </button>
      )}
      <button
        type="button"
        onClick={handleClick}
        className="veggie-buddy-btn group flex h-12 w-12 items-center justify-center rounded-full border border-aurora-border/80 bg-aurora-surface shadow-md transition-all hover:scale-110 hover:border-aurora-primary/50 hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-aurora-primary/50"
        aria-label="Get a shopping tip"
        title="Click for a tip!"
      >
        <span className="text-2xl transition-transform group-hover:rotate-12">
          {getVeggieEmoji(seedRef.current)}
        </span>
      </button>
    </div>
  );
}
