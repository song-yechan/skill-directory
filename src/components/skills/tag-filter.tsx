'use client';

import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Tag, X } from 'lucide-react';
import { useState } from 'react';

interface TagFilterProps {
  readonly tags: readonly string[];
}

export function TagFilter({ tags }: TagFilterProps) {
  const t = useTranslations('allSkills');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const activeTag = searchParams.get('tag') ?? '';
  const [showAll, setShowAll] = useState(false);

  const visibleTags = showAll ? tags : tags.slice(0, 15);

  const selectTag = (tag: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (tag === activeTag) {
      params.delete('tag');
    } else {
      params.set('tag', tag);
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  const clearTag = () => {
    const params = new URLSearchParams(searchParams.toString());
    params.delete('tag');
    router.push(`${pathname}?${params.toString()}`);
  };

  if (tags.length === 0) return null;

  return (
    <div className="space-y-2">
      <div className="flex items-center gap-2">
        <Tag className="h-3.5 w-3.5 text-[var(--text-tertiary)]" />
        <span className="text-xs font-medium text-[var(--text-tertiary)]">{t('filterByTag')}</span>
        {activeTag && (
          <button
            onClick={clearTag}
            className="inline-flex items-center gap-1 rounded-full bg-[var(--accent)] px-2 py-0.5 text-xs font-medium text-white"
          >
            {activeTag}
            <X className="h-3 w-3" />
          </button>
        )}
      </div>
      <div className="flex flex-wrap gap-1.5">
        {visibleTags.map((tag) => (
          <button
            key={tag}
            onClick={() => selectTag(tag)}
            className={`rounded-full px-2.5 py-1 text-xs font-medium transition-colors ${
              tag === activeTag
                ? 'bg-[var(--accent)] text-white'
                : 'bg-[var(--accent-light)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-white'
            }`}
          >
            {tag}
          </button>
        ))}
        {tags.length > 15 && (
          <button
            onClick={() => setShowAll(!showAll)}
            className="rounded-full border border-dashed border-[var(--border)] px-2.5 py-1 text-xs text-[var(--text-tertiary)] hover:border-[var(--accent)] hover:text-[var(--accent)]"
          >
            {showAll ? t('showLess') : t('showMore', { count: tags.length - 15 })}
          </button>
        )}
      </div>
    </div>
  );
}
