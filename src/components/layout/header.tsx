'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { LocaleSwitcher } from './locale-switcher';
import { GitHubLoginButton } from '@/components/auth/github-login-button';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-base font-semibold tracking-tight">{t('siteName')}</span>
        </Link>
        <nav className="flex items-center gap-3">
          <Link
            href={`/${locale}/about`}
            className="hidden text-sm text-[var(--text-secondary)] transition-colors hover:text-[var(--text-primary)] sm:block"
          >
            {t('about')}
          </Link>
          <LocaleSwitcher />
          <GitHubLoginButton />
        </nav>
      </div>
    </header>
  );
}
