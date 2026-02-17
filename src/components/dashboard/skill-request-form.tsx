'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Send, CheckCircle, AlertCircle, Clock, Check, X } from 'lucide-react';

interface SkillRequest {
  readonly id: string;
  readonly github_url: string;
  readonly description: string | null;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly created_at: string;
}

interface SkillRequestFormProps {
  readonly initialRequests: readonly SkillRequest[];
}

export function SkillRequestForm({ initialRequests }: SkillRequestFormProps) {
  const t = useTranslations('dashboard');
  const [url, setUrl] = useState('');
  const [description, setDescription] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [result, setResult] = useState<'success' | 'error' | null>(null);
  const [requests, setRequests] = useState<readonly SkillRequest[]>(initialRequests);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setResult(null);

    try {
      const res = await fetch('/api/skill-requests', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          github_url: url.trim(),
          description: description.trim() || null,
        }),
      });

      if (res.ok) {
        setResult('success');
        setRequests((prev) => [{
          id: crypto.randomUUID(),
          github_url: url.trim(),
          description: description.trim() || null,
          status: 'pending' as const,
          created_at: new Date().toISOString(),
        }, ...prev]);
        setUrl('');
        setDescription('');
        setTimeout(() => setResult(null), 3000);
      } else {
        setResult('error');
      }
    } catch {
      setResult('error');
    } finally {
      setSubmitting(false);
    }
  };

  const statusIcon = {
    pending: <Clock className="h-3.5 w-3.5 text-amber-500" />,
    approved: <Check className="h-3.5 w-3.5 text-[var(--vote-good)]" />,
    rejected: <X className="h-3.5 w-3.5 text-[var(--vote-bad)]" />,
  };

  const statusClass = {
    pending: 'bg-amber-50 text-amber-700 dark:bg-amber-500/10 dark:text-amber-400',
    approved: 'bg-[var(--vote-good-bg)] text-[var(--vote-good)]',
    rejected: 'bg-[var(--vote-bad-bg)] text-[var(--vote-bad)]',
  };

  return (
    <div className="space-y-6">
      {/* Form */}
      <div className="rounded-xl border border-[var(--border)] bg-[var(--bg-card)] p-5">
        <h3 className="text-base font-semibold text-[var(--text-primary)]">{t('requestTitle')}</h3>
        <p className="mt-1 text-sm text-[var(--text-secondary)]">{t('requestDesc')}</p>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              {t('requestGithubUrl')}
            </label>
            <input
              type="url"
              required
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder={t('requestGithubUrlPlaceholder')}
              pattern="https://github\.com/.+/.+"
              className="w-full rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-tertiary)]"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs font-medium text-[var(--text-secondary)]">
              {t('requestDescription')}
            </label>
            <textarea
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              placeholder={t('requestDescriptionPlaceholder')}
              rows={2}
              className="w-full resize-none rounded-lg border border-[var(--border)] bg-[var(--bg-input)] px-3 py-2 text-sm text-[var(--text-primary)] outline-none transition-colors focus:border-[var(--accent)] placeholder:text-[var(--text-tertiary)]"
            />
          </div>
          <div className="flex items-center gap-3">
            <button
              type="submit"
              disabled={submitting}
              className="inline-flex items-center gap-2 rounded-lg bg-[var(--accent)] px-4 py-2 text-sm font-medium text-white transition-colors hover:bg-[var(--accent-hover)] disabled:opacity-50 cursor-pointer"
            >
              <Send className="h-3.5 w-3.5" />
              {submitting ? t('requestSubmitting') : t('requestSubmit')}
            </button>
            {result === 'success' && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--vote-good)]">
                <CheckCircle className="h-4 w-4" />
                {t('requestSuccess')}
              </span>
            )}
            {result === 'error' && (
              <span className="flex items-center gap-1.5 text-sm text-[var(--vote-bad)]">
                <AlertCircle className="h-4 w-4" />
                {t('requestError')}
              </span>
            )}
          </div>
        </form>
      </div>

      {/* Request history */}
      {requests.length > 0 && (
        <div>
          <h4 className="mb-3 text-sm font-medium text-[var(--text-primary)]">{t('myRequests')}</h4>
          <div className="space-y-2">
            {requests.map((req) => (
              <div
                key={req.id}
                className="flex items-center justify-between rounded-lg border border-[var(--border)] bg-[var(--bg-card)] px-4 py-3"
              >
                <div className="min-w-0 flex-1">
                  <p className="truncate text-sm text-[var(--text-primary)]">{req.github_url}</p>
                  {req.description && (
                    <p className="mt-0.5 truncate text-xs text-[var(--text-tertiary)]">{req.description}</p>
                  )}
                </div>
                <span className={`ml-3 inline-flex shrink-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-medium ${statusClass[req.status]}`}>
                  {statusIcon[req.status]}
                  {t(`requestStatus${req.status.charAt(0).toUpperCase()}${req.status.slice(1)}` as 'requestStatusPending' | 'requestStatusApproved' | 'requestStatusRejected')}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
