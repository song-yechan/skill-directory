'use client';

import { useLocale } from 'next-intl';
import { usePathname, useRouter } from 'next/navigation';

export function LocaleSwitcher() {
  const locale = useLocale();
  const pathname = usePathname();
  const router = useRouter();

  const switchLocale = (newLocale: string) => {
    const newPath = pathname.replace(`/${locale}`, `/${newLocale}`);
    router.push(newPath);
  };

  return (
    <button
      onClick={() => switchLocale(locale === 'ko' ? 'en' : 'ko')}
      className="rounded-lg border border-gray-300 px-3 py-1.5 text-sm text-gray-600 hover:bg-gray-50"
    >
      {locale === 'ko' ? 'EN' : '한국어'}
    </button>
  );
}
