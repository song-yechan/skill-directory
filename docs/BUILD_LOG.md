# Build Log

> 작업 완료 시마다 이 파일에 기록 추가. 최신 항목이 위에 위치.

---

## 2026-02-18

### feat: 검색 품질 + Discover 정렬 + i18n fallback + 200 스킬 추가
- **검색 relevance scoring**: `src/lib/search.ts` 신규 — 가중치 기반 (name 100 > tag 40 > summary 15 > description 5 + stars boost)
- **Hero 검색 + Skills 목록**: relevance 정렬 적용, Map 기반 scoring
- **Discover New 탭**: `stars >= 50` 품질 필터 추가
- **Discover Trending 탭**: `good_count DESC` → snapshot delta 공식 (`Δviews + Δinstalls×5 + Δgood×10`)
- **Trending recency boost**: `recencyMultiplier = 1 + 30/daysSinceCreation` (popularity.ts + discover page)
- **i18n fallback**: description/summary에 `??` 양방향 fallback 추가 (skill-card, detail page)
- **Enrich 스크립트**: usage_guide 부분 enrichment 지원 (`isPartialEnrich` 모드)
- **신규 스킬 ~200개**: 188개 → 389개 (에이전트 병렬 리서치 + 삽입)

---

## 2026-02-17

### feat: 스킬 제보 이메일 알림 `3e8f737`
- **Resend** 이메일 발송 (무료 100건/일) + `POST /api/webhooks/skill-request`
- **pg_net 트리거**: `skill_requests` INSERT → webhook 자동 호출 (Supabase Dashboard 설정 불필요)
- **보안**: webhook secret 검증 + escapeHtml XSS 방지
- **신규 파일**: `src/app/api/webhooks/skill-request/route.ts`, `supabase/migrations/009`
- **Vercel 환경변수**: RESEND_API_KEY, WEBHOOK_SECRET, ADMIN_EMAIL

### chore: 신규 스킬 10개 DB 추가 (총 188개)
- 웹 리서치 → 22개 후보 중 15개 선별, 5개 기존 중복 제외 → 10개 신규 삽입
- Context Engineering Kit (NeoLabHQ), Cloudflare Skills (jezweb), Skill Factory (alirezarezvani)
- Token-Optimized Marketplace (mhattingpete), 100 Agents (lodetomasi), PaaS Skills (oaustegard)
- FeatBit Feature Flags, PICT Combinatorial Testing, Local Marketplace (dashed), Skills Lab (panaversity)

### feat: API rate limiting — 하이브리드 방어 `d87912d`
- **미들웨어**: `/api/*` matcher 추가, GET 60req/min, POST/DELETE 20req/min (in-memory fixed window)
- **Supabase RPC**: `check_rate_limit()` — vote 10req/min, install 10req/min (DB-level atomic)
- **IP 보안**: `x-real-ip` 우선 (Vercel, 위조 불가) + 공유 유틸 `src/lib/ip.ts`
- **RLS**: `api_rate_limits` 테이블 직접 접근 차단, 함수 실행 권한만 부여
- **신규 파일**: `src/lib/rate-limit.ts`, `src/lib/ip.ts`, `supabase/migrations/007-008`
- **수정**: `middleware.ts` (API 분기), `vote/route.ts`, `install/route.ts` (RPC 체크)
- **버그 수정**: install source 검증에 `'find-skill'` 누락 → 추가

### feat: /find-skill 스마트 추천 + 구분선 출력 형식 확정
- 환경 분석: 설치된 스킬 스캔 + CLAUDE.md/package.json 기반 프로젝트 컨텍스트 감지
- 4단계 필터링: 설치 제외 → 검색어 오탐 제거 → 프로젝트 컨텍스트 필터 → 관련성 정렬
- 구분선 카드 형식 출력 확정 (이름+설명+추천사유)
- API 보안: `sanitizeFilter()` PostgREST filter injection 방지 `2b69717`
- API 검색: tags 필드 포함 (`tags.cs.{lower}`) `73b939a`

### refactor: CATEGORY_LABELS/COLORS 공유 상수 추출 `410add7`
- `src/lib/constants.ts` 생성 — `CATEGORY_LABELS`, `CATEGORY_COLORS` 중앙화
- 4개 파일(skill-card, my-skills-list, usage-pattern, dashboard-summary) import 전환

### chore: 신규 스킬 19개 DB 추가 + /find-skill 강화
- 웹 리서치 → 25개 후보 중 19개 신규 삽입 (총 178개)
- 공식 벤더(Supabase, Vercel, DigitalOcean), 보안(Trail of Bits, SecOps), 게임엔진(Godot, Unreal, Unity) 등
- `/find-skill` SKILL.md 가독성 개선 — 목적/사용법/설치 워크플로우 재구성
- T6(npm CLI) → AI-native 전환: SKILL.md 기반 검색+설치 (CLI 불필요)
- `scripts/add-new-skills.ts` 시드 스크립트 추가

