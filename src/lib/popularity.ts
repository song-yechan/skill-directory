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

/** Weekly trending score: delta from last snapshot */
export function getTrendingScore(skill: {
  view_count: number;
  install_count: number;
  good_count: number;
  view_count_snapshot: number;
  install_count_snapshot: number;
  good_count_snapshot: number;
}): number {
  const viewDelta = skill.view_count - (skill.view_count_snapshot ?? 0);
  const installDelta = skill.install_count - (skill.install_count_snapshot ?? 0);
  const goodDelta = skill.good_count - (skill.good_count_snapshot ?? 0);
  return viewDelta + installDelta * 5 + goodDelta * 10;
}
