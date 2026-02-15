export default function HomeLoading() {
  return (
    <div className="space-y-10">
      {/* Hero skeleton */}
      <div
        className="relative -mx-4 -mt-8 px-4 py-16 sm:-mx-6 sm:px-6 sm:py-20"
        style={{ background: 'linear-gradient(135deg, var(--bg-hero-from), var(--bg-hero-to))' }}
      >
        <div className="mx-auto max-w-3xl text-center">
          <div className="mx-auto h-9 w-80 animate-pulse rounded-lg bg-white/10" />
          <div className="mx-auto mt-3 h-5 w-60 animate-pulse rounded bg-white/10" />
          <div className="mx-auto mt-8 h-12 w-full animate-pulse rounded-xl bg-white/20" />
        </div>
      </div>

      {/* Category bar skeleton */}
      <div className="flex gap-2">
        {Array.from({ length: 7 }).map((_, i) => (
          <div key={i} className="h-9 w-24 shrink-0 animate-pulse rounded-full bg-[var(--border)]" />
        ))}
      </div>

      {/* Skill cards skeleton */}
      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div
            key={i}
            className="flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
          >
            <div className="h-3 w-16 animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-2 h-5 w-3/4 animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-3 h-4 w-full animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-1.5 h-4 w-2/3 animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-4 flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--border)]" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--border)]" />
            </div>
            <div className="mt-4 flex gap-4 border-t border-dashed border-[var(--border)] pt-3">
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--border)]" />
              <div className="h-4 w-12 animate-pulse rounded bg-[var(--border)]" />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
