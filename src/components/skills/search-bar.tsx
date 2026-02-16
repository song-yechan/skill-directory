'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

export function SearchBarClient() {
  const t = useTranslations('allSkills');
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
    <div className="relative">
      <Search className="absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--text-tertiary)]" />
      <input
        type="text"
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
        placeholder={t('searchPlaceholder')}
        className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] py-2.5 pl-10 pr-4 text-sm text-[var(--text-primary)] placeholder:text-[var(--text-tertiary)] focus:border-[var(--accent)] focus:outline-none focus:ring-1 focus:ring-[var(--accent)]"
      />
    </div>
  );
}
