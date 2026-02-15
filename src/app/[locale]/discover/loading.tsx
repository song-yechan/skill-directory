export default function DiscoverLoading() {
  return (
    <div className="space-y-8">
      <div>
        <div className="h-8 w-48 animate-pulse rounded-lg bg-[var(--border)]" />
        <div className="mt-2 h-4 w-72 animate-pulse rounded bg-[var(--border)]" />
      </div>

      <div className="flex gap-2">
        <div className="h-9 w-24 animate-pulse rounded-full bg-[var(--border)]" />
        <div className="h-9 w-24 animate-pulse rounded-full bg-[var(--border)]" />
      </div>

      <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
        {Array.from({ length: 6 }).map((_, i) => (
          <div
            key={i}
            className="h-48 animate-pulse rounded-xl border border-[var(--border)] bg-[var(--bg-card)]"
          />
        ))}
      </div>
    </div>
  );
}
