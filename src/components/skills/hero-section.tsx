'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

const SUGGESTED_TAGS = [
  'test-automation', 'code-review', 'commit', 'security',
  'documentation', 'refactoring', 'deployment', 'debugging'
];

export function HeroSection() {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <section
      className="relative -mx-4 -mt-8 px-4 py-16 sm:-mx-6 sm:px-6 sm:py-20"
      style={{ background: 'linear-gradient(135deg, var(--bg-hero-from), var(--bg-hero-to))' }}
    >
      <div className="mx-auto max-w-3xl text-center">
        <h1 className="text-3xl font-bold tracking-tight text-[var(--text-inverse)] sm:text-4xl">
          {t('title')}
        </h1>
        <p className="mt-3 text-base text-[var(--text-tertiary)] sm:text-lg">
          {t('subtitle')}
        </p>

        <div className="relative mt-8">
          <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-[var(--text-tertiary)]" />
          <input
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl bg-white py-3.5 pl-12 pr-4 text-base text-[var(--text-primary)] shadow-lg placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />
        </div>

        <div className="mt-5 flex flex-wrap items-center justify-center gap-2">
          <span className="text-sm text-[var(--text-tertiary)]">{t('suggestedTags')}</span>
          {SUGGESTED_TAGS.map((tag) => (
            <button
              key={tag}
              onClick={() => handleSearch(tag)}
              className="rounded-full bg-white/10 px-3 py-1 text-sm text-[var(--text-tertiary)] transition-colors hover:bg-white/20 hover:text-white"
            >
              {tag}
            </button>
          ))}
        </div>
      </div>
    </section>
  );
}
