import { createPublicClient } from '@/lib/supabase/public';
import { getTranslations, setRequestLocale } from 'next-intl/server';

export const revalidate = 60;
import Link from 'next/link';
import { SkillCard } from '@/components/skills/skill-card';
import { Sparkles, TrendingUp, Clock } from 'lucide-react';

interface DiscoverPageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ tab?: string }>;
}

export default async function DiscoverPage({ params, searchParams }: DiscoverPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { tab = 'new' } = await searchParams;
  const t = await getTranslations('discover');
  const supabase = createPublicClient();

  const isNew = tab === 'new';

  // New: sorted by created_at desc
  // Trending: weighted score (good * 3 + install * 2 + views)
  const sortColumn = isNew ? 'created_at' : 'good_count';

  const { data: skills } = await supabase
    .from('skills')
    .select('*')
    .order(sortColumn, { ascending: false })
    .limit(30);

  // 7일 이내 추가된 스킬 판별
  const threeDaysAgo = new Date();
  threeDaysAgo.setDate(threeDaysAgo.getDate() - 3);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          {t('title')}
        </h1>
        <p className="mt-1.5 text-sm text-[var(--text-secondary)]">
          {t('subtitle')}
        </p>
      </div>

      {/* Tabs */}
      <div className="flex gap-2">
        <Link
          href={`/${locale}/discover?tab=new`}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            isNew
              ? 'bg-[var(--accent)] text-white'
              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <Sparkles className="h-3.5 w-3.5" />
          {t('tabNew')}
        </Link>
        <Link
          href={`/${locale}/discover?tab=trending`}
          className={`inline-flex items-center gap-1.5 rounded-full px-4 py-2 text-sm font-medium transition-colors ${
            !isNew
              ? 'bg-[var(--accent)] text-white'
              : 'border border-[var(--border)] text-[var(--text-secondary)] hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]'
          }`}
        >
          <TrendingUp className="h-3.5 w-3.5" />
          {t('tabTrending')}
        </Link>
      </div>

      {/* Skills grid */}
      {skills && skills.length > 0 ? (
        <div className="grid gap-4 sm:grid-cols-2 sm:gap-6 lg:grid-cols-3">
          {skills.map((skill) => {
            const isRecent = new Date(skill.created_at) > threeDaysAgo;

            return (
              <div key={skill.id} className="relative">
                {isRecent && (
                  <span className="absolute -top-2 -right-2 z-10 inline-flex items-center gap-1 rounded-full bg-emerald-500 px-2 py-0.5 text-[10px] font-bold text-white shadow-sm">
                    <Clock className="h-2.5 w-2.5" />
                    NEW
                  </span>
                )}
                <SkillCard skill={skill} />
              </div>
            );
          })}
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-20 text-center">
          <Sparkles className="h-10 w-10 text-[var(--text-tertiary)]" />
          <p className="text-sm text-[var(--text-secondary)]">{t('empty')}</p>
        </div>
      )}
    </div>
  );
}
