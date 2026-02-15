'use client';

import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface InstallCommandProps {
  readonly command: string;
}

export function InstallCommand({ command }: InstallCommandProps) {
  const t = useTranslations('skill');
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await navigator.clipboard.writeText(command);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
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
