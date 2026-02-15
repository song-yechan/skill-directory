'use client';

import { useState, useEffect, useTransition } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface VoteButtonProps {
  readonly skillId: string;
  readonly goodCount: number;
  readonly badCount: number;
}

const STORAGE_KEY = 'skill-votes';

function getStoredVote(skillId: string): 'good' | 'bad' | null {
  if (typeof window === 'undefined') return null;
  try {
    const votes = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    return votes[skillId] ?? null;
  } catch {
    return null;
  }
}

function setStoredVote(skillId: string, vote: 'good' | 'bad' | null) {
  try {
    const votes = JSON.parse(localStorage.getItem(STORAGE_KEY) ?? '{}');
    if (vote) {
      votes[skillId] = vote;
    } else {
      delete votes[skillId];
    }
    localStorage.setItem(STORAGE_KEY, JSON.stringify(votes));
  } catch {
    // localStorage unavailable
  }
}

export function VoteButton({ skillId, goodCount, badCount }: VoteButtonProps) {
  const t = useTranslations('skill');
  const [vote, setVote] = useState<'good' | 'bad' | null>(null);
  const [counts, setCounts] = useState({ good: goodCount, bad: badCount });
  const [isPending, startTransition] = useTransition();

  useEffect(() => {
    setVote(getStoredVote(skillId));
  }, [skillId]);

  const handleVote = (type: 'good' | 'bad') => {
    startTransition(async () => {
      if (vote === type) {
        // Remove vote
        await fetch(`/api/skills/${skillId}/vote`, {
          method: 'DELETE',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: type }),
        });
        setCounts((prev) => ({ ...prev, [type]: prev[type] - 1 }));
        setVote(null);
        setStoredVote(skillId, null);
      } else {
        // Add or change vote
        await fetch(`/api/skills/${skillId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: type, previous_vote: vote }),
        });
        setCounts((prev) => ({
          good: prev.good + (type === 'good' ? 1 : 0) - (vote === 'good' ? 1 : 0),
          bad: prev.bad + (type === 'bad' ? 1 : 0) - (vote === 'bad' ? 1 : 0),
        }));
        setVote(type);
        setStoredVote(skillId, type);
      }
    });
  };

  const total = counts.good + counts.bad;
  const goodPercent = total > 0 ? Math.round((counts.good / total) * 100) : 0;

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        <button
          onClick={() => handleVote('good')}
          disabled={isPending}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            vote === 'good'
              ? 'bg-[var(--vote-good-bg)] text-[var(--vote-good)] ring-1 ring-[var(--vote-good)]'
              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--vote-good-bg)] hover:text-[var(--vote-good)]'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ThumbsUp className="h-4 w-4" />
          {t('good')}
          <span className="ml-0.5 tabular-nums">{counts.good.toLocaleString()}</span>
        </button>
        <button
          onClick={() => handleVote('bad')}
          disabled={isPending}
          className={`flex items-center gap-1.5 rounded-lg px-4 py-2.5 text-sm font-medium transition-colors ${
            vote === 'bad'
              ? 'bg-[var(--vote-bad-bg)] text-[var(--vote-bad)] ring-1 ring-[var(--vote-bad)]'
              : 'bg-[var(--bg-primary)] text-[var(--text-secondary)] hover:bg-[var(--vote-bad-bg)] hover:text-[var(--vote-bad)]'
          } disabled:cursor-not-allowed disabled:opacity-50`}
        >
          <ThumbsDown className="h-4 w-4" />
          {t('bad')}
          <span className="ml-0.5 tabular-nums">{counts.bad.toLocaleString()}</span>
        </button>
      </div>

      {total > 0 && (
        <div className="flex items-center gap-2">
          <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-[var(--bg-primary)]">
            <div
              className="h-full rounded-full bg-[var(--vote-good)] transition-all"
              style={{ width: `${goodPercent}%` }}
            />
          </div>
          <span className="text-xs tabular-nums text-[var(--text-tertiary)]">
            {goodPercent}%
          </span>
        </div>
      )}
    </div>
  );
}
