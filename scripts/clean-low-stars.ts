/**
 * Delete skills with fewer than 1000 stars from the database.
 * Anthropic official skills are excluded from deletion.
 *
 * Usage: npx tsx scripts/clean-low-stars.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

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

const MIN_STARS = 1000;

async function main() {
  console.log(`=== Cleaning skills with < ${MIN_STARS} stars ===\n`);

  // First, count what will be deleted
  const { data: toDelete } = await supabase
    .from('skills')
    .select('slug, stars, github_owner')
    .lt('stars', MIN_STARS)
    .neq('github_owner', 'anthropics');

  if (!toDelete || toDelete.length === 0) {
    console.log('No skills to delete. All skills have >= 1000 stars or are official.');
    return;
  }

  console.log(`Skills to delete: ${toDelete.length}`);
  for (const s of toDelete) {
    console.log(`  ${s.slug} (${s.stars}★)`);
  }

  // Delete related votes first (FK constraint)
  const { data: skillIds } = await supabase
    .from('skills')
    .select('id')
    .lt('stars', MIN_STARS)
    .neq('github_owner', 'anthropics');

  if (skillIds) {
    const ids = skillIds.map((s) => s.id);

    const { error: voteErr } = await supabase
      .from('votes')
      .delete()
      .in('skill_id', ids);

    if (voteErr) console.error('Vote cleanup error:', voteErr.message);

    const { error: installErr } = await supabase
      .from('installs')
      .delete()
      .in('skill_id', ids);

    if (installErr) console.error('Install cleanup error:', installErr.message);
  }

  // Delete the skills
  const { error, count } = await supabase
    .from('skills')
    .delete({ count: 'exact' })
    .lt('stars', MIN_STARS)
    .neq('github_owner', 'anthropics');

  if (error) {
    console.error(`\nDelete failed: ${error.message}`);
  } else {
    console.log(`\nDeleted ${count} skills.`);
  }

  // Show remaining count
  const { count: remaining } = await supabase
    .from('skills')
    .select('*', { count: 'exact', head: true });

  console.log(`Remaining skills: ${remaining}`);
}

main().catch(console.error);
