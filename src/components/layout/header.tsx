'use client';

import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { usePathname } from 'next/navigation';
import { useState } from 'react';
import { Menu, X } from 'lucide-react';
import { LocaleSwitcher } from './locale-switcher';
import { ThemeToggle } from './theme-toggle';
import { GoogleLoginButton } from '@/components/auth/google-login-button';

export function Header() {
  const t = useTranslations('common');
  const locale = useLocale();
  const pathname = usePathname();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navLinks = [
    { href: `/${locale}`, label: t('home'), exact: true },
    { href: `/${locale}/skills`, label: t('allSkills'), exact: false },
    { href: `/${locale}/discover`, label: t('discover'), exact: false },
    { href: `/${locale}/about`, label: t('about'), exact: false },
  ];

  return (
    <header className="sticky top-0 z-50 border-b border-[var(--border)] bg-[var(--bg-header)] backdrop-blur-lg">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6">
        <Link href={`/${locale}`} className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-[var(--accent)]">
            <span className="text-sm font-bold text-white">S</span>
          </div>
          <span className="text-base font-semibold tracking-tight text-[var(--text-primary)]">{t('siteName')}</span>
        </Link>

        {/* Desktop nav */}
        <nav className="hidden items-center gap-1 sm:flex sm:gap-3">
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
          <ThemeToggle />
          <LocaleSwitcher />
          <GoogleLoginButton />
        </nav>

        {/* Mobile controls */}
        <div className="flex items-center gap-2 sm:hidden">
          <ThemeToggle />
          <button
            onClick={() => setMobileOpen(!mobileOpen)}
            className="flex h-8 w-8 items-center justify-center rounded-lg text-[var(--text-secondary)] transition-colors hover:bg-[var(--bg-card)] cursor-pointer"
            aria-label="Toggle menu"
          >
            {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileOpen && (
        <div className="border-t border-[var(--border)] bg-[var(--bg-card)] px-4 py-4 sm:hidden">
          <nav className="flex flex-col gap-1">
            {navLinks.map(({ href, label, exact }) => {
              const isActive = exact
                ? pathname === href || pathname === `/${locale}`
                : pathname.startsWith(href);

              return (
                <Link
                  key={href}
                  href={href}
                  onClick={() => setMobileOpen(false)}
                  className={`rounded-lg px-3 py-2.5 text-sm transition-colors ${
                    isActive
                      ? 'bg-[var(--accent-light)] font-medium text-[var(--accent)]'
                      : 'text-[var(--text-secondary)] hover:bg-[var(--bg-card-hover)] hover:text-[var(--text-primary)]'
                  }`}
                >
                  {label}
                </Link>
              );
            })}
          </nav>
          <div className="mt-3 flex items-center gap-3 border-t border-[var(--border)] pt-3">
            <LocaleSwitcher />
            <GoogleLoginButton />
          </div>
        </div>
      )}
    </header>
  );
}
