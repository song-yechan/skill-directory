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

const sb = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

async function main() {
  const { data } = await sb
    .from('skills')
    .select('slug, name, description_en, description_ko, summary_en, summary_ko, install_guide, usage_guide, examples, tags, category_id')
    .eq('slug', 'lackeyjb-playwright-skill');

  for (const s of data ?? []) {
    console.log('name:', s.name);
    console.log('category:', s.category_id);
    console.log('tags:', JSON.stringify(s.tags));
    console.log('\n--- description_en ---');
    console.log(s.description_en);
    console.log('\n--- description_ko ---');
    console.log(s.description_ko);
    console.log('\n--- summary_en ---');
    console.log(s.summary_en);
    console.log('\n--- summary_ko ---');
    console.log(s.summary_ko);
    console.log('\n--- install_guide ---');
    console.log(s.install_guide);
    console.log('\n--- usage_guide ---');
    console.log(s.usage_guide);
    console.log('\n--- examples ---');
    console.log(s.examples);
  }
}

main().catch(console.error);
