# Claude Skill Hub

> Discover, vote, and install Claude Code skills — all in one place.

**Live:** [skill-directory-livid.vercel.app](https://skill-directory-livid.vercel.app)

## What is this?

Claude Skill Hub automatically collects Claude Code skills from GitHub, enriches them with AI-generated descriptions (Korean/English), and lets the community vote and track installs. Think of it as an app store for Claude Code skills.

### Key Features

- **Auto-collection** — GitHub topic/keyword search finds Claude Code skill repos weekly
- **AI enrichment** — Gemini 2.5 Flash generates structured descriptions, usage guides, and Korean translations
- **Community signals** — Vote (good/bad), view count, install tracking
- **Trending** — Weekly snapshot-based delta scoring surfaces rising skills
- **Bilingual** — Full Korean/English support via next-intl
- **Search & Filter** — By category, tags, sort (popular, trending, stars, recent)
- **Real-time search** — Debounced instant filtering with tag search, Hero dropdown preview
- **Related skills** — Tag-overlap based recommendations on skill detail pages
- **Public API** — `GET /api/skills` with CORS support for external integrations

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
# Clone
git clone https://github.com/song-yechan/skill-directory.git
cd skill-directory

# Install
npm install

# Environment variables
cp .env.local.example .env.local
# Fill in: NEXT_PUBLIC_SUPABASE_URL, NEXT_PUBLIC_SUPABASE_ANON_KEY,
#          SUPABASE_SERVICE_ROLE_KEY, GEMINI_API_KEY

# Dev server
npm run dev
```

## Scripts

| Script | Purpose |
|--------|---------|
| `npx tsx scripts/seed-skills.ts` | Collect skills from GitHub → Supabase |
| `npx tsx scripts/enrich-skills.ts` | AI-enrich skills missing Korean descriptions |
| `npx tsx scripts/refresh-snapshots.ts` | Snapshot current counts for trending delta |
| `npx tsx scripts/migrate-snapshots.ts` | Initialize snapshot columns (one-time) |

## Architecture

```
src/
├── app/[locale]/
│   ├── page.tsx              # Home (Hero + Trending + New)
│   ├── skills/page.tsx       # All Skills (search/filter/sort)
│   ├── skills/[slug]/page.tsx # Skill detail
│   ├── discover/page.tsx     # Discover (New/Trending tabs)
│   └── about/page.tsx        # About
├── hooks/
│   └── use-debounce.ts       # Debounce hook for real-time search
├── components/
│   ├── layout/               # Header, Footer, LocaleSwitcher
│   ├── skills/               # SkillCard, CategoryBar, VoteButton, etc.
│   └── ui/                   # MarkdownRenderer
├── lib/
│   ├── supabase/             # public, server, client, admin
│   └── popularity.ts         # Scoring algorithms
└── i18n/                     # Routing + request config

scripts/                      # Seed, enrich, snapshot scripts
.github/workflows/            # Weekly cron (seed + enrich)
supabase/migrations/          # DB schema
```

### Data Pipeline

```
GitHub API → seed-skills.ts → Supabase → enrich-skills.ts → AI descriptions
                                  ↓
                         Weekly cron (GitHub Actions)
                                  ↓
                     refresh-snapshots.ts → Trending scores
```

### Popularity Score

```
score = stars × 0.01 + views × 1 + installs × 5 + good × 10 - bad × 10
```

### Trending Score (weekly delta)

```
trending = Δviews + Δinstalls × 5 + Δgood × 10
```

## API

### `GET /api/skills`

Public REST API with CORS support. Useful for building custom integrations or Claude Code skills.

| Parameter | Type | Default | Description |
|-----------|------|---------|-------------|
| `q` | string | — | Search query (name, description, summary) |
| `category` | string | — | Category filter |
| `tag` | string | — | Tag filter (exact match) |
| `sort` | string | `stars` | Sort by: stars, good, installs, views, recent |
| `limit` | number | `50` | Results per page (max 100) |
| `offset` | number | `0` | Pagination offset |

```bash
curl "https://skill-directory-livid.vercel.app/api/skills?q=test&sort=installs&limit=10"
```

## License

MIT
