'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const SORT_OPTIONS = ['stars', 'good', 'installs', 'recent'] as const;

interface SkillFiltersProps {
  readonly categories: ReadonlyArray<{
    readonly id: string;
    readonly name_ko: string;
    readonly name_en: string;
  }>;
  readonly locale: string;
}

export function SkillFilters({ categories, locale }: SkillFiltersProps) {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

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

  const currentCategory = searchParams.get('category') ?? 'all';
  const currentSort = searchParams.get('sort') ?? 'stars';

  return (
    <div className="flex flex-wrap items-center gap-3">
      <select
        value={currentCategory}
        onChange={(e) => updateParam('category', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="all">{t('category')}: {t('all') ?? '전체'}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {locale === 'ko' ? cat.name_ko : cat.name_en}
          </option>
        ))}
      </select>

      <select
        value={currentSort}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
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
