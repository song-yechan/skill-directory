# Skill Directory — Project Rules

## Overview
Claude Code 스킬 AI-native 디렉토리. GitHub 자동 수집 + 커뮤니티 투표 + 설치 추적.

- **Live**: https://skill-directory-livid.vercel.app
- **GitHub**: https://github.com/song-yechan/skill-directory
- **Design**: `docs/plans/2026-02-15-skill-directory-design.md`

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Supabase (PostgreSQL + Auth)
- next-intl (ko/en i18n)
- Tailwind CSS 4 + CSS Variables (no shadcn)
- Vercel 배포 (ISR 60s)

## Architecture

### Pages
| Route | 역할 | 데이터 소스 |
|-------|------|------------|
| `/[locale]` | 홈 허브 (Hero + Trending 5 + New 5) | `createPublicClient` + ISR |
| `/[locale]/skills` | 전체 스킬 (검색/카테고리/태그/정렬) | `createPublicClient` + ISR |
| `/[locale]/skills/[slug]` | 스킬 상세 (locale별 가이드 분기) | `createPublicClient` + ISR |
| `/[locale]/discover` | New/Trending 탭 (30개) | `createPublicClient` + ISR |
| `/[locale]/about` | 소개 | Static |

### Supabase Clients
- **`lib/supabase/public.ts`**: 쿠키 없음 → ISR/정적 캐싱 가능. **읽기 전용 페이지 + API 라우트에 사용**.
- **`lib/supabase/server.ts`**: 쿠키 기반 → 인증 필요한 API/Server Action에 사용.
- **`lib/supabase/client.ts`**: 브라우저 클라이언트 → 클라이언트 컴포넌트에서 사용.
- **`lib/supabase/admin.ts`**: 서비스 키 → 스크립트/관리용 (API 라우트에서는 사용하지 않음).

### Supabase RPCs (SECURITY DEFINER)
- **`adjust_vote_count(p_skill_id, p_vote_type, p_delta)`**: 원자적 투표 증감. anon key로 호출 가능.
- **`track_install(p_skill_id, p_source)`**: 설치 기록 + 카운트 증가 (trigger 연동).
- **`increment_view(p_skill_id)`**: 뷰 카운트 증가.

### Components
- `components/layout/` — Header (GNB), Footer, LocaleSwitcher
- `components/skills/` — SkillCard, HeroSection, SkillsListClient (검색/필터/정렬 통합), VoteButton, InstallCommand
- `components/auth/` — GitHubLoginButton
- `components/ui/` — MarkdownRenderer

### Data Pipeline
- **`scripts/seed-skills.ts`** — GitHub 수집 (topic + keyword, "claude" 필수 필터)
- **`scripts/enrich-skills.ts`** — Gemini 2.5 Flash AI 보강 (ko/en 설명 + usage guide)
- **`scripts/refresh-snapshots.ts`** — 주간 스냅샷 (trending delta 계산용)
- **`.github/workflows/update-skills.yml`** — 주간 cron (월 4AM KST)

### Scoring
- **Popularity**: `stars×0.01 + views×1 + installs×5 + good×10 - bad×10` (`lib/popularity.ts`)
- **Trending**: `Δviews + Δinstalls×5 + Δgood×10` (주간 snapshot delta)

### i18n
- 메시지: `messages/ko.json`, `messages/en.json`
- 새 텍스트 추가 시 **반드시 ko/en 둘 다** 업데이트
- 네임스페이스: `common`, `home`, `allSkills`, `discover`, `detail`, `about`, `metadata`, `skill`
- DB 필드 i18n: `name_ko`, `description_ko/en`, `summary_ko/en`, `usage_guide/usage_guide_en`
- 상세 페이지/카드: `locale === 'ko' ? skill.name_ko ?? skill.name : skill.name` 패턴
- 상세 페이지: locale에 따라 분기 + fallback (ko 없으면 en, en 없으면 ko)

### SEO
- **generateMetadata**: 홈, 스킬 목록, 스킬 상세 페이지에 적용
- **sitemap.ts**: `app/sitemap.ts` — 전체 스킬 (ko/en) + 정적 페이지
- **robots.ts**: `app/robots.ts` — 모든 크롤러 허용
- **JSON-LD**: 스킬 상세 페이지에 `SoftwareApplication` 스키마
- **generateStaticParams**: 인기 스킬 50개 사전 빌드 (ko/en)

## Performance Rules
- 읽기 전용 페이지는 `createPublicClient()` + `export const revalidate = 60` 필수
- 홈페이지 등 다중 쿼리 시 `Promise.all` 병렬 fetch
- 이미지/아이콘은 lucide-react 사용 (외부 이미지 최소화)
- 스킬 목록 페이지: 서버에서 전체 fetch → `SkillsListClient`에서 클라이언트 필터/정렬 (SSG 가능)
- vote/install API에서 `revalidatePath`로 ISR 캐시 즉시 무효화

## Coding Conventions
- CSS: Tailwind 유틸리티 + `var(--accent)`, `var(--text-primary)` 등 CSS 변수 사용
- Server Component 기본, 인터랙션 필요한 것만 `'use client'`
- 필터/정렬: 클라이언트 사이드 상태 관리 + `history.replaceState`로 URL 동기화 (서버 재렌더 방지)
- API 라우트: `createPublicClient` + SECURITY DEFINER RPC 사용 (admin client 의존 금지)
- Immutability 준수 (global CLAUDE.md)

## Plans
- **Phase 1 설계**: `docs/plans/2026-02-15-skill-directory-design.md` — 11 Task, 완료
- **Phase 2 성장**: `docs/plans/2026-02-16-phase2-growth.md` — SEO, 마케팅, 커뮤니티, KPI
  - A2 SEO 완료: generateMetadata, sitemap, robots.txt, JSON-LD, generateStaticParams
  - 148개 스킬 enrichment 완료 (description_ko/en, usage_guide/en, summary, tags)
  - 투표/설치 API 수정: SECURITY DEFINER RPC + revalidatePath + 클라이언트 에러 핸들링
  - name_ko 추가: DB 컬럼 + locale별 렌더링 + 한국어 이름 7개 데이터 수정
  - 스킬 목록 필터 속도 개선: 서버 searchParams → 클라이언트 사이드 필터링 (Dynamic → SSG)

## Documentation Maintenance
**매 작업 완료 시 이 파일을 업데이트하라:**
- 새 페이지/컴포넌트 추가 → Architecture 섹션 반영
- 새 i18n 네임스페이스 → i18n 섹션 반영
- 패턴 변경 → Coding Conventions 반영
- 성능 관련 변경 → Performance Rules 반영
- 새 스크립트/파이프라인 → Data Pipeline 섹션 반영
