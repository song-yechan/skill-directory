/**
 * Enrich skills with AI-generated structured descriptions.
 * Uses Claude API to analyze README and generate:
 * - description_en/ko, summary_en/ko
 * - install_guide, usage_guide, examples
 * - category, tags
 *
 * Usage: npx tsx scripts/enrich-skills.ts
 * Requires ANTHROPIC_API_KEY in .env.local
 */

import Anthropic from '@anthropic-ai/sdk';
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
const envPath = resolve(import.meta.dirname ?? __dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
for (const line of envContent.split('\n')) {
  const match = line.match(/^([^#=]+)=(.*)$/);
  if (match && !process.env[match[1].trim()]) {
    process.env[match[1].trim()] = match[2].trim();
  }
}

const ANTHROPIC_API_KEY = process.env.ANTHROPIC_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!ANTHROPIC_API_KEY || ANTHROPIC_API_KEY.includes('<')) {
  console.error('ERROR: ANTHROPIC_API_KEY is not set in .env.local');
  console.error('Add your API key: ANTHROPIC_API_KEY=sk-ant-...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);
const anthropic = new Anthropic({ apiKey: ANTHROPIC_API_KEY });

const CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'];

interface EnrichedData {
  readonly name: string;
  readonly description_en: string;
  readonly description_ko: string;
  readonly summary_en: string;
  readonly summary_ko: string;
  readonly install_guide: string;
  readonly usage_guide: string;
  readonly examples: string;
  readonly category: string;
  readonly tags: readonly string[];
}

async function enrichSkill(readme: string, currentName: string): Promise<EnrichedData | null> {
  try {
    const response = await anthropic.messages.create({
      model: 'claude-sonnet-4-5-20250929',
      max_tokens: 2500,
      messages: [
        {
          role: 'user',
          content: `You are analyzing a Claude Code skill. Based on the README below, generate structured documentation that helps beginners understand and use this skill.

Current skill name: "${currentName}"

README:
${readme.slice(0, 8000)}

Return a JSON object with these fields:
- name: human-readable skill name (keep "${currentName}" if it's already good, otherwise improve it)
- description_en: 2-3 sentence description in English explaining what this skill does and why someone would use it
- description_ko: same description translated to Korean
- summary_en: one-line summary in English (max 80 chars)
- summary_ko: same summary in Korean
- install_guide: clear step-by-step installation instructions in markdown. Include the actual commands. If the skill is installed via \`claude skill install\`, mention that.
- usage_guide: practical usage instructions in markdown. Explain how to trigger and use the skill with concrete examples. Include slash commands if applicable.
- examples: 2-3 concrete usage examples in markdown showing input/output or before/after scenarios
- category: one of ${JSON.stringify(CATEGORIES)} (pick the most fitting)
- tags: 3-5 relevant lowercase kebab-case tags

IMPORTANT:
- Write install_guide, usage_guide, examples as if explaining to someone who has never used Claude Code skills before
- Be specific and actionable, not vague
- Use markdown formatting (headers, code blocks, lists)
- Return ONLY valid JSON, no markdown fences`
        }
      ]
    });

    const text = response.content[0].type === 'text' ? response.content[0].text : '';
    return JSON.parse(text);
  } catch (err) {
    console.error(`  AI extraction failed: ${(err as Error).message}`);
    return null;
  }
}

async function main() {
  console.log('=== Skill Enrichment with AI ===\n');

  // Fetch all skills that need enrichment
  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, slug, name, readme_raw, install_guide, usage_guide, examples, description_en')
    .order('stars', { ascending: false });

  if (error || !skills) {
    console.error('Failed to fetch skills:', error?.message);
    process.exit(1);
  }

  // Filter to skills that need enrichment (missing structured content)
  const needsEnrichment = skills.filter(
    (s) => !s.usage_guide || !s.examples || !s.install_guide
  );

  console.log(`Total skills: ${skills.length}`);
  console.log(`Need enrichment: ${needsEnrichment.length}\n`);

  let enriched = 0;
  let failed = 0;

  for (const skill of needsEnrichment) {
    const content = skill.readme_raw ?? skill.description_en ?? '';
    if (!content || content.length < 50) {
      console.log(`SKIP: ${skill.slug} (no README content)`);
      failed++;
      continue;
    }

    process.stdout.write(`[${enriched + failed + 1}/${needsEnrichment.length}] ${skill.slug}...`);

    const result = await enrichSkill(content, skill.name);
    if (!result) {
      failed++;
      console.log(' FAIL');
      continue;
    }

    const category = CATEGORIES.includes(result.category) ? result.category : undefined;

    const { error: updateError } = await supabase
      .from('skills')
      .update({
        description_en: result.description_en,
        description_ko: result.description_ko,
        summary_en: result.summary_en,
        summary_ko: result.summary_ko,
        install_guide: result.install_guide,
        usage_guide: result.usage_guide,
        examples: result.examples,
        tags: [...result.tags],
        ...(category ? { category_id: category } : {}),
      })
      .eq('id', skill.id);

    if (updateError) {
      console.log(` DB ERROR: ${updateError.message}`);
      failed++;
    } else {
      console.log(' OK');
      enriched++;
    }

    // Rate limit: ~1 req/sec to avoid throttling
    await new Promise((r) => setTimeout(r, 1500));
  }

  console.log(`\n=== Done ===`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
