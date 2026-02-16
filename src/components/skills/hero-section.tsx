'use client';

import { useTranslations, useLocale } from 'next-intl';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Search } from 'lucide-react';
import { useState, useMemo, useRef } from 'react';
import { useDebounce } from '@/hooks/use-debounce';

interface HeroSkill {
  readonly slug: string;
  readonly name: string;
  readonly name_ko: string | null;
  readonly summary_ko: string | null;
  readonly summary_en: string | null;
  readonly tags: readonly string[];
}

interface HeroSectionProps {
  readonly allSkills?: readonly HeroSkill[];
}

const SUGGESTED_TAGS = [
  'test-automation', 'code-review', 'commit', 'security',
  'documentation', 'refactoring', 'deployment', 'debugging'
];

export function HeroSection({ allSkills = [] }: HeroSectionProps) {
  const t = useTranslations('home');
  const locale = useLocale();
  const router = useRouter();
  const [query, setQuery] = useState('');
  const [showDropdown, setShowDropdown] = useState(false);
  const blurTimeoutRef = useRef<ReturnType<typeof setTimeout>>(null);
  const debouncedQuery = useDebounce(query, 200);

  const previewResults = useMemo(() => {
    if (!debouncedQuery || debouncedQuery.length < 2) return [];
    const q = debouncedQuery.toLowerCase();
    return allSkills
      .filter((s) =>
        s.name.toLowerCase().includes(q) ||
        s.name_ko?.toLowerCase().includes(q) ||
        s.summary_en?.toLowerCase().includes(q) ||
        s.summary_ko?.toLowerCase().includes(q) ||
        s.tags?.some(tag => tag.toLowerCase().includes(q))
      )
      .slice(0, 5);
  }, [debouncedQuery, allSkills]);

  const handleSearch = (q: string) => {
    setShowDropdown(false);
    if (q) {
      router.push(`/${locale}/skills?q=${encodeURIComponent(q)}`);
    } else {
      router.push(`/${locale}/skills`);
    }
  };

  const handleBlur = () => {
    blurTimeoutRef.current = setTimeout(() => setShowDropdown(false), 200);
  };

  const handleFocus = () => {
    if (blurTimeoutRef.current) clearTimeout(blurTimeoutRef.current);
    if (query.length >= 2) setShowDropdown(true);
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
            onChange={(e) => {
              setQuery(e.target.value);
              setShowDropdown(e.target.value.length >= 2);
            }}
            onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
            onFocus={handleFocus}
            onBlur={handleBlur}
            placeholder={t('searchPlaceholder')}
            className="w-full rounded-xl bg-[var(--bg-input)] py-3.5 pl-12 pr-4 text-base text-[var(--text-primary)] shadow-lg placeholder:text-[var(--text-tertiary)] focus:outline-none focus:ring-2 focus:ring-[var(--accent)]"
          />

          {/* Search preview dropdown */}
          {showDropdown && previewResults.length > 0 && (
            <div className="absolute left-0 right-0 top-full z-50 mt-2 overflow-hidden rounded-xl bg-[var(--bg-card)] shadow-xl" style={{ boxShadow: 'var(--shadow-dropdown)' }}>
              {previewResults.map((skill) => (
                <Link
                  key={skill.slug}
                  href={`/${locale}/skills/${skill.slug}`}
                  className="flex flex-col px-4 py-3 text-left transition-colors hover:bg-[var(--accent-light)]"
                  onMouseDown={(e) => e.preventDefault()}
                >
                  <span className="text-sm font-medium text-[var(--text-primary)]">
                    {locale === 'ko' ? skill.name_ko ?? skill.name : skill.name}
                  </span>
                  <span className="mt-0.5 text-xs text-[var(--text-tertiary)] line-clamp-1">
                    {locale === 'ko' ? skill.summary_ko ?? skill.summary_en : skill.summary_en}
                  </span>
                </Link>
              ))}
            </div>
          )}
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
