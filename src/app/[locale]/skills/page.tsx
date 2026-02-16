import { getTranslations, setRequestLocale } from 'next-intl/server';
import { SkillsListClient } from '@/components/skills/skills-list-client';
import { createPublicClient } from '@/lib/supabase/public';
import type { Metadata } from 'next';

export const revalidate = 60;

interface AllSkillsPageProps {
  params: Promise<{ locale: string }>;
}

export async function generateMetadata({ params }: AllSkillsPageProps): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations('metadata');

  return {
    title: t('skillsTitle'),
    description: t('skillsDescription'),
  };
}

export default async function AllSkillsPage({ params }: AllSkillsPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('allSkills');
  const supabase = createPublicClient();

  // Single fetch: all skills + categories (client handles filtering/sorting)
  const [{ data: skills }, { data: categories }] = await Promise.all([
    supabase.from('skills').select('*'),
    supabase.from('categories').select('*').order('sort_order'),
  ]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {t('title')}
        </h1>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">
          {t('subtitle')}
        </p>
      </div>

      <SkillsListClient
        allSkills={skills ?? []}
        categories={categories ?? []}
      />
    </div>
  );
}
