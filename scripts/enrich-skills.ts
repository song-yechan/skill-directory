/**
 * Enrich skills with AI-generated structured descriptions.
 * Uses Google Gemini 2.5 Flash (free tier)
 *
 * Usage: npx tsx scripts/enrich-skills.ts
 * Requires GEMINI_API_KEY in .env.local
 * Get free key: https://aistudio.google.com/apikey
 */

import { createClient } from '@supabase/supabase-js';
import { readFileSync } from 'fs';
import { resolve } from 'path';

// Load .env.local (skip in CI)
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
  // CI environment — env vars provided externally
}

const GEMINI_KEY = process.env.GEMINI_API_KEY!;
const SUPABASE_URL = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const SUPABASE_KEY = process.env.SUPABASE_SERVICE_ROLE_KEY!;

if (!GEMINI_KEY || GEMINI_KEY.includes('<')) {
  console.error('ERROR: GEMINI_API_KEY is not set in .env.local');
  console.error('Get a free key at https://aistudio.google.com/apikey');
  console.error('Add to .env.local: GEMINI_API_KEY=AIza...');
  process.exit(1);
}

const supabase = createClient(SUPABASE_URL, SUPABASE_KEY);

const GEMINI_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash:generateContent?key=${GEMINI_KEY}`;
const CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'] as const;
const MAX_RETRIES = 3;

// ── Prompt ──────────────────────────────────────────────

function buildPrompt(readme: string, currentName: string): string {
  return `You are writing concise, scannable documentation for a **Claude Code skill** directory.

## Context
- "Claude Code" is Anthropic's CLI-based AI coding agent (terminal tool)
- A "skill" is a reusable instruction file (SKILL.md) that extends Claude Code's capabilities
- Users browse this directory to quickly understand what a skill does and how to use it
- Content must be SHORT and VISUAL — users won't read long text

## Input
Skill name: "${currentName}"

README content:
${readme.slice(0, 5000)}

## Task
Generate a JSON object. Every string field must be a **plain string** (not array, not object).

### Output Schema

\`\`\`json
{
  "name": "string — human-readable name, 2-4 words",
  "description_en": "string — exactly 2 sentences. Sentence 1: what it does. Sentence 2: when/why you'd use it.",
  "description_ko": "string — same in Korean. ~해요/~이에요 체. 한자 절대 금지.",
  "summary_en": "string — max 60 chars, starts with verb",
  "summary_ko": "string — max 30자, 한자 금지",
  "usage_guide": "string — markdown, following the EXACT template below",
  "category": "string — one of: development, testing, devops, productivity, docs, other",
  "tags": ["3-5 lowercase kebab-case tags"]
}
\`\`\`

### usage_guide TEMPLATE (follow this structure exactly)

\`\`\`markdown
### 동작 흐름

{한 줄로 스킬의 동작 과정을 화살표로 표현} → {step} → {step} → {result}

### 활용 시나리오

| 상황 | 요청 예시 |
|------|----------|
| {구체적 상황 1} | "{실제 프롬프트 예시}" |
| {구체적 상황 2} | "{실제 프롬프트 예시}" |
| {구체적 상황 3} | "{실제 프롬프트 예시}" |
| {구체적 상황 4} | "{실제 프롬프트 예시}" |

> {트리거 방식 한 줄 설명 — 슬래시 커맨드가 있으면 명시, 없으면 "자동 활성화" 안내}
\`\`\`

### GOOD EXAMPLE (Playwright Skill)

\`\`\`markdown
### 동작 흐름

자연어 요청 → Claude가 Playwright 코드 작성 → 브라우저 실행 → 결과 리포트

### 활용 시나리오

| 상황 | 요청 예시 |
|------|----------|
| 기능 검증 | "회원가입 폼이 정상 동작하는지 테스트해줘" |
| 반응형 확인 | "대시보드를 모바일/태블릿/데스크톱으로 스크린샷 찍어줘" |
| 링크 점검 | "전체 페이지에서 깨진 링크 찾아줘" |
| 폼 테스트 | "결제 폼에 잘못된 값 넣었을 때 에러 메시지 확인해줘" |

> 별도 슬래시 커맨드 없이 브라우저 자동화 요청 시 자동 활성화돼요.
\`\`\`

### Quality Rules

1. **description은 딱 2문장.** 길면 탈락.
2. **usage_guide는 위 템플릿 구조를 반드시 따를 것.** "동작 흐름" + "활용 시나리오" 테이블 + 트리거 안내.
3. **활용 시나리오 테이블은 4행.** 각 행은 구체적이고 서로 다른 상황이어야 함.
4. **"동작 흐름"은 화살표(→)로 연결된 한 줄.** 3-5단계.
5. **한자(漢字) 절대 금지** — "文書" ❌ → "문서" ✅
6. **기술 용어는 영어 그대로**: "Claude Code", "Playwright", "API", "MCP"
7. **자연스러운 ~요 체**: ~해요, ~이에요, ~돼요
8. **"this skill" 자기참조 금지** → 스킬 이름으로 언급
9. **요청 예시는 실제 사용자가 Claude Code에 입력할 한국어 프롬프트**

Return ONLY the JSON object. No markdown fences, no explanation.`;
}

