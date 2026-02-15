import { getTranslations, setRequestLocale } from 'next-intl/server';
import { createPublicClient } from '@/lib/supabase/public';
import Link from 'next/link';
import {
  Search, GitBranch, ThumbsUp, Download,
  Zap, Globe, Shield, ArrowRight,
  Github, Star, Code2, Sparkles
} from 'lucide-react';

interface AboutPageProps {
  params: Promise<{ locale: string }>;
}

export const revalidate = 60;

export default async function AboutPage({ params }: AboutPageProps) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations('about');
  const supabase = createPublicClient();

  const { count: totalSkills } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true });

  const { count: totalVotes } = await supabase
    .from('votes')
    .select('*', { count: 'exact', head: true });

  const { data: categories } = await supabase
    .from('categories')
    .select('id, name_ko, name_en')
    .order('sort_order');

  const isKo = locale === 'ko';

  const stats = [
    { value: totalSkills ?? 0, label: t('statsSkills'), icon: Code2 },
    { value: categories?.length ?? 0, label: t('statsCategories'), icon: Search },
    { value: totalVotes ?? 0, label: t('statsVotes'), icon: ThumbsUp },
    { value: 2, label: t('statsLanguages'), icon: Globe },
  ];

  const steps = [
    {
      icon: GitBranch,
      title: t('step1Title'),
      description: t('step1Desc'),
      accent: 'var(--accent)',
    },
    {
      icon: Sparkles,
      title: t('step2Title'),
      description: t('step2Desc'),
      accent: 'var(--accent-green)',
    },
    {
      icon: ThumbsUp,
      title: t('step3Title'),
      description: t('step3Desc'),
      accent: 'var(--vote-good)',
    },
  ];

  const features = [
    {
      icon: Zap,
      title: t('feature1Title'),
      description: t('feature1Desc'),
    },
    {
      icon: Globe,
      title: t('feature2Title'),
      description: t('feature2Desc'),
    },
    {
      icon: Shield,
      title: t('feature3Title'),
      description: t('feature3Desc'),
    },
    {
      icon: Download,
      title: t('feature4Title'),
      description: t('feature4Desc'),
    },
  ];

  return (
    <div className="mx-auto max-w-4xl space-y-16 py-8">
      {/* Hero */}
      <section className="text-center">
        <div className="mx-auto mb-6 flex h-16 w-16 items-center justify-center rounded-2xl bg-gradient-to-br from-[var(--accent)] to-[var(--accent-hover)] shadow-lg">
          <Star className="h-8 w-8 text-white" />
        </div>
        <h1 className="text-4xl font-bold tracking-tight text-[var(--text-primary)] sm:text-5xl">
          {t('title')}
        </h1>
        <p className="mx-auto mt-4 max-w-2xl text-lg leading-relaxed text-[var(--text-secondary)]">
          {t('heroDesc')}
        </p>
      </section>

      {/* Stats */}
      <section className="grid grid-cols-2 gap-4 sm:grid-cols-4">
        {stats.map((stat) => (
          <div
            key={stat.label}
            className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 text-center transition-all hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:shadow-md"
          >
            <stat.icon className="mx-auto mb-2 h-5 w-5 text-[var(--accent)] transition-transform group-hover:scale-110" />
            <div className="text-2xl font-bold tabular-nums text-[var(--text-primary)]">
              {stat.value.toLocaleString()}
            </div>
            <div className="mt-1 text-xs text-[var(--text-tertiary)]">{stat.label}</div>
          </div>
        ))}
      </section>

      {/* How it works */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-[var(--text-primary)]">
          {t('howItWorks')}
        </h2>
        <div className="relative grid gap-8 md:grid-cols-3">
          {/* Connector line */}
          <div className="absolute left-0 right-0 top-10 hidden h-0.5 bg-gradient-to-r from-[var(--accent)] via-[var(--accent-green)] to-[var(--vote-good)] md:block" />

          {steps.map((step, i) => (
            <div key={step.title} className="relative flex flex-col items-center text-center">
              <div
                className="relative z-10 flex h-20 w-20 items-center justify-center rounded-2xl border-2 bg-[var(--bg-card)] shadow-sm transition-transform hover:scale-105"
                style={{ borderColor: step.accent }}
              >
                <step.icon className="h-8 w-8" style={{ color: step.accent }} />
                <span
                  className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full text-xs font-bold text-white"
                  style={{ background: step.accent }}
                >
                  {i + 1}
                </span>
              </div>
              <h3 className="mt-4 text-base font-semibold text-[var(--text-primary)]">
                {step.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {step.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* Why this exists */}
      <section className="rounded-2xl bg-gradient-to-br from-[var(--bg-hero-from)] to-[var(--bg-hero-to)] p-8 sm:p-12">
        <h2 className="text-2xl font-bold text-[var(--text-inverse)]">
          {t('whyTitle')}
        </h2>
        <p className="mt-4 max-w-2xl text-base leading-relaxed text-[var(--text-inverse)]/80">
          {t('whyDesc1')}
        </p>
        <p className="mt-3 max-w-2xl text-base leading-relaxed text-[var(--text-inverse)]/80">
          {t('whyDesc2')}
        </p>
      </section>

      {/* Features */}
      <section>
        <h2 className="mb-8 text-center text-2xl font-bold text-[var(--text-primary)]">
          {t('featuresTitle')}
        </h2>
        <div className="grid gap-6 sm:grid-cols-2">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="group rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-6 transition-all hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:shadow-md"
            >
              <feature.icon className="mb-3 h-6 w-6 text-[var(--accent)] transition-transform group-hover:scale-110" />
              <h3 className="text-base font-semibold text-[var(--text-primary)]">
                {feature.title}
              </h3>
              <p className="mt-2 text-sm leading-relaxed text-[var(--text-secondary)]">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA */}
      <section className="text-center">
        <h2 className="text-2xl font-bold text-[var(--text-primary)]">
          {t('ctaTitle')}
        </h2>
        <p className="mx-auto mt-3 max-w-lg text-sm text-[var(--text-secondary)]">
          {t('ctaDesc')}
        </p>
        <div className="mt-6 flex flex-col items-center gap-3 sm:flex-row sm:justify-center">
          <Link
            href={`/${locale}`}
            className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-6 py-3 text-sm font-semibold text-white transition-colors hover:bg-[var(--accent-hover)]"
          >
            {t('ctaBrowse')}
            <ArrowRight className="h-4 w-4" />
          </Link>
          <a
            href="https://github.com/song-yechan/skill-directory"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-2 rounded-lg border border-[var(--border)] px-6 py-3 text-sm font-semibold text-[var(--text-secondary)] transition-colors hover:border-[var(--border-hover)] hover:text-[var(--text-primary)]"
          >
            <Github className="h-4 w-4" />
            {t('ctaGithub')}
          </a>
        </div>
      </section>
    </div>
  );
}
