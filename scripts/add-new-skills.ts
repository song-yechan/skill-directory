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
    slug: 'trailofbits-security-skills',
    name: 'Trail of Bits Security Skills',
    name_ko: 'Trail of Bits 보안 스킬',
    github_url: 'https://github.com/trailofbits/skills',
    github_owner: 'trailofbits',
    github_repo: 'skills',
    description_en: 'Security research skills from Trail of Bits. Includes static analysis with CodeQL/Semgrep, variant analysis, code auditing, fix verification, and differential review plugins.',
    description_ko: 'Trail of Bits의 보안 연구 스킬. CodeQL/Semgrep 정적 분석, 변이 분석, 코드 감사, 수정 검증, 차등 리뷰 플러그인 포함.',
    summary_en: 'Security research skills with CodeQL/Semgrep integration from Trail of Bits',
    summary_ko: 'Trail of Bits의 CodeQL/Semgrep 보안 분석 스킬',
    category_id: 'testing',
    tags: ['security', 'codeql', 'semgrep', 'audit', 'vulnerability'],
    stars: 0,
  },
  {
    slug: 'terraform-skill',
    name: 'Terraform & OpenTofu Skill',
    name_ko: 'Terraform & OpenTofu 스킬',
    github_url: 'https://github.com/antonbabenko/terraform-skill',
    github_owner: 'antonbabenko',
    github_repo: 'terraform-skill',
    description_en: 'Comprehensive Terraform/OpenTofu best practices skill covering testing strategies, module patterns, CI/CD workflows, and production-ready infrastructure code.',
    description_ko: 'Terraform/OpenTofu 테스트 전략, 모듈 패턴, CI/CD 워크플로우, 프로덕션 인프라 코드 베스트 프랙티스.',
    summary_en: 'Terraform/OpenTofu best practices for testing, modules, and CI/CD',
    summary_ko: 'Terraform/OpenTofu 테스트, 모듈, CI/CD 베스트 프랙티스',
    category_id: 'devops',
    tags: ['terraform', 'opentofu', 'iac', 'aws', 'modules'],
    stars: 0,
  },
  {
    slug: 'supabase-agent-skills',
    name: 'Supabase Agent Skills',
    name_ko: 'Supabase 에이전트 스킬',
    github_url: 'https://github.com/supabase/agent-skills',
    github_owner: 'supabase',
    github_repo: 'agent-skills',
    description_en: 'Official Supabase skills for AI agents covering database operations, authentication, storage, realtime subscriptions, Edge Functions, RLS policies, and migrations.',
    description_ko: 'Supabase 공식 AI 에이전트 스킬. DB 운영, 인증, 스토리지, 실시간 구독, Edge Functions, RLS 정책, 마이그레이션 지원.',
    summary_en: 'Official Supabase skills for database, auth, and Edge Functions',
    summary_ko: 'Supabase 공식 DB, 인증, Edge Functions 스킬',
    category_id: 'development',
    tags: ['supabase', 'postgresql', 'auth', 'edge-functions', 'database'],
    stars: 0,
  },
  {
    slug: 'vercel-agent-skills',
    name: 'Vercel Agent Skills',
    name_ko: 'Vercel 에이전트 스킬',
    github_url: 'https://github.com/vercel-labs/agent-skills',
    github_owner: 'vercel-labs',
    github_repo: 'agent-skills',
    description_en: 'Vercel official skill collection enabling instant deployment from Claude conversations. Supports claimable deployments where users transfer ownership to their own Vercel account.',
    description_ko: 'Vercel 공식 스킬. Claude 대화에서 즉시 배포 가능. 사용자가 소유권을 자신의 Vercel 계정으로 이전 가능.',
    summary_en: 'Official Vercel skills for instant deployment from Claude',
    summary_ko: 'Vercel 공식 즉시 배포 스킬',
    category_id: 'devops',
    tags: ['vercel', 'deployment', 'nextjs', 'hosting', 'serverless'],
    stars: 0,
  },
  {
    slug: 'digitalocean-app-platform-skills',
    name: 'DigitalOcean App Platform Skills',
    name_ko: 'DigitalOcean App Platform 스킬',
    github_url: 'https://github.com/digitalocean-labs/do-app-platform-skills',
    github_owner: 'digitalocean-labs',
    github_repo: 'do-app-platform-skills',
    description_en: 'Official DigitalOcean skills for App Platform covering deployment, migration, networking, database configuration, and troubleshooting with domain-specific decision trees.',
    description_ko: 'DigitalOcean 공식 App Platform 스킬. 배포, 마이그레이션, 네트워킹, DB 설정, 트러블슈팅 지원.',
    summary_en: 'Official DigitalOcean skills for App Platform deployment and ops',
    summary_ko: 'DigitalOcean 공식 App Platform 배포/운영 스킬',
    category_id: 'devops',
    tags: ['digitalocean', 'deployment', 'cloud', 'networking', 'database'],
    stars: 0,
  },
  {
    slug: 'secops-agent-kit',
    name: 'SecOps Agent Kit',
    name_ko: 'SecOps 에이전트 킷',
    github_url: 'https://github.com/AgentSecOps/SecOpsAgentKit',
    github_owner: 'AgentSecOps',
    github_repo: 'SecOpsAgentKit',
    description_en: 'Security operations toolkit providing 25+ skills to catch vulnerabilities, scan containers, detect secrets, and enforce security policies automatically.',
    description_ko: '25개 이상의 보안 운영 스킬. 취약점 탐지, 컨테이너 스캔, 시크릿 감지, 보안 정책 자동 적용.',
    summary_en: '25+ security skills for vulnerability scanning and policy enforcement',
    summary_ko: '취약점 스캔, 시크릿 감지 등 25개 이상 보안 스킬',
    category_id: 'testing',
    tags: ['security', 'containers', 'secrets', 'policy', 'devsecops'],
    stars: 0,
  },
  {
    slug: 'ios-simulator-skill',
    name: 'iOS Simulator Skill',
    name_ko: 'iOS 시뮬레이터 스킬',
    github_url: 'https://github.com/conorluddy/ios-simulator-skill',
    github_owner: 'conorluddy',
    github_repo: 'ios-simulator-skill',
    description_en: 'Optimizes Claude Code to build, run, and interact with iOS apps via the simulator without consuming token/context budget.',
    description_ko: 'Claude Code로 iOS 시뮬레이터에서 앱 빌드, 실행, 상호작용을 토큰 소비 없이 수행.',
    summary_en: 'Build and run iOS apps via simulator from Claude Code',
    summary_ko: 'Claude Code에서 iOS 시뮬레이터 빌드/실행',
    category_id: 'development',
    tags: ['ios', 'simulator', 'xcode', 'swift', 'mobile'],
    stars: 0,
  },
  {
    slug: 'claude-scientific-skills',
    name: 'Claude Scientific Skills',
    name_ko: 'Claude 과학 연구 스킬',
    github_url: 'https://github.com/K-Dense-AI/claude-scientific-skills',
    github_owner: 'K-Dense-AI',
    github_repo: 'claude-scientific-skills',
    description_en: '140+ scientific skills across bioinformatics, cheminformatics, proteomics, clinical research, and machine learning. Bundles 28+ databases and 55+ Python packages.',
    description_ko: '생물정보학, 화학정보학, 단백질체학, 임상연구, ML 등 140개 이상 과학 스킬. 28개 DB, 55개 Python 패키지 연동.',
    summary_en: '140+ scientific skills for bioinformatics, ML, and research',
    summary_ko: '생물정보학, ML, 연구용 140개 이상 과학 스킬',
    category_id: 'other',
    tags: ['science', 'bioinformatics', 'machine-learning', 'research', 'data-analysis'],
    stars: 0,
  },
  {
    slug: 'daaf',
    name: 'DAAF - Data Analyst Augmentation',
    name_ko: 'DAAF - 데이터 분석 보강 프레임워크',
    github_url: 'https://github.com/DAAF-Contribution-Community/daaf',
    github_owner: 'DAAF-Contribution-Community',
    github_repo: 'daaf',
    description_en: 'Open-source workflow enabling researchers to scale data analysis 5-10x while maintaining transparency, rigor, and reproducibility.',
    description_ko: '연구자가 투명성, 엄밀성, 재현성을 유지하면서 데이터 분석을 5-10배 확장할 수 있는 오픈소스 워크플로우.',
    summary_en: 'Scale data analysis 5-10x with reproducibility for researchers',
    summary_ko: '재현성 보장 데이터 분석 5-10배 확장 워크플로우',
    category_id: 'productivity',
    tags: ['data-analysis', 'research', 'reproducibility', 'workflow', 'science'],
    stars: 0,
  },
  {
    slug: 'last30days-skill',
    name: 'Last 30 Days Research',
    name_ko: '최근 30일 트렌드 리서치',
    github_url: 'https://github.com/mvanhorn/last30days-skill',
    github_owner: 'mvanhorn',
    github_repo: 'last30days-skill',
    description_en: 'Researches any topic across Reddit, X, YouTube from the last 30 days. Uses OpenAI and xAI APIs with strict recency and popularity-aware ranking.',
    description_ko: 'Reddit, X, YouTube에서 최근 30일 트렌드 리서치. OpenAI/xAI API 기반 인기도 순위 분석.',
    summary_en: 'Research trends across Reddit, X, YouTube from the last 30 days',
    summary_ko: 'Reddit, X, YouTube 최근 30일 트렌드 리서치',
    category_id: 'productivity',
    tags: ['research', 'reddit', 'trends', 'social-media', 'prompts'],
    stars: 0,
  },
  {
    slug: 'flutter-claude-code',
    name: 'Flutter SDLC Skills',
    name_ko: 'Flutter SDLC 스킬',
    github_url: 'https://github.com/cleydson/flutter-claude-code',
    github_owner: 'cleydson',
    github_repo: 'flutter-claude-code',
    description_en: '19 specialized Claude Code agents and skills for the complete Flutter Software Development Lifecycle, from design to production deployment.',
    description_ko: 'Flutter 소프트웨어 개발 라이프사이클 전체를 위한 19개 전문 Claude Code 에이전트 및 스킬.',
    summary_en: '19 agents for complete Flutter SDLC from design to deployment',
    summary_ko: 'Flutter 설계부터 배포까지 19개 에이전트',
    category_id: 'development',
    tags: ['flutter', 'dart', 'mobile', 'sdlc', 'cross-platform'],
    stars: 0,
  },
  {
    slug: 'claude-nextjs-skills',
    name: 'Claude Next.js Eval Skills',
    name_ko: 'Claude Next.js 평가 스킬',
    github_url: 'https://github.com/wsimmonds/claude-nextjs-skills',
    github_owner: 'wsimmonds',
    github_repo: 'claude-nextjs-skills',
    description_en: 'Skills designed to improve Claude pass rates against the official Next.js evals at nextjs.org/evals.',
    description_ko: 'Next.js 공식 평가(nextjs.org/evals) 통과율 향상을 위한 스킬.',
    summary_en: 'Improve Claude pass rates on Next.js official evals',
    summary_ko: 'Next.js 공식 평가 통과율 향상 스킬',
    category_id: 'development',
    tags: ['nextjs', 'react', 'evals', 'vercel', 'ssr'],
    stars: 0,
  },
  {
    slug: 'godot-claude-skills',
    name: 'Godot Game Engine Skills',
    name_ko: 'Godot 게임 엔진 스킬',
    github_url: 'https://github.com/Randroids-Dojo/Godot-Claude-Skills',
    github_owner: 'Randroids-Dojo',
    github_repo: 'Godot-Claude-Skills',
    description_en: 'Claude skills for Godot game engine development with GDScript, including GdUnit4 integration for unit tests and input simulation.',
    description_ko: 'Godot 게임 엔진 GDScript 개발 스킬. GdUnit4 단위 테스트, 입력 시뮬레이션 통합.',
    summary_en: 'Godot game development with GDScript and GdUnit4 testing',
    summary_ko: 'Godot GDScript 게임 개발 + GdUnit4 테스트',
    category_id: 'development',
    tags: ['godot', 'gdscript', 'gamedev', 'unit-testing', 'gdunit4'],
    stars: 0,
  },
  {
    slug: 'unreal-claude',
    name: 'Unreal Engine 5 Claude Integration',
    name_ko: 'Unreal Engine 5 Claude 연동',
    github_url: 'https://github.com/Natfii/UnrealClaude',
    github_owner: 'Natfii',
    github_repo: 'UnrealClaude',
    description_en: 'Claude Code CLI integration for Unreal Engine 5.7 with built-in UE5.7 documentation context for C++ and Blueprint assistance.',
    description_ko: 'Unreal Engine 5.7용 Claude Code CLI 연동. UE5.7 문서 컨텍스트 기반 C++/Blueprint 지원.',
    summary_en: 'Claude Code integration for Unreal Engine 5 with UE docs context',
    summary_ko: 'Unreal Engine 5 Claude Code 연동 (UE 문서 컨텍스트)',
    category_id: 'development',
    tags: ['unreal-engine', 'ue5', 'gamedev', 'cpp', 'blueprints'],
    stars: 0,
  },
  {
    slug: 'unity-training-skills',
    name: 'Unity Engineer Training Skills',
    name_ko: 'Unity 엔지니어 트레이닝 스킬',
    github_url: 'https://github.com/The1Studio/theone-training-skills',
    github_owner: 'The1Studio',
    github_repo: 'theone-training-skills',
    description_en: 'Skills for training Unity engineers enforcing VContainer DI patterns, SignalBus, concise C# patterns, and code quality standards.',
    description_ko: 'Unity 엔지니어 훈련용 스킬. VContainer DI 패턴, SignalBus, C# 코드 품질 기준 적용.',
    summary_en: 'Unity training skills for VContainer, SignalBus, and C# patterns',
    summary_ko: 'Unity VContainer, SignalBus, C# 패턴 훈련 스킬',
    category_id: 'development',
    tags: ['unity', 'csharp', 'gamedev', 'vcontainer', 'training'],
    stars: 0,
  },
  {
    slug: 'postman-claude-skill',
    name: 'Postman API Testing Skill',
    name_ko: 'Postman API 테스트 스킬',
    github_url: 'https://github.com/SterlingChin/postman-claude-skill',
    github_owner: 'SterlingChin',
    github_repo: 'postman-claude-skill',
    description_en: 'Integrates Claude Code with Postman for API testing workflows. Manages collections and environments via SKILL.md.',
    description_ko: 'Claude Code와 Postman 통합 API 테스트. 컬렉션 및 환경 관리.',
    summary_en: 'Postman API testing integration for Claude Code',
    summary_ko: 'Postman API 테스트 Claude Code 통합',
    category_id: 'testing',
    tags: ['postman', 'api-testing', 'collections', 'rest', 'automation'],
    stars: 0,
  },
  {
    slug: 'jira-skill',
    name: 'Jira Integration Skill',
    name_ko: 'Jira 연동 스킬',
    github_url: 'https://github.com/netresearch/jira-skill',
    github_owner: 'netresearch',
    github_repo: 'jira-skill',
    description_en: 'Intelligent Jira integration for Claude Code with MCP config and wiki markup support. Manages issues, sprints, and workflows from terminal.',
    description_ko: 'Claude Code용 Jira 스마트 연동. MCP 설정, 위키 마크업 지원. 이슈, 스프린트, 워크플로우 관리.',
    summary_en: 'Jira issue and sprint management from Claude Code via MCP',
    summary_ko: 'Claude Code에서 Jira 이슈/스프린트 관리 (MCP)',
    category_id: 'productivity',
    tags: ['jira', 'project-management', 'agile', 'issues', 'mcp'],
    stars: 0,
  },
  {
    slug: 'mastering-typescript-skill',
    name: 'Enterprise TypeScript Skill',
    name_ko: '엔터프라이즈 TypeScript 스킬',
    github_url: 'https://github.com/SpillwaveSolutions/mastering-typescript-skill',
    github_owner: 'SpillwaveSolutions',
    github_repo: 'mastering-typescript-skill',
    description_en: 'Enterprise-grade TypeScript development with type-safe patterns, modern tooling, and framework integration for React and NestJS.',
    description_ko: '엔터프라이즈급 TypeScript 개발. 타입 안전 패턴, React/NestJS 프레임워크 통합.',
    summary_en: 'Enterprise TypeScript patterns for React and NestJS',
    summary_ko: '엔터프라이즈 TypeScript React/NestJS 패턴',
    category_id: 'development',
    tags: ['typescript', 'react', 'nestjs', 'enterprise', 'type-safety'],
    stars: 0,
  },
  {
    slug: 'astro-publishing-skill',
    name: 'Astro Website Publishing Skill',
    name_ko: 'Astro 웹사이트 퍼블리싱 스킬',
    github_url: 'https://github.com/SpillwaveSolutions/publishing-astro-websites-agentic-skill',
    github_owner: 'SpillwaveSolutions',
    github_repo: 'publishing-astro-websites-agentic-skill',
    description_en: 'Build and deploy static websites with Astro framework. Covers SSG, Content Collections, MDX, Pagefind search, i18n, and multi-platform deployment.',
    description_ko: 'Astro 프레임워크로 정적 웹사이트 빌드/배포. SSG, MDX, 검색, i18n, 다중 플랫폼 배포 지원.',
    summary_en: 'Astro SSG website building with MDX, i18n, and deployment',
    summary_ko: 'Astro SSG 웹사이트 빌드 (MDX, i18n, 배포)',
    category_id: 'development',
    tags: ['astro', 'ssg', 'markdown', 'i18n', 'deployment'],
    stars: 0,
  },
  {
    slug: 'openskills',
    name: 'OpenSkills Universal Installer',
    name_ko: 'OpenSkills 유니버설 인스톨러',
    github_url: 'https://github.com/numman-ali/openskills',
    github_owner: 'numman-ali',
    github_repo: 'openskills',
    description_en: 'Universal skills loader for AI coding agents. Brings Anthropic SKILL.md to Cursor, Windsurf, Aider, Codex, and more.',
    description_ko: 'AI 코딩 에이전트 범용 스킬 로더. SKILL.md를 Cursor, Windsurf, Aider, Codex 등에서 사용 가능.',
    summary_en: 'Universal SKILL.md installer for all AI coding agents',
    summary_ko: '모든 AI 코딩 에이전트용 SKILL.md 범용 설치기',
    category_id: 'productivity',
    tags: ['installer', 'universal', 'skill-loader', 'cross-platform', 'npm'],
    stars: 0,
  },
  {
    slug: 'claude-command-suite',
    name: 'Claude Command Suite',
    name_ko: 'Claude 커맨드 스위트',
    github_url: 'https://github.com/qdhenry/Claude-Command-Suite',
    github_owner: 'qdhenry',
    github_repo: 'Claude-Command-Suite',
    description_en: '148+ professional slash commands covering code review, feature creation, security auditing, architecture analysis, and GitHub-Linear sync.',
    description_ko: '148개 이상의 전문 슬래시 커맨드. 코드 리뷰, 보안 감사, 아키텍처 분석, GitHub-Linear 동기화.',
    summary_en: '148+ slash commands for code review, security, and architecture',
    summary_ko: '코드 리뷰, 보안, 아키텍처 148개 슬래시 커맨드',
    category_id: 'productivity',
    tags: ['slash-commands', 'code-review', 'architecture', 'linear', 'github'],
    stars: 0,
  },
  {
    slug: 'flutter-e2e-skill',
    name: 'Flutter E2E Testing Bridge',
    name_ko: 'Flutter E2E 테스트 브릿지',
    github_url: 'https://github.com/ai-dashboad/flutter-skill',
    github_owner: 'ai-dashboad',
    github_repo: 'flutter-skill',
    description_en: 'E2E testing bridge for AI agents across 8 platforms: Flutter, iOS, Android, Web, Electron, Tauri, KMP, React Native. 181 tests passing.',
    description_ko: '8개 플랫폼(Flutter, iOS, Android, Web 등) E2E 테스트 브릿지. 181개 테스트 통과.',
    summary_en: 'Cross-platform E2E testing bridge for 8 platforms including Flutter',
    summary_ko: 'Flutter 등 8개 플랫폼 크로스 E2E 테스트',
    category_id: 'testing',
    tags: ['flutter', 'e2e', 'cross-platform', 'testing', 'mobile'],
    stars: 0,
  },
  {
    slug: 'full-delivery-workflow-skills',
    name: 'Full Delivery Workflow Skills',
    name_ko: '풀 딜리버리 워크플로우 스킬',
    github_url: 'https://github.com/levnikolaevich/claude-code-skills',
    github_owner: 'levnikolaevich',
    github_repo: 'claude-code-skills',
    description_en: 'Production-ready skills covering the full delivery workflow from research to epic planning, task breakdown, implementation, testing, and quality gates.',
    description_ko: '리서치부터 에픽 기획, 태스크 분해, 구현, 테스트, 품질 게이트까지 전체 딜리버리 워크플로우.',
    summary_en: 'Full delivery workflow from research to quality gates',
    summary_ko: '리서치부터 품질 게이트까지 전체 딜리버리 워크플로우',
    category_id: 'productivity',
    tags: ['agile', 'delivery', 'planning', 'quality-gates', 'workflow'],
    stars: 0,
  },
  {
    slug: 'devops-claude-skills',
    name: 'DevOps Skills Marketplace',
    name_ko: 'DevOps 스킬 마켓플레이스',
    github_url: 'https://github.com/ahmedasmar/devops-claude-skills',
    github_owner: 'ahmedasmar',
    github_repo: 'devops-claude-skills',
    description_en: 'Claude Code skills marketplace for DevOps workflows including CI/CD pipelines, infrastructure management, monitoring, and cloud operations.',
    description_ko: 'DevOps 워크플로우 전문 스킬. CI/CD 파이프라인, 인프라 관리, 모니터링, 클라우드 운영.',
    summary_en: 'DevOps skills for CI/CD, monitoring, and cloud operations',
    summary_ko: 'CI/CD, 모니터링, 클라우드 운영 DevOps 스킬',
    category_id: 'devops',
    tags: ['devops', 'cicd', 'monitoring', 'cloud', 'pipelines'],
    stars: 0,
  },
  {
    slug: 'ios-dev-guide-claude',
    name: 'iOS Dev Guide for Claude Code',
    name_ko: 'Claude Code iOS 개발 가이드',
    github_url: 'https://github.com/keskinonur/claude-code-ios-dev-guide',
    github_owner: 'keskinonur',
    github_repo: 'claude-code-ios-dev-guide',
    description_en: 'Comprehensive guide for Claude Code with PRD-driven workflows, extended thinking, and planning modes optimized for Swift/SwiftUI development.',
    description_ko: 'Claude Code iOS 개발 종합 가이드. PRD 기반 워크플로우, 확장 사고, Swift/SwiftUI 최적화 플래닝 모드.',
    summary_en: 'iOS development guide with PRD-driven workflows for Claude Code',
    summary_ko: 'Claude Code PRD 기반 iOS 개발 가이드',
    category_id: 'development',
    tags: ['ios', 'swift', 'swiftui', 'prd', 'ultrathink'],
    stars: 0,
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
