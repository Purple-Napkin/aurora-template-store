/** Fallback while header CMS rails stream in (inside Suspense on For You). */
export function ForYouHeaderRailsSkeleton() {
  return (
    <div className="mt-4 space-y-3" aria-hidden>
      <div className="h-3.5 w-36 rounded bg-aurora-surface-hover animate-pulse" />
      <div className="flex gap-3 overflow-hidden">
        {[1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-20 min-w-[120px] flex-1 max-w-[180px] rounded-lg bg-aurora-surface-hover animate-pulse"
          />
        ))}
      </div>
    </div>
  );
}

/** Fallback while recipe rail + grouped sections stream in. */
export function ForYouSectionsSkeleton() {
  return (
    <div className="space-y-10" aria-busy="true" aria-label="Loading suggestions">
      <section className="space-y-3">
        <div className="h-6 w-40 rounded bg-aurora-surface-hover animate-pulse" />
        <div className="flex gap-3 overflow-x-auto pb-2">
          {[1, 2, 3, 4].map((i) => (
            <div
              key={i}
              className="h-40 w-32 shrink-0 rounded-xl bg-aurora-surface-hover animate-pulse"
            />
          ))}
        </div>
      </section>
      <div className="space-y-4">
        <div className="h-5 w-48 rounded bg-aurora-surface-hover animate-pulse" />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-44 rounded-xl bg-aurora-surface-hover animate-pulse" />
          ))}
        </div>
      </div>
    </div>
  );
}
