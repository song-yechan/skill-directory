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
| `votes` | user_id (NOT NULL), skill_id, vote_type | 로그인 시 기록, 비로그인은 RPC only |
| `installs` | skill_id, user_id (nullable), source | 로그인 시 user_id 기록 + trigger → install_count |
| `skill_requests` | user_id, github_url, description, status | 스킬 제보 (pending/approved/rejected) |
| `api_rate_limits` | identifier(md5), endpoint, window_start, request_count | 쓰기 API rate limit |

### RPCs (SECURITY DEFINER — anon key로 호출 가능)
- `adjust_vote_count(p_skill_id, p_vote_type, p_delta)` — 원자적 투표 증감 (비로그인용)
- `track_install(p_skill_id, p_source, p_user_id?)` — 설치 기록 + 카운트 (로그인 시 중복 방지)
- `increment_view(p_skill_id)` — 뷰 카운트
- `get_user_dashboard(p_user_id)` — 대시보드 데이터 (installs + votes + requests)
- `check_rate_limit(p_identifier, p_endpoint, p_limit, p_window_seconds)` — 쓰기 엔드포인트 rate limit (atomic upsert)

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
| `/[locale]/skills/[slug]` | 스킬 상세 + 관련 스킬 4개 | SSG (top 50) + ISR |
| `/[locale]/discover` | New/Trending 탭 | Dynamic |
| `/[locale]/dashboard` | 사용자 대시보드 (설치/투표/제보) | Dynamic |
| `/[locale]/about` | 소개 | Static |

### Supabase Clients
- **`public.ts`**: 읽기 전용 페이지 + API 라우트. ISR 캐싱 가능.
- **`server.ts`**: 쿠키 기반 인증. Server Action용.
- **`client.ts`**: 브라우저 클라이언트 컴포넌트용.
- **`admin.ts`**: 서비스 키. **스크립트 전용** (API 라우트 금지).

### Auth (Google OAuth)
- Provider: Google (Supabase Auth)
- Middleware: `src/middleware.ts` — next-intl + Supabase 세션 갱신 통합
- Callback: `src/app/[locale]/auth/callback/route.ts` — code → session 교환
- UI: `GoogleLoginButton` — `onAuthStateChange`로 로그인/로그아웃 자동 전환
- **OAuth 작업 체크리스트**: ①콜백 URL (locale prefix 필수) ②미들웨어 세션 갱신 ③로그인 상태 UI

### Key Components
- `SkillsListClient` — 실시간 debounce 검색 (300ms) + 카테고리/태그/정렬 통합 + 빈 결과 시 인기 태그 추천
- `HeroSection` — Hero 검색 + 드롭다운 프리뷰 (200ms debounce, 상위 5개)
- `SkillCard` — 스킬 카드 (name_ko fallback 포함)
- `VoteButton` / `InstallCommand` — RPC 호출 + localStorage 중복 방지. 로그인 시 votes/installs 테이블에 user_id 자동 기록
- `useDebounce` — `src/hooks/use-debounce.ts` 공용 debounce 훅
- `CATEGORY_LABELS` / `CATEGORY_COLORS` — `src/lib/constants.ts` 공유 상수 (4개 컴포넌트에서 import)

### API
- `GET /api/skills` — 공개 REST API (CORS 지원)
  - 파라미터: `q`, `category`, `tag`, `sort`, `limit`, `offset`
  - 검색 대상: name, name_ko, summary_ko/en, description_ko/en
  - 정렬: stars, good, installs, views, recent
- **Rate Limiting** (하이브리드):
  - 미들웨어 (in-memory): GET 60req/min, POST/DELETE 20req/min per IP
  - Supabase RPC (`check_rate_limit`): vote 10/min, install 10/min per IP (DB-level atomic)
  - 429 응답: `{ error: "Too many requests" }` + `Retry-After` 헤더

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
- 네임스페이스: `common`, `home`, `allSkills`, `discover`, `detail`, `about`, `metadata`, `skill`, `dashboard`
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
- **Phase 2**: A1/A2 완료, Sprint 1-2 완료, **대시보드 완료**, `/find-skill` 스마트 추천 완료 (환경 분석 + 구분선 형식), 188개 스킬, API 보안(sanitizeFilter) → `docs/plans/2026-02-17-user-dashboard.md`
- **마케팅**: Phase 0 완료, Phase 1 (커뮤니티 시딩) 대기 → `docs/plans/2026-02-16-marketing-plan.md`

## Documentation Maintenance
매 작업 완료 시 아래 3개 파일 업데이트:
1. **이 파일 (CLAUDE.md)** — 아키텍처/컨벤션 변경 시
2. **Phase 2 플랜** — 체크박스 업데이트
3. **`docs/BUILD_LOG.md`** — 커밋 해시 + 변경 요약 추가 (최신이 위, 날짜별 그룹)
