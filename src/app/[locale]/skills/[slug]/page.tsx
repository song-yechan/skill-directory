import { createPublicClient } from '@/lib/supabase/public';
import { getTranslations, setRequestLocale } from 'next-intl/server';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { VoteButton } from '@/components/skills/vote-button';
import { InstallCommand } from '@/components/skills/install-command';
import { SkillCard } from '@/components/skills/skill-card';
import { MarkdownRenderer } from '@/components/ui/markdown-renderer';
import {
  Star, Download, Eye, ExternalLink, ArrowLeft,
  Calendar, Tag, ChevronDown, BadgeCheck
} from 'lucide-react';
import type { Metadata } from 'next';

export const revalidate = 60;

const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  development: { ko: '개발', en: 'Development' },
  testing: { ko: '테스트 & QA', en: 'Testing & QA' },
  devops: { ko: 'DevOps & 인프라', en: 'DevOps & Infra' },
  productivity: { ko: '생산성', en: 'Productivity' },
  docs: { ko: '문서화', en: 'Documentation' },
  other: { ko: '기타', en: 'Other' },
};

interface SkillPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export async function generateMetadata({ params }: SkillPageProps): Promise<Metadata> {
  const { locale, slug } = await params;
  const supabase = createPublicClient();

  const { data: skill } = await supabase
    .from('skills')
    .select('name, name_ko, description_ko, description_en')
    .eq('slug', slug)
    .single();

  if (!skill) {
    return {
      title: 'Skill Not Found — Claude Skill Hub',
    };
  }

  const displayName = locale === 'ko' ? skill.name_ko ?? skill.name : skill.name;
  const description = locale === 'ko'
    ? (skill.description_ko ?? skill.description_en)
    : (skill.description_en ?? skill.description_ko);
  const title = `${displayName} — Claude Skill Hub`;
  const url = `https://skill-directory-livid.vercel.app/${locale}/skills/${slug}`;

  return {
    title,
    description,
    openGraph: {
      title,
      description,
      type: 'website',
      url,
    },
  };
}

