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
