import { getTranslations } from 'next-intl/server';

export default async function AboutPage() {
  const t = await getTranslations('about');

  return (
    <div className="mx-auto max-w-2xl space-y-6">
      <h1 className="text-3xl font-bold">{t('title')}</h1>
      <p className="text-lg text-gray-600">{t('description')}</p>
    </div>
  );
}
