/**
 * Add snapshot columns for trending calculation.
 * Run once: npx tsx scripts/migrate-snapshots.ts
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local
try {
  const envPath = resolve(import.meta.dirname ?? __dirname, '..', '.env.local');
  const envContent = readFileSync(envPath, 'utf-8');
  for (const line of envContent.split('\n')) {
    const match = line.match(/^([^#=]+)=(.*)$/);
    if (match && !process.env[match[1].trim()]) {
      process.env[match[1].trim()] = match[2].trim();
    }
  }
} catch {
  // CI
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  console.log('Adding snapshot columns...');

  // We can't run raw SQL via PostgREST, so we use the
  // Supabase approach: update all rows to set default snapshot values.
  // The columns need to be added via Supabase Dashboard SQL Editor:
  //
  // ALTER TABLE skills
  //   ADD COLUMN IF NOT EXISTS view_count_snapshot integer DEFAULT 0,
  //   ADD COLUMN IF NOT EXISTS install_count_snapshot integer DEFAULT 0,
  //   ADD COLUMN IF NOT EXISTS good_count_snapshot integer DEFAULT 0;

  // For now, check if columns exist by trying to read them
  const { data, error } = await supabase
    .from('skills')
    .select('id, view_count_snapshot')
    .limit(1);

  if (error) {
    console.log('\nColumns do not exist yet. Run this SQL in Supabase Dashboard → SQL Editor:\n');
    console.log(`ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS view_count_snapshot integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS install_count_snapshot integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS good_count_snapshot integer DEFAULT 0;`);
    console.log('\nThen run this script again to initialize snapshots.');
    return;
  }

  console.log('Columns exist. Initializing snapshots with current values...');

  // Set snapshot = current values (so first week delta starts from 0)
  const { data: skills } = await supabase
    .from('skills')
    .select('id, view_count, install_count, good_count');

  if (!skills) {
    console.error('Failed to fetch skills');
    return;
  }

  for (const skill of skills) {
    await supabase
      .from('skills')
      .update({
        view_count_snapshot: skill.view_count,
        install_count_snapshot: skill.install_count,
        good_count_snapshot: skill.good_count,
      })
      .eq('id', skill.id);
  }

  console.log(`Initialized snapshots for ${skills.length} skills.`);
}

main().catch(console.error);
