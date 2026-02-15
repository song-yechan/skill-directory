import { createClient } from '@supabase/supabase-js';
import { readFileSync, writeFileSync } from 'fs';
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
    .select('slug, name, readme_raw')
    .order('stars', { ascending: false });

  const out: Record<string, { name: string; readme: string }> = {};
  for (const s of data ?? []) {
    out[s.slug] = { name: s.name, readme: (s.readme_raw ?? '').slice(0, 3000) };
  }
  writeFileSync('/tmp/skill-readmes.json', JSON.stringify(out, null, 2));
  console.log(`Dumped ${Object.keys(out).length} skills to /tmp/skill-readmes.json`);
}

main().catch(console.error);
