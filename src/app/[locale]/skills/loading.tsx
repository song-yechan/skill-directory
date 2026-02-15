export default function SkillsLoading() {
  return (
    <div className="space-y-6">
      <div className="space-y-2">
        <div className="h-8 w-32 animate-pulse rounded-lg bg-[var(--border)]" />
        <div className="h-4 w-64 animate-pulse rounded bg-[var(--border)]" />
      </div>
      <div className="h-11 w-full animate-pulse rounded-lg bg-[var(--border)]" />
      <div className="flex gap-2">
        {Array.from({ length: 6 }).map((_, i) => (
          <div key={i} className="h-9 w-24 animate-pulse rounded-full bg-[var(--border)]" />
        ))}
      </div>
      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {Array.from({ length: 9 }).map((_, i) => (
          <div key={i} className="h-48 animate-pulse rounded-xl bg-[var(--border)]" />
        ))}
      </div>
    </div>
  );
}
