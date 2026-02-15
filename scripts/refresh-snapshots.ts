/**
 * Copy current counts into snapshot columns.
 * Run weekly before seed to reset trending deltas.
 * Usage: npx tsx scripts/refresh-snapshots.ts
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
  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, view_count, install_count, good_count');

  if (error) {
    console.error('Failed to fetch skills:', error.message);
    process.exit(1);
  }

  let updated = 0;
  for (const skill of skills) {
    const { error: updateError } = await supabase
      .from('skills')
      .update({
        view_count_snapshot: skill.view_count,
        install_count_snapshot: skill.install_count,
        good_count_snapshot: skill.good_count,
      })
      .eq('id', skill.id);

    if (!updateError) updated++;
  }

  console.log(`Refreshed snapshots for ${updated}/${skills.length} skills.`);
}

main().catch(console.error);
