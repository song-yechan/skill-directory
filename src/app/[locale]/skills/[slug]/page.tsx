import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { VoteButton } from '@/components/skills/vote-button';
import { Star, Download, Eye, ExternalLink } from 'lucide-react';

interface SkillPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations('skill');
  const supabase = await createClient();

  const { data: skill } = await supabase
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!skill) notFound();

  // 뷰 카운트 증가
  await supabase.rpc('increment_view', { p_skill_id: skill.id });

  // 현재 사용자 투표 확인
  const { data: { user } } = await supabase.auth.getUser();
  let userVote: 'good' | 'bad' | null = null;

  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('skill_id', skill.id)
      .single();
    userVote = (vote?.vote_type as 'good' | 'bad') ?? null;
  }

  const description = locale === 'ko' ? skill.description_ko : skill.description_en;
  const installCommand = `npx skill-directory install ${skill.slug}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      <div>
        <h1 className="text-3xl font-bold">{skill.name}</h1>
        <p className="mt-2 text-lg text-gray-600">{description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" /> {skill.stars} Stars
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {skill.view_count} {t('views')}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {skill.install_count} {t('installs')}
          </span>
          <a
            href={skill.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>

      <VoteButton
        skillId={skill.id}
        goodCount={skill.good_count}
        badCount={skill.bad_count}
        userVote={userVote}
        isLoggedIn={!!user}
      />

      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-lg font-semibold">{t('installCommand')}</h2>
        <div className="mt-3">
          <code className="block rounded-lg bg-gray-900 px-4 py-3 text-sm text-green-400">
            {installCommand}
          </code>
        </div>
      </div>

      {skill.install_guide && (
        <section>
          <h2 className="text-xl font-semibold">{t('howToInstall')}</h2>
          <div className="prose mt-3 max-w-none">
            {skill.install_guide}
          </div>
        </section>
      )}

      {skill.usage_guide && (
        <section>
          <h2 className="text-xl font-semibold">{t('howToUse')}</h2>
          <div className="prose mt-3 max-w-none">
            {skill.usage_guide}
          </div>
        </section>
      )}

      {skill.examples && (
        <section>
          <h2 className="text-xl font-semibold">{t('examples')}</h2>
          <div className="prose mt-3 max-w-none">
            {skill.examples}
          </div>
        </section>
      )}

      <details className="rounded-xl border border-gray-200 p-5">
        <summary className="cursor-pointer font-semibold">
          {t('viewReadme')}
        </summary>
        <div className="prose mt-4 max-w-none whitespace-pre-wrap">
          {skill.readme_raw}
        </div>
      </details>
    </div>
  );
}
