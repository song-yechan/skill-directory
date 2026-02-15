const GITHUB_API = 'https://api.github.com';

interface GitHubRepo {
  readonly full_name: string;
  readonly owner: { readonly login: string };
  readonly name: string;
  readonly html_url: string;
  readonly stargazers_count: number;
  readonly forks_count: number;
  readonly updated_at: string;
  readonly description: string | null;
}

const SEARCH_QUERIES = [
  'path:.claude/skills filename:SKILL.md',
  'path:.claude/skills filename:instructions.md',
  'topic:claude-code-skills',
  'topic:claude-skills',
  '"claude code" skill in:readme stars:>5',
];

export async function searchSkillRepos(token: string): Promise<GitHubRepo[]> {
  const allRepos = new Map<string, GitHubRepo>();

  for (const query of SEARCH_QUERIES) {
    const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=100`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) continue;

    const data = await res.json();
    for (const repo of data.items ?? []) {
      allRepos.set(repo.full_name, repo);
    }

    // Rate limit 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return Array.from(allRepos.values());
}

export async function fetchReadme(
  owner: string,
  repo: string,
  token: string
): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/readme`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.raw+json'
    }
  });

  if (!res.ok) return null;
  return res.text();
}
