import { getTranslations, setRequestLocale } from 'next-intl/server';
import { HeroSection } from '@/components/skills/hero-section';
import { SkillCard } from '@/components/skills/skill-card';
import { createPublicClient } from '@/lib/supabase/public';
import { getPopularityScore, getTrendingScore } from '@/lib/popularity';
import Link from 'next/link';
import { Flame, TrendingUp, ArrowRight } from 'lucide-react';

// ISR: revalidate every 60 seconds
export const revalidate = 60;

interface HomePageProps {
  params: Promise<{ locale: string }>;
}

export default async function HomePage({ params }: HomePageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('home');
  const supabase = createPublicClient();

  const { data: allSkills } = await supabase.from('skills').select('*');

  const skills = allSkills ?? [];

  // Popular: composite score (stars baseline + views + installs + votes)
  const popular = [...skills]
    .sort((a, b) => getPopularityScore(b) - getPopularityScore(a))
    .slice(0, 5);

  // Trending: weekly delta from snapshot
  const trending = [...skills]
    .sort((a, b) => getTrendingScore(b) - getTrendingScore(a))
    .slice(0, 5);

  return (
    <div className="space-y-12">
      <HeroSection />

      {/* Popular (composite score) */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Flame className="h-5 w-5 text-[var(--accent)]" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {t('popularTitle')}
            </h2>
          </div>
          <Link
            href={`/${locale}/skills?sort=popular`}
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            {t('viewMore')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {popular.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
            {popular.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </section>

      {/* Trending (weekly delta) */}
      <section>
        <div className="mb-5 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5 text-emerald-500" />
            <h2 className="text-lg font-bold text-[var(--text-primary)]">
              {t('trendingTitle')}
            </h2>
          </div>
          <Link
            href={`/${locale}/skills?sort=trending`}
            className="flex items-center gap-1 text-sm font-medium text-[var(--accent)] transition-colors hover:text-[var(--accent-hover)]"
          >
            {t('viewMore')}
            <ArrowRight className="h-3.5 w-3.5" />
          </Link>
        </div>
        {trending.length > 0 && (
          <div className="grid gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3 xl:grid-cols-5">
            {trending.map((skill) => (
              <SkillCard key={skill.id} skill={skill} />
            ))}
          </div>
        )}
      </section>

      {/* Browse All CTA */}
      <section className="flex flex-col items-center gap-3 rounded-xl border border-dashed border-[var(--border)] py-10 text-center">
        <p className="text-sm text-[var(--text-secondary)]">
          {t('browseAllDesc')}
        </p>
        <Link
          href={`/${locale}/skills`}
          className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-5 py-2.5 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)]"
        >
          {t('browseAll')}
          <ArrowRight className="h-4 w-4" />
        </Link>
      </section>
    </div>
  );
}
