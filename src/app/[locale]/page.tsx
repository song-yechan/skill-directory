import { getTranslations } from 'next-intl/server';
import { HeroSection } from '@/components/skills/hero-section';
import { CategoryBar } from '@/components/skills/category-bar';
import { SkillCard } from '@/components/skills/skill-card';
import { createClient } from '@/lib/supabase/server';
import { Search } from 'lucide-react';

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

  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

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
    <div className="space-y-10">
      <HeroSection />

      <CategoryBar categories={categories ?? []} locale={locale} />

      {(skills && skills.length > 0) ? (
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
            {q ? `"${q}"에 대한 스킬을 찾지 못했습니다` : '아직 등록된 스킬이 없습니다'}
          </p>
          <p className="text-sm text-[var(--text-tertiary)]">
            {q ? '다른 검색어를 시도하거나 카테고리를 둘러보세요' : '곧 스킬이 추가될 예정입니다'}
          </p>
        </div>
      )}
    </div>
  );
}
