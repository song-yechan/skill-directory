'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface VoteButtonProps {
  readonly skillId: string;
  readonly goodCount: number;
  readonly badCount: number;
  readonly userVote: 'good' | 'bad' | null;
  readonly isLoggedIn: boolean;
}

export function VoteButton({
  skillId,
  goodCount,
  badCount,
  userVote: initialVote,
  isLoggedIn
}: VoteButtonProps) {
  const t = useTranslations('skill');
  const [vote, setVote] = useState(initialVote);
  const [counts, setCounts] = useState({ good: goodCount, bad: badCount });
  const [isPending, startTransition] = useTransition();

  const handleVote = (type: 'good' | 'bad') => {
    if (!isLoggedIn) return;

    startTransition(async () => {
      if (vote === type) {
        await fetch(`/api/skills/${skillId}/vote`, { method: 'DELETE' });
        setCounts((prev) => ({ ...prev, [type]: prev[type] - 1 }));
        setVote(null);
      } else {
        await fetch(`/api/skills/${skillId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: type })
        });
        setCounts((prev) => ({
          good: prev.good + (type === 'good' ? 1 : 0) - (vote === 'good' ? 1 : 0),
          bad: prev.bad + (type === 'bad' ? 1 : 0) - (vote === 'bad' ? 1 : 0)
        }));
        setVote(type);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('good')}
        disabled={isPending || !isLoggedIn}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          vote === 'good'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ThumbsUp className="h-4 w-4" />
        {t('good')} {counts.good}
      </button>
      <button
        onClick={() => handleVote('bad')}
        disabled={isPending || !isLoggedIn}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          vote === 'bad'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ThumbsDown className="h-4 w-4" />
        {t('bad')} {counts.bad}
      </button>
      {!isLoggedIn && (
        <span className="text-xs text-gray-400">{t('loginToVote')}</span>
      )}
    </div>
  );
}
