import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star, ThumbsUp, Download } from 'lucide-react';

interface SkillCardProps {
  readonly skill: {
    readonly slug: string;
    readonly name: string;
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
  const summary = locale === 'ko' ? skill.summary_ko : skill.summary_en;

  return (
    <Link
      href={`/${locale}/skills/${skill.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="text-lg font-semibold group-hover:text-blue-600">
        {skill.name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-2">
        {summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skill.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" /> {skill.stars}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" /> {skill.good_count}
        </span>
        <span className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5" /> {skill.install_count}
        </span>
      </div>
    </Link>
  );
}
