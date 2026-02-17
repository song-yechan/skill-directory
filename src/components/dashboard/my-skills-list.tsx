'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star, ThumbsUp, Download, ArrowRight } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/constants';

interface InstalledSkill {
  readonly skill_id: string;
  readonly created_at: string;
  readonly name: string;
  readonly name_ko: string | null;
  readonly slug: string;
  readonly category_id: string;
  readonly tags: readonly string[];
  readonly good_count: number;
  readonly install_count: number;
  readonly stars: number;
}

interface VotedSkill {
  readonly skill_id: string;
  readonly vote_type: 'good' | 'bad';
  readonly slug: string;
}

interface MySkillsListProps {
  readonly installs: readonly InstalledSkill[];
  readonly votes: readonly VotedSkill[];
}

export function MySkillsList({ installs, votes }: MySkillsListProps) {
  const t = useTranslations('dashboard');
  const locale = useLocale();

  const votedMap = new Map(votes.map((v) => [v.skill_id, v.vote_type]));

  if (installs.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--bg-card)] p-8 text-center">
        <Download className="mx-auto h-8 w-8 text-[var(--text-tertiary)]" />
        <p className="mt-3 font-medium text-[var(--text-primary)]">{t('mySkillsEmpty')}</p>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('mySkillsEmptyDesc')}</p>
        <Link
          href={`/${locale}/skills`}
          className="mt-4 inline-flex items-center gap-1.5 text-sm font-medium text-[var(--accent)] hover:underline"
        >
          {t('browseSkills')}
          <ArrowRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-3">
      {installs.map((skill) => {
        const voteType = votedMap.get(skill.skill_id);
        const categoryLabel = CATEGORY_LABELS[skill.category_id]?.[locale as 'ko' | 'en'] ?? skill.category_id;

        return (
          <Link
            key={skill.skill_id}
            href={`/${locale}/skills/${skill.slug}`}
            className="flex items-center justify-between rounded-xl border border-[var(--border)] bg-[var(--bg-card)] px-5 py-4 transition-all hover:border-[var(--border-hover)] hover:shadow-sm"
          >
            <div className="min-w-0 flex-1">
              <div className="flex items-center gap-2">
                <h3 className="truncate text-sm font-semibold text-[var(--text-primary)]">
                  {locale === 'ko' ? skill.name_ko ?? skill.name : skill.name}
                </h3>
                {voteType && (
                  <span className={`inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-medium ${
                    voteType === 'good'
                      ? 'bg-[var(--vote-good-bg)] text-[var(--vote-good)]'
                      : 'bg-[var(--vote-bad-bg)] text-[var(--vote-bad)]'
                  }`}>
                    <ThumbsUp className={`h-3 w-3 ${voteType === 'bad' ? 'rotate-180' : ''}`} />
                    {t('voted')}
                  </span>
                )}
              </div>
              <div className="mt-1 flex items-center gap-3 text-xs text-[var(--text-tertiary)]">
                <span>{categoryLabel}</span>
                <span className="flex items-center gap-1">
                  <Star className="h-3 w-3 text-amber-500" />
                  {skill.stars.toLocaleString()}
                </span>
                <span className="flex items-center gap-1">
                  <Download className="h-3 w-3" />
                  {skill.install_count.toLocaleString()}
                </span>
              </div>
            </div>
            <div className="ml-4 shrink-0 text-xs text-[var(--text-tertiary)]">
              {new Date(skill.created_at).toLocaleDateString(locale === 'ko' ? 'ko-KR' : 'en-US', {
                month: 'short',
                day: 'numeric',
              })}
            </div>
          </Link>
        );
      })}
    </div>
  );
}
