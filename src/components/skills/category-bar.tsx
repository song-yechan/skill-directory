'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useCallback } from 'react';
import { Code, FlaskConical, Server, Zap, FileText, Puzzle } from 'lucide-react';

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  development: <Code className="h-3.5 w-3.5" />,
  testing: <FlaskConical className="h-3.5 w-3.5" />,
  devops: <Server className="h-3.5 w-3.5" />,
  productivity: <Zap className="h-3.5 w-3.5" />,
  docs: <FileText className="h-3.5 w-3.5" />,
  other: <Puzzle className="h-3.5 w-3.5" />,
};

const SORT_OPTIONS = ['stars', 'good', 'installs', 'recent'] as const;

interface CategoryBarProps {
  readonly categories: ReadonlyArray<{
    readonly id: string;
    readonly name_ko: string;
    readonly name_en: string;
  }>;
  readonly locale: string;
}

export function CategoryBar({ categories, locale }: CategoryBarProps) {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const currentCategory = searchParams.get('category') ?? 'all';
  const currentSort = searchParams.get('sort') ?? 'stars';

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  return (
    <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
        <button
          onClick={() => updateParam('category', 'all')}
          className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
            currentCategory === 'all'
              ? 'border-transparent bg-[var(--accent)] text-white'
              : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
          }`}
        >
          {t('all') ?? '전체'}
        </button>
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => updateParam('category', cat.id)}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              currentCategory === cat.id
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-white text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {CATEGORY_ICONS[cat.id]}
            {locale === 'ko' ? cat.name_ko : cat.name_en}
          </button>
        ))}
      </div>

      <select
        value={currentSort}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="shrink-0 rounded-lg border border-[var(--border)] bg-white px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {t(`sort${opt.charAt(0).toUpperCase() + opt.slice(1)}` as 'sortStars' | 'sortGood' | 'sortInstalls' | 'sortRecent')}
          </option>
        ))}
      </select>
    </div>
  );
}
