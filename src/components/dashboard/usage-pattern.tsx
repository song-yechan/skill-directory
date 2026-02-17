import { useTranslations } from 'next-intl';
import { CATEGORY_LABELS, CATEGORY_COLORS } from '@/lib/constants';

interface InstalledSkill {
  readonly category_id: string;
  readonly tags: readonly string[];
}

interface UsagePatternProps {
  readonly installs: readonly InstalledSkill[];
}

export function UsagePattern({ installs }: UsagePatternProps) {
  const t = useTranslations('dashboard');

  if (installs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-6 text-center">
        <p className="text-sm text-[var(--text-secondary)]">{t('noPatternYet')}</p>
      </div>
    );
  }

  // Category distribution
  const categoryCounts: Record<string, number> = {};
  for (const skill of installs) {
    const cat = skill.category_id ?? 'other';
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }
  const sortedCategories = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a);
  const maxCount = sortedCategories[0]?.[1] ?? 1;

  // Top tags
  const tagCounts: Record<string, number> = {};
  for (const skill of installs) {
    for (const tag of skill.tags) {
      tagCounts[tag] = (tagCounts[tag] ?? 0) + 1;
    }
  }
  const topTags = Object.entries(tagCounts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 5);

  return (
    <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
      {/* Category bar chart */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h4 className="text-sm font-medium text-[var(--text-primary)]">{t('byCategory')}</h4>
        <div className="mt-4 space-y-3">
          {sortedCategories.map(([cat, count]) => {
            const pct = Math.round((count / maxCount) * 100);
            const label = CATEGORY_LABELS[cat]?.ko ?? cat;

            return (
              <div key={cat}>
                <div className="mb-1 flex items-center justify-between text-xs">
                  <span className="text-[var(--text-secondary)]">{label}</span>
                  <span className="tabular-nums text-[var(--text-tertiary)]">{count}</span>
                </div>
                <div className="h-2 overflow-hidden rounded-full bg-[var(--bg-primary)]">
                  <div
                    className={`h-full rounded-full ${CATEGORY_COLORS[cat] ?? 'bg-slate-400'} transition-all`}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Top tags */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h4 className="text-sm font-medium text-[var(--text-primary)]">{t('topTags')}</h4>
        {topTags.length > 0 ? (
          <div className="mt-4 flex flex-wrap gap-2">
            {topTags.map(([tag, count]) => (
              <span
                key={tag}
                className="inline-flex items-center gap-1.5 rounded-full bg-[var(--accent-light)] px-3 py-1.5 text-xs font-medium text-[var(--accent)]"
              >
                {tag}
                <span className="rounded-full bg-[var(--accent)] px-1.5 py-0.5 text-[10px] text-white tabular-nums">
                  {count}
                </span>
              </span>
            ))}
          </div>
        ) : (
          <p className="mt-4 text-sm text-[var(--text-tertiary)]">{t('noPatternYet')}</p>
        )}
      </div>
    </div>
  );
}
