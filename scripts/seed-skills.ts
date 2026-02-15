/**
 * Phase 1 Seed Script
 * Collects skills from:
 * 1. Anthropic official skills repo (anthropics/skills)
 * 2. GitHub topic search (claude-code-skills, claude-skills)
 * 3. Deduplicates and inserts into Supabase
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// ------- Get GH token (env var or gh CLI) -------

let GH_TOKEN = process.env.GITHUB_TOKEN ?? '';
if (!GH_TOKEN) {
  try {
    GH_TOKEN = execSync('gh auth token', { encoding: 'utf-8' }).trim();
  } catch {
    console.error('No GITHUB_TOKEN env var and gh CLI not available');
    process.exit(1);
  }
}

// ------- Load .env.local (skip in CI) -------

try {
  const envPath = resolve(import.meta.dirname ?? __dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match) {
      const [, key, value] = match;
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value.trim();
      }
    }
  }
} catch {
  // CI environment — env vars provided externally
}

// ------- Config -------

const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_SERVICE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const MIN_STARS = 1000;

const supabase = createClient(SUPABASE_URL, SUPABASE_SERVICE_KEY);

// ------- Types -------

interface GitHubRepo {
  readonly fullName: string;
  readonly name: string;
  readonly owner: string;
  readonly description: string;
  readonly stargazersCount: number;
  readonly url: string;
  readonly createdAt: string;
  readonly updatedAt: string;
  readonly topics: readonly string[];
}

interface SkillRow {
  readonly slug: string;
  readonly github_owner: string;
  readonly github_repo: string;
  readonly github_url: string;
  readonly stars: number;
  readonly forks: number;
  readonly last_github_update: string;
  readonly github_created_at: string | null;
  readonly name: string;
  readonly description_en: string | null;
  readonly description_ko: string | null;
  readonly summary_en: string | null;
  readonly summary_ko: string | null;
  readonly install_guide: string | null;
  readonly usage_guide: string | null;
  readonly examples: string | null;
  readonly readme_raw: string | null;
  readonly category_id: string;
  readonly tags: readonly string[];
}

// ------- GitHub fetch helper -------

async function ghFetch(path: string, accept?: string): Promise<Response> {
  const headers: Record<string, string> = {
    Authorization: `Bearer ${GH_TOKEN}`,
    Accept: accept ?? 'application/vnd.github+json',
  };
  return fetch(`https://api.github.com${path}`, { headers });
}

async function ghJson<T>(path: string): Promise<T | null> {
  const res = await ghFetch(path);
  if (!res.ok) {
    console.error(`    API error ${res.status}: ${path}`);
    return null;
  }
  return res.json();
}

async function ghText(path: string): Promise<string | null> {
  const res = await ghFetch(path, 'application/vnd.github.raw+json');
  if (!res.ok) return null;
  return res.text();
}

// ------- Category mapping -------

const CATEGORY_KEYWORDS: Record<string, readonly string[]> = {
  testing: ['test', 'testing', 'qa', 'playwright', 'jest', 'e2e', 'tdd', 'coverage', 'webapp-testing'],
  devops: ['deploy', 'ci', 'cd', 'docker', 'kubernetes', 'aws', 'terraform', 'cloudflare', 'infrastructure', 'devops', 'pipeline'],
  docs: ['doc', 'documentation', 'readme', 'markdown', 'writing', 'docx', 'pdf', 'pptx', 'xlsx', 'brand-guidelines', 'coauthoring'],
  productivity: ['workflow', 'productivity', 'automation', 'orchestration', 'planning', 'memory', 'context', 'manager', 'settings', 'pilot', 'research'],
  development: ['code', 'react', 'typescript', 'python', 'java', 'swift', 'frontend', 'backend', 'api', 'mcp', 'skill-creator', 'refactor', 'debug', 'git', 'linear', 'postgres', 'rails', 'spring'],
};

function guessCategory(name: string, description: string, topics: readonly string[]): string {
  const text = `${name} ${description} ${topics.join(' ')}`.toLowerCase();

  for (const [category, keywords] of Object.entries(CATEGORY_KEYWORDS)) {
    if (keywords.some((kw) => text.includes(kw))) {
      return category;
    }
  }
  return 'other';
}

function slugify(input: string): string {
  return input
    .toLowerCase()
    .replace(/[^a-z0-9-]/g, '-')
    .replace(/-+/g, '-')
    .replace(/^-|-$/g, '');
}

// ------- Collect from topics -------

interface SearchResult {
  readonly items: ReadonlyArray<{
    readonly full_name: string;
    readonly name: string;
    readonly owner: { readonly login: string };
    readonly stargazers_count: number;
    readonly description: string | null;
    readonly created_at: string;
    readonly updated_at: string;
    readonly topics: readonly string[];
    readonly html_url: string;
  }>;
}

async function collectFromGitHub(): Promise<Map<string, GitHubRepo>> {
  const repos = new Map<string, GitHubRepo>();

  // 1. Topic-based search (most reliable)
  const topicQueries = [
    'topic:claude-code-skills',
    'topic:claude-skills',
    'topic:claude-code-skill',
    'topic:claude-code',
  ];

  // 2. Keyword-based search (must combine "claude" with skill-related terms)
  const keywordQueries = [
    'claude+skill in:name,description',
    'claude+code+skill in:name,description',
    'claude-code in:name',
  ];

  const allQueries = [...topicQueries, ...keywordQueries];

  // Skip patterns - aggregators, unrelated repos
  const skipPatterns = ['awesome-', 'awesome_', 'curated', 'list-of'];

  // Strict filter: name or description must contain "claude"
  const REQUIRED_KEYWORD = 'claude';

  for (const query of allQueries) {
    console.log(`  Searching: ${query}`);
    const data = await ghJson<SearchResult>(
      `/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=100`
    );
    if (!data) continue;

    for (const item of data.items) {
      if (item.stargazers_count < MIN_STARS) continue;
      if (repos.has(item.full_name)) continue;

      // Skip awesome lists and aggregators
      const nameLower = item.name.toLowerCase();
      if (skipPatterns.some((p) => nameLower.startsWith(p))) continue;

      // Strict: name or description must contain "claude"
      const nameDesc = `${item.name} ${item.description ?? ''}`.toLowerCase();
      if (!nameDesc.includes(REQUIRED_KEYWORD)) continue;

      repos.set(item.full_name, {
        fullName: item.full_name,
        name: item.name,
        owner: item.owner.login,
        description: item.description ?? '',
        stargazersCount: item.stargazers_count,
        url: item.html_url,
        createdAt: item.created_at,
        updatedAt: item.updated_at,
        topics: item.topics ?? [],
      });
    }

    await sleep(2000); // Rate limit between searches
  }

  return repos;
}

// ------- Collect Anthropic official -------

async function collectAnthropicOfficial(): Promise<Map<string, GitHubRepo>> {
  const repos = new Map<string, GitHubRepo>();
  console.log('  Fetching anthropics/skills...');

  const contents = await ghJson<Array<{ name: string; type: string }>>(
    '/repos/anthropics/skills/contents/skills'
  );
  if (!contents) return repos;

  for (const entry of contents) {
    if (entry.type !== 'dir') continue;
    repos.set(`anthropics/skills/${entry.name}`, {
      fullName: 'anthropics/skills',
      name: entry.name,
      owner: 'anthropics',
      description: `Official Anthropic skill: ${entry.name}`,
      stargazersCount: 70000,
      url: `https://github.com/anthropics/skills/tree/main/skills/${entry.name}`,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      topics: ['official', 'anthropic'],
    });
  }

  return repos;
}

// ------- Parse SKILL.md frontmatter -------

interface Frontmatter {
  readonly name?: string;
  readonly description?: string;
}

function parseFrontmatter(content: string): Frontmatter {
  const match = content.match(/^---\s*\n([\s\S]*?)\n---/);
  if (!match) return {};

  const result: Record<string, string> = {};
  for (const line of match[1].split('\n')) {
    const kv = line.match(/^(\w+):\s*"?(.+?)"?\s*$/);
    if (kv) {
      result[kv[1]] = kv[2];
    }
  }
  return result as Frontmatter;
}

function extractSection(content: string, keyword: string): string | null {
  const regex = new RegExp(`^##\\s+.*${keyword}.*$`, 'im');
  const match = content.match(regex);
  if (!match || match.index === undefined) return null;

  const start = match.index + match[0].length;
  const nextHeading = content.slice(start).search(/^##\s/m);
  const section = nextHeading === -1
    ? content.slice(start).trim()
    : content.slice(start, start + nextHeading).trim();

  return section.slice(0, 2000) || null;
}

// ------- Build skill row -------

function buildSkillRow(repo: GitHubRepo, readme: string | null, skillMd: string | null, isOfficial: boolean): SkillRow {
  const frontmatter = skillMd ? parseFrontmatter(skillMd) : {};
  const titleCase = repo.name.replace(/[-_]/g, ' ').replace(/\b\w/g, (c) => c.toUpperCase());
  const name = frontmatter.name || titleCase;
  const description = frontmatter.description || repo.description || '';

  const category = guessCategory(repo.name, description, repo.topics);
  const tags = repo.topics
    .filter((t) =>
      !t.startsWith('claude') &&
      t !== 'ai' &&
      t !== 'agent' &&
      t !== 'official' &&
      t !== 'anthropic' &&
      t !== 'ai-agent' &&
      t !== 'llm'
    )
    .slice(0, 5);

  const slug = isOfficial
    ? `anthropic-${slugify(repo.name)}`
    : slugify(`${repo.owner}-${repo.name}`);

  return {
    slug,
    github_owner: repo.owner,
    github_repo: repo.name,
    github_url: repo.url,
    stars: repo.stargazersCount,
    forks: 0,
    last_github_update: repo.updatedAt,
    github_created_at: repo.createdAt,
    name,
    description_en: description,
    description_ko: null,
    summary_en: description.length > 100 ? `${description.slice(0, 97)}...` : description,
    summary_ko: null,
    install_guide: (skillMd ?? readme) ? extractSection(skillMd ?? readme!, 'install') : null,
    usage_guide: (skillMd ?? readme) ? extractSection(skillMd ?? readme!, 'usage') : null,
    examples: (skillMd ?? readme) ? extractSection(skillMd ?? readme!, 'example') : null,
    readme_raw: readme?.slice(0, 10000) || skillMd?.slice(0, 10000) || null,
    category_id: category,
    tags,
  };
}

// ------- Main -------

async function main() {
  console.log('=== Phase 1: Skill Seed ===\n');

  // 1. Collect from sources
  console.log('[1/4] Collecting from GitHub (topics + keywords)...');
  const topicRepos = await collectFromGitHub();
  console.log(`  Found ${topicRepos.size} repos from GitHub search\n`);

  console.log('[2/4] Collecting Anthropic official skills...');
  const officialSkills = await collectAnthropicOfficial();
  console.log(`  Found ${officialSkills.size} official skills\n`);

  // 2. Fetch READMEs and SKILL.md
  console.log('[3/4] Fetching READMEs and SKILL.md files...');
  const skills: SkillRow[] = [];
  const seenSlugs = new Set<string>();

  // Official skills
  for (const [key, repo] of officialSkills) {
    const skillName = key.split('/').pop()!;
    process.stdout.write(`  [official] ${skillName}...`);
    const skillMd = await ghText(`/repos/anthropics/skills/contents/skills/${skillName}/SKILL.md`);
    const row = buildSkillRow(repo, skillMd, skillMd, true);

    if (!seenSlugs.has(row.slug)) {
      seenSlugs.add(row.slug);
      skills.push(row);
      console.log(' OK');
    } else {
      console.log(' SKIP (dup)');
    }
    await sleep(300);
  }

  // Topic repos
  for (const [, repo] of topicRepos) {
    process.stdout.write(`  [topic] ${repo.fullName} (${repo.stargazersCount}★)...`);
    const readme = await ghText(`/repos/${repo.owner}/${repo.name}/readme`);

    // Try to find SKILL.md
    let skillMd = await ghText(`/repos/${repo.owner}/${repo.name}/contents/SKILL.md`);
    if (!skillMd) {
      // Try .claude/skills/ directory
      const skillsDir = await ghJson<Array<{ name: string }>>(`/repos/${repo.owner}/${repo.name}/contents/.claude/skills`);
      if (skillsDir && skillsDir.length > 0) {
        // Get first SKILL.md found
        for (const entry of skillsDir) {
          if (entry.name === 'SKILL.md') {
            skillMd = await ghText(`/repos/${repo.owner}/${repo.name}/contents/.claude/skills/SKILL.md`);
            break;
          }
        }
      }
    }

    const row = buildSkillRow(repo, readme, skillMd, false);

    if (!seenSlugs.has(row.slug)) {
      seenSlugs.add(row.slug);
      skills.push(row);
      console.log(' OK');
    } else {
      console.log(' SKIP (dup)');
    }
    await sleep(500);
  }

  console.log(`\n  Total skills to insert: ${skills.length}\n`);

  // 3. Insert / update into Supabase
  // For existing skills: only update GitHub metadata (don't overwrite enriched data)
  // For new skills: insert full row
  console.log('[4/4] Inserting into Supabase...');

  let inserted = 0;
  let updated = 0;
  let failed = 0;

  for (const skill of skills) {
    // Check if skill already exists
    const { data: existing } = await supabase
      .from('skills')
      .select('id, description_ko')
      .eq('slug', skill.slug)
      .single();

    if (existing) {
      // Update only metadata fields (preserve enriched content)
      const { error } = await supabase
        .from('skills')
        .update({
          stars: skill.stars,
          last_github_update: skill.last_github_update,
          github_created_at: skill.github_created_at,
          github_url: skill.github_url,
          readme_raw: skill.readme_raw,
        })
        .eq('id', existing.id);

      if (error) {
        console.error(`  FAIL (update): ${skill.slug} — ${error.message}`);
        failed++;
      } else {
        updated++;
      }
    } else {
      // New skill: insert full row
      const { error } = await supabase
        .from('skills')
        .insert({ ...skill, tags: [...skill.tags] });

      if (error) {
        console.error(`  FAIL (insert): ${skill.slug} — ${error.message}`);
        failed++;
      } else {
        inserted++;
      }
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  New: ${inserted}`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
  console.log(`  Total: ${skills.length}`);
}

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

main().catch(console.error);
