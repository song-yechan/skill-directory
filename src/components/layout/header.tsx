'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { LocaleSwitcher } from './locale-switcher';
import { GitHubLoginButton } from '@/components/auth/github-login-button';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();

  const navLinks = [
    { href: `/${locale}`, label: t('home'), exact: true },
    { href: `/${locale}/skills`, label: t('allSkills'), exact: false },
    { href: `/${locale}/discover`, label: t('discover'), exact: false },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-white/80 backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-base font-semibold tracking-tight">{t('siteName')}</span>
        </Link>
        <nav className="flex items-center gap-1 sm:gap-3">
          {navLinks.map(({ href, label, exact }) => {
            const isActive = exact
              ? pathname === href || pathname === `/${locale}`
              : pathname.startsWith(href);

            return (
              <Link
                key={href}
                href={href}
                className={`rounded-md px-2.5 py-1.5 text-sm transition-colors ${
                  isActive
                    ? 'font-medium text-[var(--accent)]'
                    : 'text-[var(--text-secondary)] hover:text-[var(--text-primary)]'
                }`}
              >
                {label}
              </Link>
            );
          })}
          <div className="mx-1 h-4 w-px bg-[var(--border)] sm:mx-2" />
          <LocaleSwitcher />
          <GitHubLoginButton />
        </nav>
      </div>
    </header>
  );
}
