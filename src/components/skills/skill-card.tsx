'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star, ThumbsUp, Download } from 'lucide-react';
import { CATEGORY_LABELS } from '@/lib/constants';

interface SkillCardProps {
  readonly skill: {
    readonly slug: string;
    readonly name: string;
    readonly name_ko: string | null;
    readonly summary_ko: string | null;
    readonly summary_en: string | null;
    readonly stars: number;
    readonly good_count: number;
    readonly bad_count: number;
    readonly view_count: number;
    readonly install_count: number;
    readonly category_id: string;
    readonly tags: readonly string[];
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  const locale = useLocale();
  const t = useTranslations('categories');
  const summary = locale === 'ko' ? skill.summary_ko : skill.summary_en;
  const categoryLabel = CATEGORY_LABELS[skill.category_id]?.[locale as 'ko' | 'en'] ?? skill.category_id;

  return (
    <Link
      href={`/${locale}/skills/${skill.slug}`}
      className="group flex flex-col rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5 transition-all duration-200 hover:-translate-y-0.5 hover:border-[var(--border-hover)] hover:shadow-md"
    >
      <span className="text-xs font-medium text-[var(--text-tertiary)]">
        {categoryLabel}
      </span>

      <h3 className="mt-1.5 text-base font-semibold text-[var(--text-primary)] group-hover:text-[var(--accent)]">
        {locale === 'ko' ? skill.name_ko ?? skill.name : skill.name}
      </h3>

      <p className="mt-2 flex-1 text-sm leading-relaxed text-[var(--text-secondary)] line-clamp-2">
        {summary}
      </p>

      {skill.tags.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-1.5">
          {skill.tags.slice(0, 3).map((tag) => (
            <span
              key={tag}
              className="rounded-full bg-[var(--accent-light)] px-2.5 py-0.5 text-xs font-medium text-[var(--accent)]"
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-4 flex items-center gap-4 border-t border-dashed border-[var(--border)] pt-3 text-xs text-[var(--text-tertiary)]">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5 text-amber-500" />
          {skill.stars.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5 text-[var(--vote-good)]" />
          {skill.good_count.toLocaleString()}
        </span>
        <span className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5 text-[var(--accent)]" />
          {skill.install_count.toLocaleString()}
        </span>
      </div>
    </Link>
  );
}
