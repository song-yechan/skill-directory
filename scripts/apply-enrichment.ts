/**
 * Apply enrichment data from a JSON file to the database.
 * Usage: npx tsx scripts/apply-enrichment.ts /tmp/enrichment-batch-1.json
 *
 * JSON format (array):
 * [{ id, name?, description_ko?, description_en?, summary_ko?, summary_en?,
 *    usage_guide?, usage_guide_en?, category_id?, tags? }]
 */
import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const envPath = resolve(import.meta.dirname ?? __dirname, '..', '.env.local');
const envContent = readFileSync(envPath, 'utf-8');
const env: Record<string, string> = {};
for (const line of envContent.split('\n')) {
  const m = line.match(/^([^#=]+)=(.*)$/);
  if (m && !process.env[m[1].trim()]) {
    process.env[m[1].trim()] = m[2].trim();
  }
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

const VALID_CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'];

interface EnrichmentItem {
  readonly id: string;
  readonly name?: string;
  readonly description_ko?: string;
  readonly description_en?: string;
  readonly summary_ko?: string;
  readonly summary_en?: string;
  readonly usage_guide?: string;
  readonly usage_guide_en?: string;
  readonly category_id?: string;
  readonly tags?: readonly string[];
}

async function main() {
  const jsonPath = process.argv[2];
  if (!jsonPath) {
    console.error('Usage: npx tsx scripts/apply-enrichment.ts <json-path>');
    process.exit(1);
  }

  const items: readonly EnrichmentItem[] = JSON.parse(readFileSync(jsonPath, 'utf-8'));
  console.log(`Applying enrichment for ${items.length} skills...`);

  let success = 0;
  let failed = 0;

  for (const item of items) {
    const update: Record<string, unknown> = {};

    if (item.name) update.name = item.name;
    if (item.description_ko) update.description_ko = item.description_ko;
    if (item.description_en) update.description_en = item.description_en;
    if (item.summary_ko) update.summary_ko = item.summary_ko;
    if (item.summary_en) update.summary_en = item.summary_en;
    if (item.usage_guide) update.usage_guide = item.usage_guide;
    if (item.usage_guide_en) update.usage_guide_en = item.usage_guide_en;
    if (item.category_id && VALID_CATEGORIES.includes(item.category_id)) {
      update.category_id = item.category_id;
    }
    if (item.tags && Array.isArray(item.tags)) {
      update.tags = [...item.tags];
    }

    if (Object.keys(update).length === 0) {
      console.log(`  SKIP: ${item.id} (no fields)`);
      continue;
    }

    const { error } = await supabase
      .from('skills')
      .update(update)
      .eq('id', item.id);

    if (error) {
      console.log(`  FAIL: ${item.id} — ${error.message}`);
      failed++;
    } else {
      console.log(`  OK: ${item.id}`);
      success++;
    }
  }

  console.log(`\nDone: ${success} success, ${failed} failed`);
}

main().catch(console.error);
