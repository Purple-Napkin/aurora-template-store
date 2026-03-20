"use client";

import { useState, useRef, useEffect } from "react";
import { Salad, ChevronDown } from "lucide-react";
import { useDietaryExclusions, DIETARY_OPTIONS } from "./DietaryExclusionsContext";

export function DietaryNeedsDropdown() {
  const [open, setOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const { has, toggle } = useDietaryExclusions();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (
        containerRef.current &&
        !containerRef.current.contains(e.target as Node)
      ) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const activeCount = DIETARY_OPTIONS.filter((o) => has(o.key)).length;

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        className="flex items-center gap-2 text-sm text-aurora-muted hover:text-aurora-text transition-colors px-2 py-1.5 -mx-1 rounded-lg hover:bg-aurora-surface-hover"
        title="Dietary needs"
        aria-expanded={open}
        aria-haspopup="true"
      >
        <Salad className="w-4 h-4 shrink-0 text-aurora-primary/70" />
        <span className="hidden sm:inline truncate max-w-[100px]">
          Dietary Needs
        </span>
        {activeCount > 0 && (
          <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] text-xs font-semibold rounded-full bg-aurora-primary/20 text-aurora-primary">
            {activeCount}
          </span>
        )}
        <ChevronDown
          className={`w-4 h-4 shrink-0 text-aurora-muted transition-transform ${
            open ? "rotate-180" : ""
          }`}
        />
      </button>

      {open && (
        <div
          className="absolute top-full right-0 mt-1 min-w-[220px] rounded-component bg-aurora-surface border border-aurora-border shadow-xl z-[9999] py-2"
          role="menu"
        >
          <div className="px-3 py-1.5 text-xs font-semibold uppercase tracking-wider text-aurora-muted border-b border-aurora-border">
            Dietary Needs
          </div>
          <div className="py-1">
            {DIETARY_OPTIONS.map((option) => (
              <label
                key={option.key}
                className="flex items-center gap-3 px-4 py-2.5 hover:bg-aurora-surface-hover cursor-pointer transition-colors"
              >
                <input
                  type="checkbox"
                  checked={has(option.key)}
                  onChange={() => toggle(option.key)}
                  className="w-4 h-4 rounded border-aurora-border text-aurora-primary focus:ring-aurora-primary/50"
                />
                <span className="text-sm text-aurora-text font-medium">
                  {option.label}
                </span>
              </label>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
