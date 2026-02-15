/**
 * Apply enrichment data from batch JSON files to Supabase.
 * Reads /tmp/enriched-batch-{1,2,3}.json and updates each skill by slug.
 *
 * Usage: npx tsx scripts/apply-enrichment.ts
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

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'] as const;

interface EnrichedSkill {
  readonly name: string;
  readonly description_en: string;
  readonly description_ko: string;
  readonly summary_en: string;
  readonly summary_ko: string;
  readonly usage_guide: string;
  readonly category: string;
  readonly tags: readonly string[];
}

async function main() {
  console.log('=== Apply Enrichment to Supabase ===\n');

  // Read and merge all batch files
  const merged: Record<string, EnrichedSkill> = {};
  for (const i of [1, 2, 3]) {
    try {
      const raw = readFileSync(`/tmp/enriched-batch-${i}.json`, 'utf-8');
      const batch = JSON.parse(raw) as Record<string, EnrichedSkill>;
      Object.assign(merged, batch);
      console.log(`Batch ${i}: ${Object.keys(batch).length} skills loaded`);
    } catch (err) {
      console.error(`Failed to read batch ${i}: ${(err as Error).message}`);
    }
  }

  const slugs = Object.keys(merged);
  console.log(`\nTotal skills to update: ${slugs.length}\n`);

  let updated = 0;
  let failed = 0;

  for (const slug of slugs) {
    const skill = merged[slug];
    const category = CATEGORIES.includes(skill.category as typeof CATEGORIES[number])
      ? skill.category
      : undefined;
    const tags = Array.isArray(skill.tags) ? [...skill.tags] : [];

    process.stdout.write(`[${updated + failed + 1}/${slugs.length}] ${slug}...`);

    const { error } = await supabase
      .from('skills')
      .update({
        name: skill.name,
        description_en: skill.description_en,
        description_ko: skill.description_ko,
        summary_en: skill.summary_en,
        summary_ko: skill.summary_ko,
        usage_guide: skill.usage_guide,
        install_guide: null,
        examples: null,
        tags,
        ...(category ? { category_id: category } : {}),
      })
      .eq('slug', slug);

    if (error) {
      console.log(` FAIL: ${error.message}`);
      failed++;
    } else {
      console.log(' OK');
      updated++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Updated: ${updated}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
