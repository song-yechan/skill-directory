/**
 * Search relevance scoring for skill search.
 *
 * Scoring weights:
 *   Name exact match:    100
 *   Name contains:        50
 *   Tag exact match:      40
 *   Tag partial match:    20
 *   Summary contains:     15
 *   Description contains:  5
 *   Popularity boost:     log10(stars) × 2
 */

interface SearchableSkill {
  readonly name: string;
  readonly name_ko?: string | null;
  readonly summary_en?: string | null;
  readonly summary_ko?: string | null;
  readonly description_en?: string | null;
  readonly description_ko?: string | null;
  readonly tags?: readonly string[];
  readonly stars?: number;
}

export function getSearchRelevance(skill: SearchableSkill, query: string): number {
  const q = query.toLowerCase();
  let score = 0;

  // Name match (highest priority)
  const nameLower = skill.name.toLowerCase();
  const nameKoLower = skill.name_ko?.toLowerCase();

  if (nameLower === q || nameKoLower === q) {
    score += 100;
  } else if (nameLower.includes(q) || (nameKoLower && nameKoLower.includes(q))) {
    score += 50;
  }

  // Tag match
  const hasExactTag = skill.tags?.some((tag) => tag.toLowerCase() === q);
  const hasPartialTag = skill.tags?.some((tag) => tag.toLowerCase().includes(q));

  if (hasExactTag) {
    score += 40;
  } else if (hasPartialTag) {
    score += 20;
  }

  // Summary match
  if (
    skill.summary_en?.toLowerCase().includes(q) ||
    skill.summary_ko?.toLowerCase().includes(q)
  ) {
    score += 15;
  }

  // Description match (lowest text weight)
  if (
    skill.description_en?.toLowerCase().includes(q) ||
    skill.description_ko?.toLowerCase().includes(q)
  ) {
    score += 5;
  }

  // Popularity boost for tie-breaking
  if (skill.stars && skill.stars > 0) {
    score += Math.log10(skill.stars) * 2;
  }

  return score;
}
