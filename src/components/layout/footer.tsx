import { useTranslations } from 'next-intl';

export function Footer() {
  const t = useTranslations('common');

  return (
    <footer className="border-t border-gray-200 bg-white">
      <div className="mx-auto max-w-7xl px-4 py-6 text-center text-sm text-gray-500">
        <p>&copy; {new Date().getFullYear()} {t('siteName')}</p>
      </div>
    </footer>
  );
}
