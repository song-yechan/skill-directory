/**
 * Fix Anthropic official skill names to be human-readable
 * and set stars to actual repo stars (shared across all skills)
 */

import { createClient } from '@supabase/supabase-js';
import { execSync } from 'child_process';
import { readFileSync } from 'fs';
import { resolve } from 'path';

const GH_TOKEN = execSync('gh auth token', { encoding: 'utf-8' }).trim();

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

const NICE_NAMES: Record<string, { name: string; category: string }> = {
  'anthropic-algorithmic-art': { name: 'Algorithmic Art Generator', category: 'development' },
  'anthropic-brand-guidelines': { name: 'Brand Guidelines Writer', category: 'docs' },
  'anthropic-canvas-design': { name: 'Canvas Design Tool', category: 'development' },
  'anthropic-doc-coauthoring': { name: 'Document Co-Authoring', category: 'docs' },
  'anthropic-docx': { name: 'Word Document (DOCX) Processing', category: 'docs' },
  'anthropic-frontend-design': { name: 'Frontend Design & Build', category: 'development' },
  'anthropic-internal-comms': { name: 'Internal Communications Writer', category: 'docs' },
  'anthropic-mcp-builder': { name: 'MCP Server Builder', category: 'development' },
  'anthropic-pdf': { name: 'PDF Processing', category: 'docs' },
  'anthropic-pptx': { name: 'PowerPoint (PPTX) Builder', category: 'docs' },
  'anthropic-skill-creator': { name: 'Skill Creator', category: 'development' },
  'anthropic-slack-gif-creator': { name: 'Slack GIF Creator', category: 'productivity' },
  'anthropic-theme-factory': { name: 'Theme Factory', category: 'development' },
  'anthropic-web-artifacts-builder': { name: 'Web Artifacts Builder', category: 'development' },
  'anthropic-webapp-testing': { name: 'Web App Testing', category: 'testing' },
  'anthropic-xlsx': { name: 'Excel (XLSX) Processing', category: 'docs' },
};

async function main() {
  // Get actual star count for anthropics/skills repo
  const res = await fetch('https://api.github.com/repos/anthropics/skills', {
    headers: { Authorization: `Bearer ${GH_TOKEN}`, Accept: 'application/vnd.github+json' },
  });
  const repoData = await res.json();
  const realStars = repoData.stargazers_count ?? 70000;
  console.log(`anthropics/skills actual stars: ${realStars}`);

  for (const [slug, { name, category }] of Object.entries(NICE_NAMES)) {
    const { error } = await supabase
      .from('skills')
      .update({ name, stars: realStars, category_id: category })
      .eq('slug', slug);

    if (error) {
      console.error(`FAIL: ${slug} — ${error.message}`);
    } else {
      console.log(`OK: ${slug} → "${name}" (${category})`);
    }
  }

  console.log('\nDone!');
}

main().catch(console.error);
