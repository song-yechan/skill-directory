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
    .select('name, stars, github_owner, good_count')
    .order('stars', { ascending: false });

  console.table(data?.map(s => ({
    name: s.name.slice(0, 30),
    stars: s.stars,
    good: s.good_count,
    owner: s.github_owner,
  })));
}

main().catch(console.error);
