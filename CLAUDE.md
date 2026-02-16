# Skill Directory — Project Rules

## Overview
Claude Code 스킬 AI-native 디렉토리. GitHub 자동 수집 + 커뮤니티 투표 + 설치 추적.

- **Live**: https://skill-directory-livid.vercel.app
- **GitHub**: https://github.com/song-yechan/skill-directory
- **Phase 2 Plan**: `docs/plans/2026-02-16-phase2-growth.md` ← compact 후 이 파일부터 읽기

## Stack
- Next.js 16 (App Router) + React 19 + TypeScript 5
- Supabase (PostgreSQL + Auth) — 싱가포르, ref: `ktspcmbjksxwbwtdgggy`
- next-intl (ko/en i18n)
- Tailwind CSS 4 + CSS Variables (no shadcn)
- Vercel 배포 (ISR 60s, 리전: icn1)

## DB Schema

| 테이블 | 주요 컬럼 | 비고 |
|--------|----------|------|
| `skills` | id, slug, name, name_ko, description_ko/en, summary_ko/en, usage_guide/en, category_id, tags[], stars, view/install/good/bad_count, *_snapshot | 메인 테이블 |
| `categories` | id, name_ko, name_en, icon, sort_order | 6개 고정 |
| `votes` | user_id (NOT NULL), skill_id, vote_type | 현재 미사용 (익명 투표는 RPC) |
| `installs` | skill_id, user_id (nullable), source | trigger → install_count 증가 |

### RPCs (SECURITY DEFINER — anon key로 호출 가능)
- `adjust_vote_count(p_skill_id, p_vote_type, p_delta)` — 원자적 투표 증감
- `track_install(p_skill_id, p_source)` — 설치 기록 + 카운트
- `increment_view(p_skill_id)` — 뷰 카운트

### Migration
```bash
supabase db push  # linked project로 자동 적용
```

## Architecture

### Pages
| Route | 역할 | 렌더링 |
|-------|------|--------|
| `/[locale]` | 홈 (Hero + Popular 5 + Trending 5) | SSG + ISR 60s |
| `/[locale]/skills` | 전체 스킬 (클라이언트 필터/정렬) | SSG + ISR 60s |
| `/[locale]/skills/[slug]` | 스킬 상세 | SSG (top 50) + ISR |
| `/[locale]/discover` | New/Trending 탭 | Dynamic |
| `/[locale]/about` | 소개 | Static |

### Supabase Clients
- **`public.ts`**: 읽기 전용 페이지 + API 라우트. ISR 캐싱 가능.
- **`server.ts`**: 쿠키 기반 인증. Server Action용.
- **`client.ts`**: 브라우저 클라이언트 컴포넌트용.
- **`admin.ts`**: 서비스 키. **스크립트 전용** (API 라우트 금지).

### Key Components
- `SkillsListClient` — 검색/카테고리/태그/정렬 통합 (클라이언트 사이드, SSG 가능)
- `SkillCard` — 스킬 카드 (name_ko fallback 포함)
- `VoteButton` / `InstallCommand` — RPC 호출 + response.ok 검증 + localStorage 중복 방지

### Data Pipeline
- `scripts/seed-skills.ts` — GitHub 수집 ("claude" 필수 필터)
- `scripts/enrich-skills.ts` — Gemini 2.5 Flash AI 보강 (ko/en)
- `scripts/refresh-snapshots.ts` — 주간 스냅샷 (trending delta)
- `.github/workflows/update-skills.yml` — 주간 cron (월 4AM KST)

### Scoring
- **Popularity**: `stars×0.01 + views×1 + installs×5 + good×10 - bad×10`
- **Trending**: `Δviews + Δinstalls×5 + Δgood×10` (주간 snapshot delta)

### i18n
- 메시지: `messages/ko.json`, `messages/en.json` — 새 텍스트 추가 시 **반드시 양쪽 다**
- 네임스페이스: `common`, `home`, `allSkills`, `discover`, `detail`, `about`, `metadata`, `skill`
- DB i18n 패턴: `locale === 'ko' ? skill.name_ko ?? skill.name : skill.name`

### SEO
- `generateMetadata` (홈, 목록, 상세) + `sitemap.ts` + `robots.ts` + JSON-LD + `generateStaticParams`

## Rules

### Performance
- 읽기 전용 → `createPublicClient()` + `revalidate = 60`
- 다중 쿼리 → `Promise.all` 병렬
- 목록 필터 → 서버 1회 fetch + 클라이언트 필터/정렬 (서버 재렌더 방지)
- 쓰기 API → `revalidatePath`로 ISR 캐시 즉시 무효화

### Coding
- CSS: Tailwind + CSS Variables (`var(--accent)` 등)
- Server Component 기본, 인터랙션만 `'use client'`
- API 라우트: `createPublicClient` + RPC (admin client 금지)
- Immutability 준수 (global CLAUDE.md)

## Progress
- **Phase 1**: 완료 (`docs/plans/2026-02-15-skill-directory-design.md`)
- **Phase 2**: A1/A2 완료, **A3부터 진행** → `docs/plans/2026-02-16-phase2-growth.md`

## Documentation Maintenance
매 작업 완료 시 이 파일 + Phase 2 플랜의 체크박스 업데이트.
