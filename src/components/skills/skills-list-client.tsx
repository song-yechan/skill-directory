'use client';

import { useMemo, useState, useCallback, useEffect } from 'react';
import { useSearchParams } from 'next/navigation';
import { useLocale, useTranslations } from 'next-intl';
import { useDebounce } from '@/hooks/use-debounce';
import { SkillCard } from './skill-card';
import { Search, Tag, X, Code, FlaskConical, Server, Zap, FileText, Puzzle } from 'lucide-react';
import { getPopularityScore, getTrendingScore } from '@/lib/popularity';
import { getSearchRelevance } from '@/lib/search';

interface Skill {
  readonly id: string;
  readonly slug: string;
  readonly name: string;
  readonly name_ko: string | null;
  readonly summary_ko: string | null;
  readonly summary_en: string | null;
  readonly description_ko: string | null;
  readonly description_en: string | null;
  readonly stars: number;
  readonly good_count: number;
  readonly bad_count: number;
  readonly view_count: number;
  readonly install_count: number;
  readonly category_id: string;
  readonly tags: readonly string[];
  readonly updated_at: string;
  readonly created_at: string;
  readonly view_count_snapshot: number;
  readonly install_count_snapshot: number;
  readonly good_count_snapshot: number;
}

interface Category {
  readonly id: string;
  readonly name_ko: string;
  readonly name_en: string;
}

interface SkillsListClientProps {
  readonly allSkills: readonly Skill[];
  readonly categories: readonly Category[];
}

const CATEGORY_ICONS: Record<string, React.ReactNode> = {
  development: <Code className="h-3.5 w-3.5" />,
  testing: <FlaskConical className="h-3.5 w-3.5" />,
  devops: <Server className="h-3.5 w-3.5" />,
  productivity: <Zap className="h-3.5 w-3.5" />,
  docs: <FileText className="h-3.5 w-3.5" />,
  other: <Puzzle className="h-3.5 w-3.5" />,
};

const SORT_OPTIONS = ['popular', 'trending', 'stars', 'good', 'installs', 'views', 'recent'] as const;

