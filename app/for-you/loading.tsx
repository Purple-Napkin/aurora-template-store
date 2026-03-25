import { Wrench } from "lucide-react";

/** Immediate feedback on client navigation until the For You RSC payload streams. */
export default function ForYouLoading() {
  return (
    <div className="max-w-5xl mx-auto py-8 px-4 sm:px-6">
      <div className="mb-6">
        <div className="h-6 w-28 rounded bg-aurora-surface-hover animate-pulse mb-3" />
        <div className="flex items-center gap-2">
          <Wrench className="w-5 h-5 text-aurora-primary shrink-0 opacity-35" aria-hidden />
          <div className="h-7 w-32 rounded bg-aurora-surface-hover animate-pulse" />
        </div>
        <div className="h-3.5 max-w-md rounded bg-aurora-surface-hover animate-pulse mt-2" />
        <div className="h-3.5 max-w-sm rounded bg-aurora-surface-hover animate-pulse mt-1.5" />
      </div>
      <div className="space-y-6">
        <div className="h-16 rounded-xl bg-aurora-surface-hover animate-pulse" />
        <div className="h-28 rounded-xl bg-aurora-surface-hover animate-pulse" />
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="aspect-[3/4] rounded-lg bg-aurora-surface-hover animate-pulse" />
          ))}
        </div>
      </div>
      <p className="sr-only">Loading For you</p>
    </div>
  );
}
