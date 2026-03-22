"use client";

import { useState } from "react";

/** Catalogue empty state: load bundled init/seed.sql via server route (API key never exposed). */
export function ExampleDataCatalogueCTA() {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onClick() {
    setError(null);
    setLoading(true);
    try {
      const res = await fetch("/api/store/apply-example-data", { method: "POST" });
      const data = (await res.json().catch(() => ({}))) as { error?: string };
      if (!res.ok) {
        setError(typeof data?.error === "string" ? data.error : "Could not load example data");
        setLoading(false);
        return;
      }
      window.location.reload();
    } catch {
      setError("Network error");
      setLoading(false);
    }
  }

  return (
    <div className="mt-8 w-full max-w-md rounded-xl border border-aurora-border bg-aurora-surface/80 p-6 text-center shadow-sm">
      <p className="text-sm text-aurora-muted mb-4">
        New tenant? Load the demo catalogue and store content blocks shipped with this template.
      </p>
      <button
        type="button"
        onClick={onClick}
        disabled={loading}
        className="inline-flex items-center justify-center rounded-lg bg-aurora-primary px-5 py-2.5 text-sm font-semibold text-white transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
      >
        {loading ? "Loading example data…" : "Use example data"}
      </button>
      {error ? <p className="mt-3 text-sm text-red-600 dark:text-red-400">{error}</p> : null}
      <p className="mt-4 text-xs text-aurora-muted leading-relaxed">
        If the grid stays empty after refresh, run a Meilisearch reindex for this tenant in Aurora Studio,
        then reload again.
      </p>
    </div>
  );
}