export function SkillsListClient({ allSkills, categories }: SkillsListClientProps) {
  const locale = useLocale();
  const t = useTranslations('allSkills');
  const tHome = useTranslations('home');
  const searchParams = useSearchParams();

  // Local filter state (initialized from URL)
  const [query, setQuery] = useState(searchParams.get('q') ?? '');
  const debouncedQuery = useDebounce(query, 300);
  const [category, setCategory] = useState(searchParams.get('category') ?? 'all');
  const [sort, setSort] = useState(searchParams.get('sort') ?? 'stars');
  const [activeTag, setActiveTag] = useState(searchParams.get('tag') ?? '');
  const [showAllTags, setShowAllTags] = useState(false);

  // Sync URL without navigation
  const syncUrl = useCallback((params: Record<string, string>) => {
    const url = new URLSearchParams();
    for (const [k, v] of Object.entries(params)) {
      if (v && v !== 'all') url.set(k, v);
    }
    const qs = url.toString();
    window.history.replaceState(null, '', qs ? `?${qs}` : window.location.pathname);
  }, []);

  const updateFilter = useCallback((key: string, value: string) => {
    const next = { q: query, category, sort, tag: activeTag, [key]: value };
    if (key === 'category') setCategory(value);
    if (key === 'sort') setSort(value);
    if (key === 'tag') setActiveTag(value);
    if (key === 'q') setQuery(value);
    syncUrl(next);
  }, [query, category, sort, activeTag, syncUrl]);

  // All tags from skills
  const allTags = useMemo(() => {
    const tagSet = new Set<string>();
    for (const skill of allSkills) {
      for (const tag of skill.tags ?? []) tagSet.add(tag);
    }
    return [...tagSet].sort();
  }, [allSkills]);

  const visibleTags = showAllTags ? allTags : allTags.slice(0, 15);

  // Filter & sort
  const filteredSkills = useMemo(() => {
    let result = [...allSkills];

    // Category filter
    if (category && category !== 'all') {
      result = result.filter((s) => s.category_id === category);
    }

    // Tag filter
    if (activeTag) {
      result = result.filter((s) => s.tags?.includes(activeTag));
    }

    // Search filter with relevance scoring
    let relevanceMap: ReadonlyMap<string, number> | null = null;
    if (debouncedQuery) {
      const scored = new Map<string, number>();
      result = result.filter((s) => {
        const score = getSearchRelevance(s, debouncedQuery);
        if (score > 0) {
          scored.set(s.id, score);
          return true;
        }
        return false;
      });
      relevanceMap = scored;
    }

    // Sort — when searching with default sort, use relevance
    if (relevanceMap && sort === 'stars') {
      result.sort((a, b) => (relevanceMap.get(b.id) ?? 0) - (relevanceMap.get(a.id) ?? 0));
    } else switch (sort) {
      case 'popular':
        result.sort((a, b) => getPopularityScore(b) - getPopularityScore(a));
        break;
      case 'trending':
        result.sort((a, b) => getTrendingScore(b) - getTrendingScore(a));
        break;
      case 'stars':
        result.sort((a, b) => b.stars - a.stars);
        break;
      case 'good':
        result.sort((a, b) => b.good_count - a.good_count);
        break;
      case 'installs':
        result.sort((a, b) => b.install_count - a.install_count);
        break;
      case 'views':
        result.sort((a, b) => b.view_count - a.view_count);
        break;
      case 'recent':
        result.sort((a, b) => new Date(b.updated_at).getTime() - new Date(a.updated_at).getTime());
        break;
    }

    return result;
  }, [allSkills, category, activeTag, debouncedQuery, sort]);

  useEffect(() => {
    syncUrl({ q: debouncedQuery, category, sort, tag: activeTag });
  }, [debouncedQuery, category, sort, activeTag, syncUrl]);

  const popularTags = useMemo(() => {
    const tagCount = new Map<string, number>();
    for (const skill of allSkills) {
      for (const tag of skill.tags ?? []) {
        tagCount.set(tag, (tagCount.get(tag) ?? 0) + 1);
      }
    }
    return [...tagCount.entries()]
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);
  }, [allSkills]);

  return (
    <div className="space-y-6">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        />
      </div>

      {/* Category + Sort */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide">
          <button
            onClick={() => updateFilter('category', 'all')}
            className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
              category === 'all'
                ? 'border-transparent bg-[var(--accent)] text-white'
                : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
            }`}
          >
            {tHome('all') ?? '전체'}
          </button>
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => updateFilter('category', cat.id)}
              className={`flex shrink-0 items-center gap-1.5 rounded-full border px-4 py-2 text-sm font-medium transition-colors ${
                category === cat.id
                  ? 'border-transparent bg-[var(--accent)] text-white'
                  : 'border-[var(--border)] bg-[var(--bg-card)] text-[var(--text-secondary)] hover:border-[var(--accent)] hover:text-[var(--accent)]'
              }`}
            >
              {CATEGORY_ICONS[cat.id]}
              {locale === 'ko' ? cat.name_ko : cat.name_en}
            </button>
          ))}
        </div>

        <select
          value={sort}
          onChange={(e) => updateFilter('sort', e.target.value)}
          className="shrink-0 rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-secondary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
        >
          {SORT_OPTIONS.map((opt) => (
            <option key={opt} value={opt}>
              {tHome(`sort${opt.charAt(0).toUpperCase() + opt.slice(1)}` as 'sortPopular' | 'sortTrending' | 'sortStars' | 'sortGood' | 'sortInstalls' | 'sortViews' | 'sortRecent')}
            </option>
          ))}
        </select>
      </div>

      {/* Tag filter */}
      {allTags.length > 0 && (
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <Tag className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
            <span className="text-xs font-medium text-[var(--text-tertiary)]">{t('filterByTag')}</span>
            {activeTag && (
              <button
                onClick={() => updateFilter('tag', '')}
                className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white"
              >
                {activeTag}
                <X className="h-3 w-3" />
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-1.5">
            {visibleTags.map((tag) => (
              <button
                key={tag}
                onClick={() => updateFilter('tag', tag === activeTag ? '' : tag)}
                className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
                  tag === activeTag
                    ? 'bg-[var(--accent)] text-white'
                    : 'bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
                }`}
              >
                {tag}
              </button>
            ))}
            {allTags.length > 15 && (
              <button
                onClick={() => setShowAllTags(!showAllTags)}
                className="rounded-full border border-dashed border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
              >
                {showAllTags ? t('showLess') : t('showMore', { count: allTags.length - 15 })}
              </button>
            )}
          </div>
        </div>
      )}

      {/* Results count */}
      <p className="text-xs text-[var(--text-tertiary)]">
        {t('resultCount', { count: filteredSkills.length })}
      </p>

      {/* Skills grid */}
      {filteredSkills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {filteredSkills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-light)]">
            <Search className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <p className="text-lg font-medium text-[var(--text-secondary)]">
            {query ? t('noResultsQuery', { query }) : t('noResults')}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            {query ? t('noResultsHint') : t('noResultsEmpty')}
          </p>
          {query && popularTags.length > 0 && (
            <div className="mt-2 space-y-2">
              <p className="text-xs text-[var(--text-tertiary)]">{t('tryTags')}</p>
              <div className="flex flex-wrap justify-center gap-2">
                {popularTags.map((tag) => (
                  <button
                    key={tag}
                    onClick={() => {
                      setQuery('');
                      updateFilter('tag', tag);
                    }}
                    className="rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-medium text-[var(--accent)] transition-colors hover:bg-[var(--accent)] hover:text-white"
                  >
                    {tag}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
