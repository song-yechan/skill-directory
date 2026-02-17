'use client';

import { useTranslations } from 'next-intl';
import { DashboardSummary } from './dashboard-summary';
import { MySkillsList } from './my-skills-list';
import { UsagePattern } from './usage-pattern';
import { SkillRequestForm } from './skill-request-form';

interface InstalledSkill {
  readonly skill_id: string;
  readonly created_at: string;
  readonly name: string;
  readonly name_ko: string | null;
  readonly slug: string;
  readonly category_id: string;
  readonly tags: readonly string[];
  readonly good_count: number;
  readonly install_count: number;
  readonly stars: number;
}

interface VotedSkill {
  readonly skill_id: string;
  readonly vote_type: 'good' | 'bad';
  readonly name: string;
  readonly name_ko: string | null;
  readonly slug: string;
}

interface SkillRequest {
  readonly id: string;
  readonly github_url: string;
  readonly description: string | null;
  readonly status: 'pending' | 'approved' | 'rejected';
  readonly created_at: string;
}

interface DashboardContentProps {
  readonly installs: readonly InstalledSkill[];
  readonly votes: readonly VotedSkill[];
  readonly requests: readonly SkillRequest[];
}

export function DashboardContent({ installs, votes, requests }: DashboardContentProps) {
  const t = useTranslations('dashboard');

  // Compute top category
  const categoryCounts: Record<string, number> = {};
  for (const skill of installs) {
    const cat = skill.category_id ?? 'other';
    categoryCounts[cat] = (categoryCounts[cat] ?? 0) + 1;
  }
  const topCategory = Object.entries(categoryCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] ?? null;

  return (
    <div className="space-y-8">
      <DashboardSummary
        installCount={installs.length}
        voteCount={votes.length}
        topCategory={topCategory}
      />

      <section>
        <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          {t('mySkills')}
        </h3>
        <MySkillsList installs={installs} votes={votes} />
      </section>

      <section>
        <h3 className="mb-4 text-lg font-semibold text-[var(--text-primary)]">
          {t('usagePattern')}
        </h3>
        <UsagePattern installs={installs} />
      </section>

      <section>
        <SkillRequestForm initialRequests={requests} />
      </section>
    </div>
  );
}
