/**
 * Add researched skills to the database.
 *
 * Workflow:
 *   1. npx tsx scripts/add-new-skills.ts  — insert skeleton data
 *   2. npx tsx scripts/enrich-skills.ts   — Gemini generates description_ko, summary, usage_guide
 *
 * description_ko를 비워두면 enrich 스크립트가 자동으로 대상에 포함시킴.
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
    if (match) {
      const [, key, value] = match;
      if (!process.env[key.trim()]) {
        process.env[key.trim()] = value.trim();
      }
    }
  }
} catch {
  // CI
}

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

interface NewSkill {
  readonly slug: string;
  readonly name: string;
  readonly name_ko: string;
  readonly github_url: string;
  readonly github_owner: string;
  readonly github_repo: string;
  readonly description_en: string; // seed for Gemini enrichment
  readonly category_id: string;
  readonly tags: readonly string[];
  readonly stars: number;
}

// description_ko, summary_en, summary_ko, usage_guide → enrich 스크립트가 Gemini로 생성
const newSkills: readonly NewSkill[] = [
  // ── 여기에 새 스킬 추가 ──
  // {
  //   slug: 'owner-repo',
  //   name: 'Skill Name',
  //   name_ko: '스킬 이름',
  //   github_url: 'https://github.com/owner/repo',
  //   github_owner: 'owner',
  //   github_repo: 'repo',
  //   description_en: 'What this skill does (2-3 sentences, used as Gemini input)',
  //   category_id: 'development',
  //   tags: ['tag1', 'tag2', 'tag3'],
  //   stars: 0,
  // },
];

async function main() {
  // Check existing
  const { data: existing } = await supabase
    .from('skills')
    .select('github_url');

  const existingUrls = new Set(existing?.map((s) => s.github_url) ?? []);

  const toInsert = newSkills.filter((s) => !existingUrls.has(s.github_url));
  console.log(`Total new skills: ${newSkills.length}`);
  console.log(`Already in DB: ${newSkills.length - toInsert.length}`);
  console.log(`To insert: ${toInsert.length}`);

  if (toInsert.length === 0) {
    console.log('Nothing to insert.');
    return;
  }

  let inserted = 0;
  let failed = 0;

  for (const skill of toInsert) {
    const { error } = await supabase.from('skills').insert({
      ...skill,
      tags: [...skill.tags],
    });

    if (error) {
      console.error(`  FAIL: ${skill.slug} — ${error.message}`);
      failed++;
    } else {
      console.log(`  OK: ${skill.slug}`);
      inserted++;
    }
  }

  console.log(`\n=== Done ===`);
  console.log(`  Inserted: ${inserted}`);
  console.log(`  Failed: ${failed}`);
  console.log(`\nNext: npx tsx scripts/enrich-skills.ts`);
}

main().catch(console.error);
