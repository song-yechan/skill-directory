# Claude Skill Hub

> Discover, vote, and install Claude Code skills — all in one place.

**Live:** [skill-directory-livid.vercel.app](https://skill-directory-livid.vercel.app)

## What is this?

Claude Code 스킬을 GitHub에서 자동 수집하고, AI로 보강하고, 커뮤니티가 투표하고, 한 번에 설치할 수 있는 플랫폼입니다.

## Use Skills in Claude Code

### `/find-skill` — AI 기반 스킬 검색 & 설치

Claude Code 안에서 바로 스킬을 검색하고 설치할 수 있습니다.

**설치:**
```bash
mkdir -p ~/.claude/skills/find-skill
curl -fsSL https://raw.githubusercontent.com/song-yechan/skill-directory/main/skills/find-skill/SKILL.md \
  -o ~/.claude/skills/find-skill/SKILL.md
```

**사용:**
```
> /find-skill 테스트 자동화 스킬 찾아줘
> /find-skill commit 관련 좋은 스킬 없을까?
```

### 스마트 추천 흐름

```
사용자: "design 관련 스킬 찾아줘"
          │
          ▼
┌─ Step 1: 환경 분석 ──────────────────┐
│  ~/.claude/skills/ 스캔 → 설치 목록   │
│  CLAUDE.md, package.json → 스택 감지  │
└──────────────────────────────────────┘
          │
          ▼
┌─ Step 2: API 검색 ───────────────────┐
│  GET /api/skills?q=design&limit=20   │
└──────────────────────────────────────┘
          │
          ▼
┌─ Step 3: 필터링 ────────────────────┐
│  3-1. 이미 설치된 스킬 제외          │
│  3-2. 검색어 오탐 제거               │
│  3-3. 프로젝트 컨텍스트 필터         │
│  3-4. 관련성 정렬 + 상위 선택        │
└──────────────────────────────────────┘
          │
          ▼
┌─ Step 4: 결과 출력 ─────────────────┐
│  프로젝트: Next.js + TypeScript      │
│  설치 완료: ui-ux-pro-max (1개 제외) │
│                                      │
│  #1  Frontend Design (설치 134)      │
│      프론트엔드 UI 디자인/구현       │
│      → Tailwind 프로젝트에 적합      │
│  ─────────────────────────────────   │
│  #2  Canvas Design (설치 118)        │
│      독창적인 시각 디자인 창작       │
└──────────────────────────────────────┘
          │
          ▼
  사용자: "1번 설치해줘" → 자동 다운로드 + 설치 추적
```

### Web UI

웹 브라우저에서도 스킬을 탐색할 수 있습니다:
- **홈**: 인기 스킬 + 트렌딩
- **전체 스킬**: 검색 + 카테고리/태그 필터 + 정렬
- **스킬 상세**: 사용법 + 관련 스킬 추천
- **Discover**: 신규/트렌딩 탭

## Key Features

- **Auto-collection** — GitHub에서 Claude Code 스킬 자동 수집 (주간 cron)
- **AI enrichment** — Gemini 2.5 Flash로 한/영 설명 자동 생성
- **Community signals** — 투표 (good/bad) + 뷰 카운트 + 설치 추적
- **Trending** — 주간 스냅샷 기반 상승 스킬 감지
- **Bilingual** — 한국어/영어 완전 지원 (next-intl)
- **Public API** — `GET /api/skills` CORS 지원

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 16 (App Router) + React 19 |
| Language | TypeScript 5 |
| Database | Supabase (PostgreSQL) |
| Styling | Tailwind CSS 4 |
| i18n | next-intl (ko/en) |
| AI | Gemini 2.5 Flash (enrichment) |
| Hosting | Vercel (ICN region) |
| CI/CD | GitHub Actions (weekly cron) |

## Getting Started

```bash
git clone https://github.com/song-yechan/skill-directory.git
cd skill-directory
npm install

cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY

npm run dev
```

## API

### `GET /api/skills`

Public REST API with CORS support.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | 키워드 검색 (이름, 설명, 태그) |
| `category` | string | — | 카테고리 필터 |
| `tag` | string | — | 태그 필터 (exact match) |
| `sort` | string | `stars` | 정렬: stars, good, installs, views, recent |
| `limit` | number | `50` | 결과 수 (max 100) |
| `offset` | number | `0` | 페이지네이션 |

```bash
curl "https://skill-directory-livid.vercel.app/api/skills?q=test&sort=installs&limit=10"
```

**카테고리:** development, testing, devops, productivity, docs, other

## Scripts

| Script | Purpose |
|--------|---------|
| `npx tsx scripts/seed-skills.ts` | GitHub에서 스킬 수집 → Supabase |
| `npx tsx scripts/enrich-skills.ts` | AI로 한/영 설명 생성 |
| `npx tsx scripts/refresh-snapshots.ts` | 트렌딩 계산용 주간 스냅샷 |

## Scoring

**Popularity:**
```
stars × 0.01 + views × 1 + installs × 5 + good × 10 - bad × 10
```

**Trending (weekly delta):**
```
Δviews + Δinstalls × 5 + Δgood × 10
```

## License

MIT
