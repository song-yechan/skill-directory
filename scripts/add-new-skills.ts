/**
 * Add researched skills to the database
 * Run: npx tsx scripts/add-new-skills.ts
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
  readonly description_en: string;
  readonly description_ko: string;
  readonly summary_en: string;
  readonly summary_ko: string;
  readonly category_id: string;
  readonly tags: readonly string[];
  readonly stars: number;
}

const newSkills: readonly NewSkill[] = [
  {
    slug: 'everyinc-compound-engineering-plugin',
    name: 'Compound Engineering Plugin',
    name_ko: 'Compound Engineering 플러그인',
    github_url: 'https://github.com/EveryInc/compound-engineering-plugin',
    github_owner: 'EveryInc',
    github_repo: 'compound-engineering-plugin',
    description_en: 'Compound Engineering philosophy-based Claude Code plugin with 24 AI agents, 13 slash commands, and 11 skills. Each engineering unit makes subsequent work easier. Supports 100+ frameworks including Rails, React, Next.js. Includes CLI for converting to OpenCode/Codex/Cursor formats.',
    description_ko: 'Compound Engineering 철학 기반 Claude Code 플러그인. 24개 AI 에이전트, 13개 슬래시 커맨드, 11개 스킬. Rails, React, Next.js 등 100+ 프레임워크 지원. OpenCode/Codex/Cursor 변환 CLI 포함.',
    summary_en: '24 agents + 13 commands + 11 skills based on Compound Engineering',
    summary_ko: 'Compound Engineering 기반 24 에이전트 + 13 커맨드 + 11 스킬',
    category_id: 'development',
    tags: ['compound-engineering', 'multi-agent', 'plugin', 'framework-agnostic', 'slash-commands'],
    stars: 9084,
  },
  {
    slug: 'wshobson-agents',
    name: 'Agents — Multi-Agent Orchestration',
    name_ko: 'Agents — 멀티 에이전트 오케스트레이션',
    github_url: 'https://github.com/wshobson/agents',
    github_owner: 'wshobson',
    github_repo: 'agents',
    description_en: '112 specialized AI agents + 16 multi-agent workflow orchestrators + 146 agent skills + 79 dev tools = 73 plugins. Uses Opus/Sonnet/Haiku 3-tier model strategy. Covers LLM apps (LangGraph, RAG), Web3/DeFi, K8s, and more.',
    description_ko: '112개 특화 AI 에이전트 + 16개 멀티에이전트 워크플로우 오케스트레이터 + 146개 스킬 + 79개 도구. Opus/Sonnet/Haiku 3-tier 모델 전략. LLM 앱, Web3/DeFi, K8s 등 다양한 도메인.',
    summary_en: '112 agents + 146 skills with 3-tier model orchestration',
    summary_ko: '112 에이전트 + 146 스킬, 3-tier 모델 오케스트레이션',
    category_id: 'development',
    tags: ['multi-agent', 'orchestration', 'llm-applications', 'web3', 'production-ready'],
    stars: 28762,
  },
  {
    slug: 'neolab-context-engineering-kit',
    name: 'Context Engineering Kit',
    name_ko: 'Context Engineering Kit',
    github_url: 'https://github.com/NeoLabHQ/context-engineering-kit',
    github_owner: 'NeoLabHQ',
    github_repo: 'context-engineering-kit',
    description_en: 'Handcrafted plugin marketplace focused on improving agent result quality. Includes SDD (Spec-Driven Dev), TDD, Code Review, Subagent-Driven Dev, Domain-Driven Dev, Kaizen (root cause analysis), and FPF (First Principles Framework). Token-efficient design.',
    description_ko: '에이전트 결과 품질 향상에 집중한 핸드크래프트 플러그인. SDD, TDD, 코드 리뷰, 서브에이전트 개발, DDD, Kaizen(근본 원인 분석), FPF(제1원리 프레임워크) 등 13개 플러그인.',
    summary_en: 'Quality-focused skills: SDD, TDD, Kaizen, First Principles',
    summary_ko: '품질 중심 스킬: SDD, TDD, Kaizen, 제1원리 프레임워크',
    category_id: 'development',
    tags: ['context-engineering', 'spec-driven', 'quality-gates', 'kaizen', 'first-principles'],
    stars: 481,
  },
  {
    slug: 'chriswiles-claude-code-showcase',
    name: 'Claude Code Showcase',
    name_ko: 'Claude Code 쇼케이스',
    github_url: 'https://github.com/ChrisWiles/claude-code-showcase',
    github_owner: 'ChrisWiles',
    github_repo: 'claude-code-showcase',
    description_en: 'Comprehensive Claude Code project configuration example with skills (testing-patterns, graphql-schema, core-components), agents, hooks, commands, and GitHub Actions workflows (auto PR review, monthly docs sync, weekly code quality review, biweekly dependency audit).',
    description_ko: 'Claude Code 프로젝트 설정 종합 예제. 스킬, 에이전트, 훅, 커맨드 + GitHub Actions(자동 PR 리뷰, 월간 docs 동기화, 주간 코드 품질 리뷰, 격주 의존성 감사) 워크플로우.',
    summary_en: 'Project config showcase with GitHub Actions automation',
    summary_ko: 'GitHub Actions 자동화 포함 프로젝트 설정 쇼케이스',
    category_id: 'development',
    tags: ['project-config', 'github-actions', 'auto-pr-review', 'showcase', 'best-practices'],
    stars: 5325,
  },
  {
    slug: 'jeffallan-claude-skills',
    name: 'Full-Stack Developer Skills',
    name_ko: '풀스택 개발자 스킬',
    github_url: 'https://github.com/Jeffallan/claude-skills',
    github_owner: 'Jeffallan',
    github_repo: 'claude-skills',
    description_en: '66 specialized skills for full-stack developers across 12 categories (languages, backend/frontend frameworks, infrastructure, API, testing, DevOps, security, data/ML, platforms). 9 workflows and 365 reference files.',
    description_ko: '풀스택 개발자용 66개 특화 스킬. 12개 카테고리(언어, 백엔드/프론트엔드, 인프라, API, 테스트, DevOps, 보안, 데이터/ML, 플랫폼). 9개 워크플로우, 365개 레퍼런스 파일.',
    summary_en: '66 specialized skills across 12 categories for full-stack devs',
    summary_ko: '풀스택 개발자용 12개 카테고리 66개 특화 스킬',
    category_id: 'development',
    tags: ['fullstack', 'specialized-agents', 'workflows', 'multi-category', 'reference-files'],
    stars: 2942,
  },
  {
    slug: 'mrgoonie-claudekit-skills',
    name: 'ClaudeKit Skills',
    name_ko: 'ClaudeKit 스킬',
    github_url: 'https://github.com/mrgoonie/claudekit-skills',
    github_owner: 'mrgoonie',
    github_repo: 'claudekit-skills',
    description_en: '40+ skills from ClaudeKit.cc. Covers better-auth, Google ADK Python, AI Multimodal (Gemini), Three.js 3D, Shopify/Stripe/Polar payment integrations, Playwright automation, shadcn/ui, and sequential-thinking. Progressive disclosure architecture.',
    description_ko: 'ClaudeKit.cc의 40개 이상 스킬. better-auth, Google ADK, AI 멀티모달(Gemini), Three.js 3D, Shopify/Stripe/Polar 결제 통합, Playwright 자동화, shadcn/ui, sequential-thinking 지원.',
    summary_en: '40+ skills: e-commerce, 3D web, payment, and AI multimodal',
    summary_ko: '이커머스, 3D 웹, 결제, AI 멀티모달 등 40개 이상 스킬',
    category_id: 'development',
    tags: ['claudekit', 'e-commerce', 'payment-integration', 'threejs', 'shadcn-ui'],
    stars: 1716,
  },
  {
    slug: 'alirezarezvani-skill-factory',
    name: 'Claude Code Skill Factory',
    name_ko: 'Claude Code 스킬 팩토리',
    github_url: 'https://github.com/alirezarezvani/claude-code-skill-factory',
    github_owner: 'alirezarezvani',
    github_repo: 'claude-code-skill-factory',
    description_en: 'Production-grade toolkit for building and deploying Claude skills, agents, slash commands, and LLM prompts at scale. Interactive builder, templates, and prebuilt domain skills (AWS architecture, content research, MS365 admin).',
    description_ko: 'Claude 스킬/에이전트/슬래시 커맨드/LLM 프롬프트를 대규모로 빌드 & 배포하는 프로덕션급 툴킷. 인터랙티브 빌더, 템플릿, 도메인별 프리빌트 스킬 포함.',
    summary_en: 'Build and deploy Claude skills at scale with interactive builder',
    summary_ko: '인터랙티브 빌더로 Claude 스킬 대규모 빌드/배포',
    category_id: 'productivity',
    tags: ['skill-factory', 'code-generation', 'template-builder', 'meta-skill', 'automation'],
    stars: 504,
  },
  {
    slug: 'jezweb-claude-skills',
    name: 'Cloudflare & Full-Stack Skills',
    name_ko: 'Cloudflare & 풀스택 스킬',
    github_url: 'https://github.com/jezweb/claude-skills',
    github_owner: 'jezweb',
    github_repo: 'claude-skills',
    description_en: '97 production-grade skills across 9 categories. Cloudflare (16: Workers, D1, R2, KV, Agents, MCP), AI/ML (12: Vercel AI SDK, OpenAI Agents), Frontend (12: Tailwind v4, TanStack), Auth (Clerk, Better Auth), CMS (TinaCMS, Sveltia, WordPress). Claims 60% token savings.',
    description_ko: '9개 카테고리 97개 프로덕션급 스킬. Cloudflare(Workers, D1, R2 등 16개), AI/ML(Vercel AI SDK 등 12개), Frontend(Tailwind v4, TanStack 등 12개), Auth, CMS. 60% 토큰 절약.',
    summary_en: '97 production skills: Cloudflare, AI SDK, Tailwind v4, TanStack',
    summary_ko: 'Cloudflare, AI SDK, Tailwind v4 등 97개 프로덕션 스킬',
    category_id: 'development',
    tags: ['cloudflare', 'ai-sdk', 'tanstack', 'tailwind-v4', 'cms'],
    stars: 487,
  },
  {
    slug: 'mhattingpete-skills-marketplace',
    name: 'Token-Optimized Skills Marketplace',
    name_ko: '토큰 최적화 스킬 마켓플레이스',
    github_url: 'https://github.com/mhattingpete/claude-skills-marketplace',
    github_owner: 'mhattingpete',
    github_repo: 'claude-skills-marketplace',
    description_en: 'Software engineering workflow skills marketplace with 3-tier architecture (marketplace -> plugins -> skills/agents). Code execution environment achieves 90-99% token savings on bulk operations (100 files: 1K vs 100K tokens). Git automation, test fixing, code review.',
    description_ko: 'SW 엔지니어링 워크플로우 스킬 마켓플레이스. 3-tier 아키텍처. 코드 실행 환경이 벌크 연산 시 90-99% 토큰 절감. Git 자동화, 테스트 수정, 코드 리뷰.',
    summary_en: 'Skills marketplace with 90-99% token savings on bulk ops',
    summary_ko: '벌크 작업 90-99% 토큰 절감 스킬 마켓플레이스',
    category_id: 'development',
    tags: ['skills-marketplace', 'token-optimization', 'code-execution', 'git-automation', 'code-review'],
    stars: 370,
  },
  {
    slug: 'lodetomasi-agents-claude-code',
    name: '100 Hyper-Specialized Agents',
    name_ko: '100개 하이퍼 특화 에이전트',
    github_url: 'https://github.com/lodetomasi/agents-claude-code',
    github_owner: 'lodetomasi',
    github_repo: 'agents-claude-code',
    description_en: '100 hyper-specialized AI agents for Claude Code. Expert agents for React, AWS, Kubernetes, ML, Security, and more. Each agent uses SKILL.md format for domain-specific guidance.',
    description_ko: 'Claude Code용 100개 하이퍼 특화 AI 에이전트. React, AWS, Kubernetes, ML, Security 등 전문가 에이전트 군. SKILL.md 형식 사용.',
    summary_en: '100 hyper-specialized agents for React, AWS, K8s, ML, Security',
    summary_ko: 'React, AWS, K8s, ML, Security 100개 특화 에이전트',
    category_id: 'development',
    tags: ['hyper-specialized', 'agents', 'aws', 'kubernetes', 'ml-security'],
    stars: 113,
  },
  {
    slug: 'oaustegard-claude-skills',
    name: 'Claude.ai PaaS Skills',
    name_ko: 'Claude.ai PaaS 스킬',
    github_url: 'https://github.com/oaustegard/claude-skills',
    github_owner: 'oaustegard',
    github_repo: 'claude-skills',
    description_en: '54 Claude.ai PaaS-focused skills with 110 releases. Includes Bluesky social analytics, Spotify control, Vega-Lite charts, AI paper review, GitHub index builder, and multi-agent orchestration. Python-based.',
    description_ko: 'Claude.ai PaaS 환경 중심 54개 스킬 (110개 릴리즈). Bluesky 소셜 분석, Spotify 제어, Vega-Lite 차트, AI 논문 리뷰, GitHub 인덱스, 멀티에이전트 오케스트레이션. Python 기반.',
    summary_en: '54 Claude.ai PaaS skills: Bluesky, Spotify, charts, paper review',
    summary_ko: 'Bluesky, Spotify, 차트, 논문 리뷰 등 54개 PaaS 스킬',
    category_id: 'productivity',
    tags: ['claude-ai-paas', 'social-media', 'data-visualization', 'python', 'multi-agent'],
    stars: 102,
  },
  {
    slug: 'featbit-skills',
    name: 'FeatBit Feature Flag Skills',
    name_ko: 'FeatBit 피처 플래그 스킬',
    github_url: 'https://github.com/featbit/featbit-skills',
    github_owner: 'featbit',
    github_repo: 'featbit-skills',
    description_en: 'Official FeatBit skills for feature flags and A/B testing. Covers .NET/Node.js/Python/Java/Go server SDKs, React/React Native client SDKs, OpenFeature providers, K8s/Docker deployment. 14 skills compatible with Claude Code/VSCode Copilot/Cursor.',
    description_ko: 'FeatBit 공식 피처 플래그 & A/B 테스팅 스킬. .NET/Node.js/Python/Java/Go 서버 SDK, React/RN 클라이언트 SDK, OpenFeature, K8s/Docker 배포. 14개 스킬.',
    summary_en: 'Official FeatBit feature flag & A/B testing skills for 5 SDKs',
    summary_ko: 'FeatBit 공식 피처 플래그 & A/B 테스팅 (5개 SDK)',
    category_id: 'devops',
    tags: ['feature-flags', 'ab-testing', 'sdk-integration', 'openfeature', 'multi-platform'],
    stars: 6,
  },
  {
    slug: 'omkamal-pypict-skill',
    name: 'PICT Combinatorial Testing',
    name_ko: 'PICT 조합 테스팅 스킬',
    github_url: 'https://github.com/omkamal/pypict-claude-skill',
    github_owner: 'omkamal',
    github_repo: 'pypict-claude-skill',
    description_en: 'Generate N-wise test cases using PICT (Pairwise Independent Combinatorial Testing) via pypict library. Dramatically reduces test combinations while maintaining coverage.',
    description_ko: 'PICT(쌍별 독립 조합 테스팅) 기반 N-wise 테스트 케이스 생성. pypict 라이브러리 활용. 테스트 조합 수를 극적으로 줄이면서 커버리지 유지.',
    summary_en: 'N-wise combinatorial test case generation with PICT',
    summary_ko: 'PICT 기반 N-wise 조합 테스트 케이스 생성',
    category_id: 'testing',
    tags: ['pict', 'pairwise-testing', 'test-generation', 'combinatorial', 'quality-assurance'],
    stars: 37,
  },
  {
    slug: 'dashed-claude-marketplace',
    name: 'Local Personal Marketplace',
    name_ko: '로컬 퍼스널 마켓플레이스',
    github_url: 'https://github.com/dashed/claude-marketplace',
    github_owner: 'dashed',
    github_repo: 'claude-marketplace',
    description_en: 'Local personal skills/plugins marketplace. Includes git-absorb (auto commit folding), tmux remote control, ultrathink (deep sequential reasoning), jj (Jujutsu VCS), fzf integration, zellij, Playwright Python automation, design-principles, and mermaid-cli.',
    description_ko: '로컬 퍼스널 스킬/플러그인 마켓플레이스. git-absorb(자동 커밋 폴딩), tmux 원격 제어, ultrathink(심층 추론), Jujutsu VCS, fzf, zellij, Playwright Python 자동화, mermaid-cli 등 14개.',
    summary_en: 'Local marketplace: git-absorb, ultrathink, tmux, Jujutsu',
    summary_ko: 'git-absorb, ultrathink, tmux, Jujutsu 등 로컬 마켓플레이스',
    category_id: 'productivity',
    tags: ['local-marketplace', 'git-absorb', 'ultrathink', 'jujutsu', 'terminal-tools'],
    stars: 7,
  },
  {
    slug: 'panaversity-skills-lab',
    name: 'Claude Code Skills Lab',
    name_ko: 'Claude Code 스킬 랩',
    github_url: 'https://github.com/panaversity/claude-code-skills-lab',
    github_owner: 'panaversity',
    github_repo: 'claude-code-skills-lab',
    description_en: 'Educational hands-on skill collection. Linked to AI Native Development textbook Lesson 04. Includes Playwright browser automation, library doc fetcher, doc-coauthoring, interview (discovery conversations), skill-creator-pro, skill-validator, and theme-factory.',
    description_ko: '교육용 핸즈온 스킬 컬렉션. AI 네이티브 개발 교재 연계. Playwright 자동화, 라이브러리 문서 페처, 문서 공동작성, 스킬 생성기, 스킬 검증기, 테마 팩토리 등 13개 스킬.',
    summary_en: 'Educational skills lab with skill-creator and validator',
    summary_ko: '스킬 생성기/검증기 포함 교육용 스킬 랩',
    category_id: 'other',
    tags: ['education', 'hands-on-lab', 'skill-creation', 'browser-automation', 'document-processing'],
    stars: 35,
  },
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
}

main().catch(console.error);
