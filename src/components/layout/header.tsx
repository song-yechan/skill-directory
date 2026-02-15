'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';
import { GitHubLoginButton } from '@/components/auth/github-login-button';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <header className="border-b border-gray-200 bg-white">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3">
        <Link href={`/${locale}`} className="text-xl font-bold text-gray-900">
          {t('siteName')}
        </Link>
        <div className="flex items-center gap-3">
          <Link
            href={`/${locale}/about`}
            className="text-sm text-gray-600 hover:text-gray-900"
          >
            {t('about')}
          </Link>
          <LocaleSwitcher />
          <GitHubLoginButton />
        </div>
      </div>
    </header>
  );
}
