import { getTranslations, setRequestLocale } from 'next-intl/server';
import { CategoryBar } from '@/components/skills/category-bar';
import { SkillCard } from '@/components/skills/skill-card';
import { TagFilter } from '@/components/skills/tag-filter';
import { SearchBarClient } from '@/components/skills/search-bar';
import { createPublicClient } from '@/lib/supabase/public';
import { getPopularityScore, getTrendingScore } from '@/lib/popularity';
import { Search } from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;

interface AllSkillsPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string; tag?: string }>;
}

export async function generateMetadata({ params }: AllSkillsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata');

  return {
    title: t('skillsTitle'),
    description: t('skillsDescription'),
  };
}

const SORT_COLUMNS: Record<string, string> = {
  stars: 'stars',
  good: 'good_count',
  installs: 'install_count',
  views: 'view_count',
  recent: 'updated_at',
};

export default async function AllSkillsPage({ params, searchParams }: AllSkillsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { q, category, sort = 'stars', tag } = await searchParams;
  const t = await getTranslations('allSkills');
  const supabase = createPublicClient();

  // Build skill query with filters
  let skillQuery = supabase.from('skills').select('*');
  if (category && category !== 'all') {
    skillQuery = skillQuery.eq('category_id', category);
  }
  if (q) {
    skillQuery = skillQuery.or(
      `name.ilike.%${q}%,description_en.ilike.%${q}%,description_ko.ilike.%${q}%,summary_en.ilike.%${q}%,summary_ko.ilike.%${q}%`
    );
  }
  if (tag) {
    skillQuery = skillQuery.contains('tags', [tag]);
  }

  // 'popular' and 'trending' use client-side sort, others use DB sort
  const isClientSort = sort === 'popular' || sort === 'trending';
  if (!isClientSort) {
    const sortColumn = SORT_COLUMNS[sort] ?? 'stars';
    skillQuery = skillQuery.order(sortColumn, { ascending: false });
  }
  skillQuery = skillQuery.limit(100);

  // Parallel fetch: categories + tags + filtered skills
  const [{ data: categories }, { data: allSkillsForTags }, { data: rawSkills }] = await Promise.all([
    supabase.from('categories').select('*').order('sort_order'),
    supabase.from('skills').select('tags'),
    skillQuery,
  ]);
  const allTags = [
    ...new Set((allSkillsForTags ?? []).flatMap((s) => s.tags ?? [])),
  ].sort();

  // Apply client-side sort for composite scores
  const skills = sort === 'popular'
    ? [...(rawSkills ?? [])].sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
    : sort === 'trending'
      ? [...(rawSkills ?? [])].sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
      : rawSkills;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t('subtitle')}
        </p>
      </div>

      {/* Search */}
      <SearchBarClient />

      {/* Category + Sort */}
      <CategoryBar categories={categories ?? []} locale={locale} />

      {/* Tag filter */}
      <TagFilter tags={allTags} />

      {/* Results count */}
      {skills && (
        <p className="text-xs text-[var(--text-tertiary)]">
          {t('resultCount', { count: skills.length })}
        </p>
      )}

      {/* Skills grid */}
      {skills && skills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {skills.map((skill) => (
            <SkillCard key={skill.id} skill={skill} />
          ))}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-4 py-20 text-center">
          <div className="flex h-16 w-16 items-center justify-center rounded-full bg-[var(--accent-light)]">
            <Search className="h-7 w-7 text-[var(--accent)]" />
          </div>
          <p className="text-lg font-medium text-[var(--text-secondary)]">
            {q ? t('noResultsQuery', { query: q }) : t('noResults')}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            {q ? t('noResultsHint') : t('noResultsEmpty')}
          </p>
        </div>
      )}
    </div>
  );
}
