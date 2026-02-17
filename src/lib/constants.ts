export const CATEGORY_LABELS: Record<string, { ko: string; en: string }> = {
  development: { ko: '개발', en: 'Development' },
  testing: { ko: '테스트 & QA', en: 'Testing & QA' },
  devops: { ko: 'DevOps & 인프라', en: 'DevOps & Infra' },
  productivity: { ko: '생산성', en: 'Productivity' },
  docs: { ko: '문서화', en: 'Documentation' },
  other: { ko: '기타', en: 'Other' },
};

export const CATEGORY_COLORS: Record<string, string> = {
  development: 'bg-blue-500',
  testing: 'bg-emerald-500',
  devops: 'bg-orange-500',
  productivity: 'bg-violet-500',
  docs: 'bg-amber-500',
  other: 'bg-slate-400',
};