---

## 2026-02-16

### feat: 실시간 검색 + 관련 스킬 + API 개선 `9f8db0b`
- 실시간 debounce 검색 (300ms) + 태그 매칭 + 빈 결과 시 인기 태그 추천
- Hero 검색 드롭다운 프리뷰 (200ms, 상위 5개)
- 스킬 상세 하단 관련 스킬 4개 (같은 카테고리 + 공통 태그 정렬)
- API: `createPublicClient` + name_ko/summary 검색 + tag 파라미터 + views 정렬 + CORS
- `/find-skill` Claude 스킬 생성, README API 문서 추가, `.env.local.example` 생성
- `useDebounce` 공용 훅 (`src/hooks/use-debounce.ts`)

### docs: CLAUDE.md 최적화 + Phase 2 플랜 리라이트 `fd376a8`
- CLAUDE.md에 DB Schema 섹션 추가 (RPCs, migration 포함)
- Phase 2 플랜을 Sprint 기반으로 재구성 + Resume Prompt 추가

### docs: 문서 동기화 `5f6a58e`
- 문서 감사 — CLAUDE.md, Phase 2 체크박스, MEMORY.md 일괄 업데이트

### fix: 투표/설치/이름 i18n/필터 속도 `1ca647c`
- 투표/설치 API: `createAdminClient` → `createPublicClient` + SECURITY DEFINER RPC
- `vote-button.tsx`, `install-command.tsx`: `response.ok` 검증 추가
- 한국어 전용 name 7개 → name_ko 분리, 영문 name 복원
- 스킬 목록: `searchParams`(Dynamic) → 클라이언트 필터링(SSG) — `SkillsListClient` 생성
- `history.replaceState`로 URL 동기화 (서버 재렌더 방지)

### feat: SEO 메타데이터 + 정적 빌드 `470e3bc`
- `generateMetadata` (홈, 목록, 상세), `sitemap.ts`, `robots.ts`, JSON-LD
- `generateStaticParams` — 인기 스킬 50개 사전 빌드

### feat: usage_guide_en i18n `b654936`
- 영문 사용 가이드 필드 추가

### docs: README + Phase 2 플랜 `6509dd5`
- README.md 전면 재작성, Phase 2 Growth Plan 초안

### fix: 데이터 품질 개선 `17741be` `9613fa3` `0172b99` `88d672d`
- enrich 모델: gemini-2.0-flash → gemini-2.5-flash
- seed 필터: name/description에 "claude" 필수
- enriched 데이터 seed upsert 시 보존, New 배지 repo creation date 기준

### feat: trending + popularity 점수 `bcb5e43` `50500c2` `b555ad6`
- 인기: `stars×0.01 + views×1 + installs×5 + good×10 - bad×10`
- 트렌딩: 주간 스냅샷 delta, `refresh-snapshots.ts` 스크립트

### feat: 설치 추적 + NEW 배지 `a85dc09` `0a7d42b`
- 복사 시 설치 추적 (localStorage dedup), NEW 배지 7일 → 3일

### feat: GitHub Actions 자동화 `489f3cc`
- 주간 cron (월 4AM KST): seed → enrich

### feat: 투표 + 홈 랭킹 + 병렬 쿼리 `bf5b89f`
- 익명 투표 (localStorage), 홈 인기/트렌딩 정렬, `Promise.all` 병렬

### perf: Vercel 리전 서울 `b4b01be`
- `vercel.json`에 `icn1` 리전 설정

### fix: 공식 스킬 처리 `14bd561` `d62165e` `10fc5a1`
- 공식(Anthropics) 스킬 홈 제외 → 복원, stars 리셋, Official 배지 상세만

### feat: GNB + All Skills 페이지 `0284fb4` `fda6401` `3aa11b2` `c4f78ec`
- GNB 네비게이션, 전체 스킬 페이지 (검색/카테고리/태그/정렬)
- `setRequestLocale` ISR/SSG 지원, About 페이지 public client 전환

## 2026-02-15

### feat: Discover + AI enrichment `0972c99` `6bfeac6` `14c8b0b`
- Discover 페이지 (New/Trending 탭)
- AI enrichment: Groq Llama 3.1 → Gemini 2.5 Flash, 로딩 스켈레톤

### feat: 마크다운 + 공식 배지 + About `4e503d3`
- MarkdownRenderer, Official 배지, About 페이지 리디자인

### feat: Phase 1 기초 `fec0ce1` `08c810e` `37b6176`
- 스킬 seed 스크립트, skill-card 'use client', 공식 스킬명 정리

### feat: UI 디자인 `61bff53` `b5dcbf4`
- 홈페이지 디자인 시스템, 스킬 상세 2컬럼 레이아웃

### feat: 프로젝트 초기화 `240639f` `bc42273` `0357170`
- 구현 플랜, Next.js 스캐폴딩, 자격 증명 가이드
