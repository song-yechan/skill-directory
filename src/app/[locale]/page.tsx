import { getTranslations } from 'next-intl/server';
import { SkillSearch } from '@/components/skills/skill-search';
import { SkillFilters } from '@/components/skills/skill-filters';
import { SkillCard } from '@/components/skills/skill-card';
import { createClient } from '@/lib/supabase/server';

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

const SORT_COLUMNS: Record<string, string> = {
  stars: 'stars',
  good: 'good_count',
  installs: 'install_count',
  recent: 'updated_at'
};

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const { q, category, sort = 'stars' } = await searchParams;
  const t = await getTranslations('home');
  const supabase = await createClient();

  // 카테고리 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  // 스킬 조회 (필터 + 정렬)
  let skillQuery = supabase.from('skills').select('*');

  if (category && category !== 'all') {
    skillQuery = skillQuery.eq('category_id', category);
  }

  if (q) {
    skillQuery = skillQuery.or(
      `name.ilike.%${q}%,description_en.ilike.%${q}%,description_ko.ilike.%${q}%`
    );
  }

  const sortColumn = SORT_COLUMNS[sort] ?? 'stars';
  skillQuery = skillQuery.order(sortColumn, { ascending: false }).limit(50);

  const { data: skills } = await skillQuery;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      <SkillSearch />

      <SkillFilters categories={categories ?? []} locale={locale} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(skills ?? []).map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {(!skills || skills.length === 0) && (
        <p className="text-center text-gray-500">No skills found.</p>
      )}
    </div>
  );
}