// ── Gemini API call ─────────────────────────────────────

interface EnrichedData {
  readonly name: string;
  readonly description_en: string;
  readonly description_ko: string;
  readonly summary_en: string;
  readonly summary_ko: string;
  readonly usage_guide: string;
  readonly category: string;
  readonly tags: readonly string[];
}

async function callGemini(readme: string, currentName: string): Promise<EnrichedData | null> {
  const prompt = buildPrompt(readme, currentName);

  for (let attempt = 0; attempt < MAX_RETRIES; attempt++) {
    try {
      const res = await fetch(GEMINI_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            maxOutputTokens: 2000,
            responseMimeType: 'application/json',
          },
        }),
      });

      if (res.status === 429) {
        const wait = Math.pow(2, attempt + 1) * 5_000;
        process.stdout.write(` (rate limit, ${wait / 1000}s)`);
        await new Promise((r) => setTimeout(r, wait));
        continue;
      }

      if (!res.ok) {
        const errText = await res.text();
        console.error(`  Gemini ${res.status}: ${errText.slice(0, 150)}`);
        return null;
      }

      const data = await res.json();
      const text = data.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
      const cleaned = text.replace(/^```json\s*\n?/, '').replace(/\n?```\s*$/, '');
      return JSON.parse(cleaned);
    } catch (err) {
      console.error(`  Failed: ${(err as Error).message}`);
      if (attempt < MAX_RETRIES - 1) {
        await new Promise((r) => setTimeout(r, 3000));
        continue;
      }
      return null;
    }
  }
  return null;
}

// ── Main ────────────────────────────────────────────────

async function main() {
  console.log('=== Skill Enrichment — Gemini 2.0 Flash ===\n');

  // Only enrich skills that haven't been enriched yet (no Korean description)
  const { data: skills, error } = await supabase
    .from('skills')
    .select('id, slug, name, readme_raw, description_en')
    .is('description_ko', null)
    .order('stars', { ascending: false });

  if (error || !skills) {
    console.error('Failed to fetch skills:', error?.message);
    process.exit(1);
  }

  console.log(`Total skills to enrich: ${skills.length}\n`);

  let enriched = 0;
  let failed = 0;

  for (const skill of skills) {
    const content = skill.readme_raw ?? skill.description_en ?? '';
    if (!content || content.length < 50) {
      console.log(`SKIP: ${skill.slug} (no content)`);
      failed++;
      continue;
    }

    process.stdout.write(`[${enriched + failed + 1}/${skills.length}] ${skill.slug}...`);

    const result = await callGemini(content, skill.name);
    if (!result) {
      failed++;
      console.log(' FAIL');
      continue;
    }

    const ensureString = (v: unknown): string | null => {
      if (typeof v === 'string') return v;
      if (Array.isArray(v)) return v.join('\n');
      if (v && typeof v === 'object') return JSON.stringify(v, null, 2);
      return null;
    };

    const category = CATEGORIES.includes(result.category as typeof CATEGORIES[number])
      ? result.category
      : undefined;
    const tags = Array.isArray(result.tags) ? [...result.tags] : [];

    const { error: updateError } = await supabase
      .from('skills')
      .update({
        name: ensureString(result.name) ?? skill.name,
        description_en: ensureString(result.description_en),
        description_ko: ensureString(result.description_ko),
        summary_en: ensureString(result.summary_en),
        summary_ko: ensureString(result.summary_ko),
        usage_guide: ensureString(result.usage_guide),
        install_guide: null,
        examples: null,
        tags,
        ...(category ? { category_id: category } : {}),
      })
      .eq('id', skill.id);

    if (updateError) {
      console.log(` DB: ${updateError.message}`);
      failed++;
    } else {
      console.log(' OK');
      enriched++;
    }

    // Gemini free tier: 15 RPM → 4s between requests
    await new Promise((r) => setTimeout(r, 4000));
  }

  console.log(`\n=== Done ===`);
  console.log(`  Enriched: ${enriched}`);
  console.log(`  Failed: ${failed}`);
}

main().catch(console.error);
