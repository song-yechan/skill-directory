import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="mt-auto border-t border-[var(--border)]">
      <div className="mx-auto max-w-7xl px-4 py-8 text-center text-sm text-[var(--text-tertiary)] sm:px-6">
        <p>&copy; {new Date().getFullYear()} {t('siteName')}. Built for the Claude Code community.</p>
      </div>
    </footer>
  );
}