export async function generateStaticParams() {
  const supabase = createPublicClient();

  const { data: skills } = await supabase
    .from('skills')
    .select('slug')
    .order('popularity_score', { ascending: false })
    .limit(50);

  if (!skills) return [];

  const params = [];
  for (const skill of skills) {
    params.push({ locale: 'ko', slug: skill.slug });
    params.push({ locale: 'en', slug: skill.slug });
  }

  return params;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { locale, slug } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('skill');
  const supabase = createPublicClient();

  const { data: skill } = await supabase
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!skill) notFound();

  // Fire-and-forget view tracking
  supabase.rpc('increment_view', { p_skill_id: skill.id }).then();

  // Related skills: same category, sorted by common tag count
  const { data: sameCategorySkills } = await supabase
    .from('skills')
    .select('slug, name, name_ko, summary_ko, summary_en, stars, good_count, bad_count, view_count, install_count, category_id, tags')
    .eq('category_id', skill.category_id)
    .neq('slug', slug)
    .limit(20);

  const relatedSkills = (sameCategorySkills ?? [])
    .map((s) => {
      const commonTags = (s.tags ?? []).filter((tag: string) =>
        (skill.tags ?? []).includes(tag)
      ).length;
      return { ...s, commonTags };
    })
    .sort((a, b) => b.commonTags - a.commonTags)
    .slice(0, 4);

  const displayName = locale === 'ko' ? skill.name_ko ?? skill.name : skill.name;
  const description = locale === 'ko'
    ? (skill.description_ko ?? skill.description_en)
    : (skill.description_en ?? skill.description_ko);
  const categoryLabel = CATEGORY_LABELS[skill.category_id]?.[locale as 'ko' | 'en'] ?? skill.category_id;
  const installCommand = `claude skill install ${skill.slug}`;
  const isOfficial = skill.github_owner === 'anthropics';

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'SoftwareApplication',
    name: displayName,
    description,
    url: `https://skill-directory-livid.vercel.app/${locale}/skills/${slug}`,
    applicationCategory: 'DeveloperApplication',
    operatingSystem: 'Cross-platform',
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />
      <div className="mx-auto max-w-6xl">
      {/* Back navigation */}
      <Link
        href={`/${locale}/skills`}
        className="mb-6 inline-flex items-center gap-1.5 text-sm text-[var(--text-tertiary)] transition-colors hover:text-[var(--accent)]"
      >
        <ArrowLeft className="h-4 w-4" />
        {locale === 'ko' ? '스킬 목록' : 'Back to skills'}
      </Link>

      <div className="grid gap-8 lg:grid-cols-[1fr_320px]">
        {/* Sidebar — mobile first (above content) */}
        <aside className="order-first space-y-5 lg:order-last lg:sticky lg:top-24 lg:self-start">
          {/* Install card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h3 className="text-sm font-semibold text-[var(--text-primary)]">
              {t('installCommand')}
            </h3>
            <div className="mt-3">
              <InstallCommand command={installCommand} skillId={skill.id} />
            </div>
          </div>

          {/* Vote card */}
          <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
            <h3 className="mb-3 text-sm font-semibold text-[var(--text-primary)]">
              {locale === 'ko' ? '이 스킬이 유용한가요?' : 'Is this skill useful?'}
            </h3>
            <VoteButton
              skillId={skill.id}
              goodCount={skill.good_count}
              badCount={skill.bad_count}
            />
          </div>

          {/* Stats card */}
          <div className="hidden rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 space-y-3 lg:block">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Star className="h-4 w-4 text-amber-500" />
                <span className="text-sm">{t('stars')}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                {skill.stars.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Download className="h-4 w-4 text-[var(--accent)]" />
                <span className="text-sm">{t('installs')}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                {skill.install_count.toLocaleString()}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Eye className="h-4 w-4" />
                <span className="text-sm">{t('views')}</span>
              </div>
              <span className="text-sm font-semibold tabular-nums text-[var(--text-primary)]">
                {skill.view_count.toLocaleString()}
              </span>
            </div>
            <div className="border-t border-[var(--border)] pt-3 flex items-center justify-between">
              <div className="flex items-center gap-2 text-[var(--text-secondary)]">
                <Calendar className="h-4 w-4" />
                <span className="text-sm">{t('createdAt')}</span>
              </div>
              <span className="text-sm font-medium text-[var(--text-primary)]">
                {new Date(skill.github_created_at ?? skill.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                  year: 'numeric',
                  month: 'short',
                  day: 'numeric'
                })}
              </span>
            </div>
          </div>

          {/* GitHub link */}
          <a
            href={skill.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-3 text-sm font-medium text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            <svg className="h-4 w-4" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
            {locale === 'ko' ? 'GitHub에서 보기' : 'View on GitHub'}
            <ExternalLink className="h-3.5 w-3.5" />
          </a>
        </aside>

        {/* Main content */}
        <div className="min-w-0 space-y-8">
          {/* Header */}
          <div>
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent-light)] px-3 py-1 text-xs font-medium text-[var(--accent)]">
                <Tag className="h-3 w-3" />
                {categoryLabel}
              </span>
              {isOfficial && (
                <span className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-3 py-1 text-xs font-bold text-white">
                  <BadgeCheck className="h-3 w-3" />
                  Official
                </span>
              )}
            </div>

            <h1 className="mt-3 text-3xl font-bold tracking-tight text-[var(--text-primary)]">
              {locale === 'ko' ? skill.name_ko ?? skill.name : skill.name}
            </h1>

            <p className="mt-3 text-lg leading-relaxed text-[var(--text-secondary)]">
              {description}
            </p>

            {skill.tags && skill.tags.length > 0 && (
              <div className="mt-4 flex flex-wrap gap-1.5">
                {skill.tags.map((tag: string) => (
                  <span
                    key={tag}
                    className="rounded-full border border-[var(--border)] px-2.5 py-0.5 text-xs text-[var(--text-tertiary)]"
                  >
                    {tag}
                  </span>
                ))}
              </div>
            )}
          </div>

          {/* Install guide */}
          {skill.install_guide && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {t('howToInstall')}
              </h2>
              <MarkdownRenderer content={skill.install_guide} />
            </section>
          )}

          {/* Usage guide */}
          {(skill.usage_guide || skill.usage_guide_en) && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {t('howToUse')}
              </h2>
              <MarkdownRenderer content={locale === 'ko'
                ? (skill.usage_guide ?? skill.usage_guide_en)
                : (skill.usage_guide_en ?? skill.usage_guide)} />
            </section>
          )}

          {/* Examples */}
          {skill.examples && (
            <section className="space-y-3">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {t('examples')}
              </h2>
              <MarkdownRenderer content={skill.examples} />
            </section>
          )}

          {/* README */}
          {skill.readme_raw && (
            <details className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)]">
              <summary className="flex cursor-pointer items-center justify-between px-5 py-4 text-sm font-semibold text-[var(--text-primary)]">
                {t('viewReadme')}
                <ChevronDown className="h-4 w-4 text-[var(--text-tertiary)] transition-transform group-open:rotate-180" />
              </summary>
              <div className="border-t border-[var(--border)] px-5 py-4">
                <MarkdownRenderer content={skill.readme_raw} />
              </div>
            </details>
          )}

          {/* Related Skills */}
          {relatedSkills.length > 0 && (
            <section className="space-y-4">
              <h2 className="text-xl font-semibold text-[var(--text-primary)]">
                {t('relatedSkills')}
              </h2>
              <div className="grid gap-4 sm:grid-cols-2">
                {relatedSkills.map((rs) => (
                  <SkillCard key={rs.slug} skill={rs} />
                ))}
              </div>
            </section>
          )}
        </div>

        {/* Sidebar is rendered above content for mobile-first layout */}
      </div>
      </div>
    </>
  );
}
