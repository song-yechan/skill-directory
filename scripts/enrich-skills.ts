/**
 * Enrich skills with AI-generated structured descriptions.
 * Uses Groq API (Llama 3.3 70B) to analyze README and generate:
 * - description_en/ko, summary_en/ko
 * - install_guide, usage_guide, examples
 * - category, tags
 *
 * Usage: npx tsx scripts/enrich-skills.ts
 * Requires GROQ_API_KEY in .env.local
 */

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

const GROQ_API_KEY = process.env.GROQ_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!GROQ_API_KEY || GROQ_API_KEY.includes('<')) {
  console.error('ERROR: GROQ_API_KEY is not set in .env.local');
  console.error('Get a free key at https://console.groq.com/keys');
  console.error('Add to .env.local: GROQ_API_KEY=gsk_...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

// llama-3.1-8b-instant has 131k TPM (vs 12k for 70B) — much faster for batch
const GROQ_MODEL = 'llama-3.1-8b-instant';
const GROQ_URL = 'https://api.groq.com/openai/v1/chat/completions';
const CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'];
const MAX_RETRIES = 3;

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

async function callGroq(readme: string, currentName: string): Promise<EnrichedData | null> {
  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(GROQ_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${GROQ_API_KEY}`,
        },
        body: JSON.stringify({
          model: GROQ_MODEL,
          messages: [
            {
              role: 'system',
              content: 'You are a technical documentation expert. Always respond with valid JSON only, no markdown fences or extra text.'
            },
            {
              role: 'user',
              content: `Analyze this Claude Code skill README and generate structured documentation for beginners.

Current skill name: "${currentName}"

README:
${readme.slice(0, 4000)}

Return a JSON object with these fields:
- name: human-readable skill name (keep "${currentName}" if already good)
- description_en: 2-3 sentence description in English explaining what this skill does and why someone would use it
- description_ko: same description translated to Korean (natural Korean, not machine translation)
- summary_en: one-line summary in English (max 80 chars)
- summary_ko: same summary in Korean
- install_guide: clear step-by-step installation in markdown with actual commands
- usage_guide: practical usage instructions in markdown with concrete examples
- examples: 2-3 usage examples in markdown showing input/output
- category: one of ${JSON.stringify(CATEGORIES)}
- tags: 3-5 relevant lowercase kebab-case tags

IMPORTANT: Return ONLY valid JSON.`
            }
          ],
          temperature: 0.3,
          max_tokens: 2500,
          response_format: { type: 'json_object' },
        }),
      });

      if (res.status === 429) {
        const wait = Math.pow(2, attempt + 1) * 10_000; // 20s, 40s, 80s
        process.stdout.write(` (rate limit, waiting ${wait / 1000}s)`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`  Groq API ${res.status}: ${errText.slice(0, 150)}`);
        return null;
      }

      const data = await res.json();
      const text = data.choices?.[0]?.message?.content ?? '';
      return JSON.parse(text);
    } catch (err) {
      console.error(`  AI extraction failed: ${(err as Error).message}`);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 5000));
        continue;
      }
      return null;
    }
  }
  return null;
}

async function main() {
  console.log('=== Skill Enrichment with Groq (Llama 3.3 70B) ===\n');

  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, slug, name, readme_raw, install_guide, usage_guide, examples, description_en')
    .order('stars', { ascending: false });

  if (error || !skills) {
    console.error('Failed to fetch skills:', error?.message);
    process.exit(1);
  }

  // Only enrich skills missing structured content
  const needsEnrichment = skills.filter(
    (s) => !s.usage_guide || !s.examples || !s.install_guide
  );
  console.log(`Total skills: ${skills.length}`);
  console.log(`Need enrichment: ${needsEnrichment.length}\n`);
  const skillsToProcess = needsEnrichment;

  let enriched = 0;
  let failed = 0;

  for (const skill of skillsToProcess) {
    const content = skill.readme_raw ?? skill.description_en ?? '';
    if (!content || content.length < 50) {
      console.log(`SKIP: ${skill.slug} (no README content)`);
      failed++;
      continue;
    }

    process.stdout.write(`[${enriched + failed + 1}/${skillsToProcess.length}] ${skill.slug}...`);

    const result = await callGroq(content, skill.name);
    if (!result) {
      failed++;
      console.log(' FAIL');
      continue;
    }

    const category = CATEGORIES.includes(result.category) ? result.category : undefined;
    const tags = Array.isArray(result.tags) ? [...result.tags] : [];

    const { error: updateError } = await supabase
      .from('skills')
      .update({
        description_en: result.description_en ?? null,
        description_ko: result.description_ko ?? null,
        summary_en: result.summary_en ?? null,
        summary_ko: result.summary_ko ?? null,
        install_guide: result.install_guide ?? null,
        usage_guide: result.usage_guide ?? null,
        examples: result.examples ?? null,
        tags,
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

    // 8b-instant has 131k TPM — 1s delay is enough
    await new Promise((r) => setTimeout(r, 1000));
  }

  console.log(`\n=== Done ===`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
