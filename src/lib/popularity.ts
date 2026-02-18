/** Composite popularity score: stars baseline + user signals */
export function getPopularityScore(skill: {
  stars: number;
  view_count: number;
  install_count: number;
  good_count: number;
  bad_count: number;
}): number {
  return (
    skill.stars * 0.01 +
    skill.view_count * 1 +
    skill.install_count * 5 +
    skill.good_count * 10 -
    skill.bad_count * 10
  );
}

/** Trending cutoff: only skills created within this many days are eligible */
export const TRENDING_CUTOFF_DAYS = 60;

/** Check if a skill is eligible for trending (created within cutoff) */
export function isTrendingEligible(skill: { created_at?: string }): boolean {
  if (!skill.created_at) return false;
  const daysSince = (Date.now() - new Date(skill.created_at).getTime()) / 86_400_000;
  return daysSince <= TRENDING_CUTOFF_DAYS;
}

/** Weekly trending score: delta from last snapshot × recency boost */
export function getTrendingScore(skill: {
  view_count: number;
  install_count: number;
  good_count: number;
  view_count_snapshot: number;
  install_count_snapshot: number;
  good_count_snapshot: number;
  created_at?: string;
}): number {
  const viewDelta = skill.view_count - (skill.view_count_snapshot ?? 0);
  const installDelta = skill.install_count - (skill.install_count_snapshot ?? 0);
  const goodDelta = skill.good_count - (skill.good_count_snapshot ?? 0);
  const delta = viewDelta + installDelta * 5 + goodDelta * 10;

  // Recency boost: 1일=31x, 7일=5.3x, 30일=2x, 90일=1.3x
  if (skill.created_at) {
    const daysSince = Math.max((Date.now() - new Date(skill.created_at).getTime()) / 86_400_000, 1);
    return delta * (1 + 30 / daysSince);
  }
  return delta;
}
