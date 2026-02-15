'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

const SUGGESTED_TAGS = [
  'test-automation', 'code-review', 'commit', 'security',
  'documentation', 'refactoring', 'deployment', 'debugging'
];

export function SkillSearch() {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">{t('suggestedTags')}</span>
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleSearch(tag)}
            className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
