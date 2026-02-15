'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InstallCommandProps {
  readonly command: string;
  readonly skillId: string;
}

const INSTALL_STORAGE_KEY = 'skill-installs';

function hasTrackedInstall(skillId: string): boolean {
  if (typeof window === 'undefined') return false;
  try {
    const installs = JSON.parse(localStorage.getItem(INSTALL_STORAGE_KEY) ?? '{}');
    return !!installs[skillId];
  } catch {
    return false;
  }
}

function markInstallTracked(skillId: string) {
  try {
    const installs = JSON.parse(localStorage.getItem(INSTALL_STORAGE_KEY) ?? '{}');
    installs[skillId] = Date.now();
    localStorage.setItem(INSTALL_STORAGE_KEY, JSON.stringify(installs));
  } catch {
    // localStorage unavailable
  }
}

export function InstallCommand({ command, skillId }: InstallCommandProps) {
  const t = useTranslations('skill');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);

    // Track install once per skill per browser
    if (!hasTrackedInstall(skillId)) {
      markInstallTracked(skillId);
      fetch(`/api/skills/${skillId}/install`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ source: 'web' }),
      }).catch(() => {});
    }
  };

  return (
    <div className="group relative overflow-hidden rounded-lg bg-[var(--bg-code)]">
      <div className="flex items-center justify-between px-4 py-3">
        <code className="text-sm text-[var(--text-code)]">
          <span className="select-none text-[var(--text-tertiary)]">$ </span>
          {command}
        </code>
        <button
          onClick={handleCopy}
          className="ml-3 shrink-0 rounded-md p-1.5 text-[var(--text-tertiary)] transition-colors hover:bg-white/10 hover:text-white"
          aria-label="Copy command"
        >
          {copied ? (
            <Check className="h-4 w-4 text-[var(--accent-green)]" />
          ) : (
            <Copy className="h-4 w-4" />
          )}
        </button>
      </div>
    </div>
  );
}
