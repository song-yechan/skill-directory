export default function SkillLoading() {
  return (
    <div className="mx-auto max-w-6xl">
      {/* Back link skeleton */}
      <div className="mb-6 h-4 w-24 animate-pulse rounded bg-[var(--border)]" />

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Main content skeleton */}
        <div className="min-w-0 space-y-8">
          <div>
            <div className="h-6 w-20 animate-pulse rounded-full bg-[var(--accent-light)]" />
            <div className="mt-3 h-8 w-3/4 animate-pulse rounded-lg bg-[var(--border)]" />
            <div className="mt-3 h-5 w-full animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-1.5 h-5 w-2/3 animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-4 flex gap-2">
              <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--border)]" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--border)]" />
              <div className="h-5 w-14 animate-pulse rounded-full bg-[var(--border)]" />
            </div>
          </div>

          {/* Content sections skeleton */}
          {[1, 2, 3].map((i) => (
            <div key={i} className="space-y-3">
              <div className="h-6 w-32 animate-pulse rounded bg-[var(--border)]" />
              <div className="space-y-2">
                <div className="h-4 w-full animate-pulse rounded bg-[var(--border)]" />
                <div className="h-4 w-5/6 animate-pulse rounded bg-[var(--border)]" />
                <div className="h-4 w-4/6 animate-pulse rounded bg-[var(--border)]" />
              </div>
            </div>
          ))}
        </div>

        {/* Sidebar skeleton */}
        <aside className="space-y-5">
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="h-4 w-20 animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-3 h-10 w-full animate-pulse rounded-lg bg-[var(--bg-code)]" />
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="h-4 w-32 animate-pulse rounded bg-[var(--border)]" />
            <div className="mt-3 flex gap-3">
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-[var(--vote-good)]/10" />
              <div className="h-10 flex-1 animate-pulse rounded-lg bg-[var(--vote-bad)]/10" />
            </div>
          </div>

          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <div className="grid grid-cols-2 gap-4">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="flex flex-col items-center gap-1">
                  <div className="h-6 w-12 animate-pulse rounded bg-[var(--border)]" />
                  <div className="h-3 w-8 animate-pulse rounded bg-[var(--border)]" />
                </div>
              ))}
            </div>
          </div>
        </aside>
      </div>
    </div>
  );
}
