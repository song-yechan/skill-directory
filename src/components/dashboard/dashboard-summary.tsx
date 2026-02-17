import { Download, ThumbsUp, Layers } from 'lucide-react';
import { useTranslations } from 'next-intl';
import { CATEGORY_LABELS } from '@/lib/constants';

interface DashboardSummaryProps {
  readonly installCount: number;
  readonly voteCount: number;
  readonly topCategory: string | null;
}

export function DashboardSummary({ installCount, voteCount, topCategory }: DashboardSummaryProps) {
  const t = useTranslations('dashboard');

  const cards = [
    {
      label: t('summaryInstalls'),
      value: installCount,
      icon: Download,
      color: 'text-[var(--accent)]',
      bg: 'bg-[var(--accent-light)]',
    },
    {
      label: t('summaryVotes'),
      value: voteCount,
      icon: ThumbsUp,
      color: 'text-[var(--vote-good)]',
      bg: 'bg-[var(--vote-good-bg)]',
    },
    {
      label: t('summaryTopCategory'),
      value: topCategory
        ? (CATEGORY_LABELS[topCategory]?.ko ?? topCategory)
        : t('noCategoryYet'),
      icon: Layers,
      color: 'text-amber-500',
      bg: 'bg-amber-50 dark:bg-amber-500/10',
      isText: true,
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
      {cards.map((card) => (
        <div
          key={card.label}
          className="flex items-center gap-4 rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5"
        >
          <div className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-lg ${card.bg}`}>
            <card.icon className={`h-5 w-5 ${card.color}`} />
          </div>
          <div>
            <p className="text-xs text-[var(--text-tertiary)]">{card.label}</p>
            <p className={`mt-0.5 font-semibold text-[var(--text-primary)] ${card.isText ? 'text-sm' : 'text-lg tabular-nums'}`}>
              {card.isText ? card.value : (card.value as number).toLocaleString()}
            </p>
          </div>
        </div>
      ))}
    </div>
  );
}
