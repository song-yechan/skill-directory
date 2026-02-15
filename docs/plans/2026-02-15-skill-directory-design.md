# Claude Skill Directory — Implementation Plan

> **For Claude:** REQUIRED SUB-SKILL: Use superpowers:executing-plans to implement this plan task-by-task.

**Goal:** GitHub에서 Claude Code 스킬을 자동 수집하고, AI 구조화 추출 + 커뮤니티 투표 + 설치 추적으로 최고의 스킬을 발견할 수 있는 AI-native 디렉토리 서비스를 구축한다.

**Architecture:** Next.js 15 (App Router) + Supabase로 웹사이트/API를 구축하고, GitHub API 크롤러가 스킬을 수집하여 Claude API로 구조화 추출 후 DB에 저장한다. 3개 인터페이스(웹사이트, REST API, Claude Code 스킬)를 제공하며, 설치/뷰/투표 데이터를 통해 플랫폼 고유 시그널을 축적한다.

**Tech Stack:** Next.js 15 (App Router), Supabase (DB + Auth + Edge Functions), next-intl (i18n: ko/en), Tailwind CSS 4, @supabase/ssr, GitHub REST API, Claude API (구조화 추출)

**Project Root:** `/Users/ab180-yechan-mbp/projects/skill-directory/`

---

## 디렉토리 구조 (최종)

```
skill-directory/
├── docs/plans/                     # 플랜 문서
├── messages/                       # i18n 번역 파일
│   ├── en.json
│   └── ko.json
├── supabase/
│   ├── migrations/                 # DB 마이그레이션
│   └── functions/                  # Edge Functions
│       └── collect-skills/         # 스킬 수집 크론
├── src/
│   ├── app/
│   │   ├── [locale]/               # i18n 라우팅
│   │   │   ├── layout.tsx          # 로케일 레이아웃
│   │   │   ├── page.tsx            # 홈 (스킬 목록)
│   │   │   ├── skills/
│   │   │   │   └── [slug]/
│   │   │   │       └── page.tsx    # 스킬 상세
│   │   │   ├── about/
│   │   │   │   └── page.tsx        # 소개
│   │   │   └── auth/
│   │   │       └── callback/
│   │   │           └── route.ts    # OAuth 콜백
│   │   └── api/
│   │       ├── skills/
│   │       │   ├── route.ts        # GET /api/skills (검색)
│   │       │   └── [id]/
│   │       │       ├── route.ts    # GET /api/skills/:id
│   │       │       ├── vote/
│   │       │       │   └── route.ts # POST 투표
│   │       │       └── install/
│   │       │           └── route.ts # POST 설치 추적
│   │       └── health/
│   │           └── route.ts        # 헬스체크
│   ├── components/
│   │   ├── layout/
│   │   │   ├── header.tsx
│   │   │   ├── footer.tsx
│   │   │   └── locale-switcher.tsx
│   │   ├── skills/
│   │   │   ├── skill-card.tsx
│   │   │   ├── skill-grid.tsx
│   │   │   ├── skill-detail.tsx
│   │   │   ├── skill-filters.tsx
│   │   │   ├── skill-search.tsx
│   │   │   └── vote-button.tsx
│   │   └── auth/
│   │       └── github-login-button.tsx
│   ├── lib/
│   │   ├── supabase/
│   │   │   ├── client.ts           # 브라우저 클라이언트
│   │   │   ├── server.ts           # 서버 클라이언트
│   │   │   └── types.ts            # DB 타입 (generated)
│   │   ├── github/
│   │   │   └── collector.ts        # GitHub API 수집 로직
│   │   └── ai/
│   │       └── extractor.ts        # Claude API 구조화 추출
│   ├── i18n/
│   │   ├── routing.ts
│   │   └── request.ts
│   └── middleware.ts               # next-intl + Supabase 통합
├── .env.local                      # 환경변수
├── next.config.ts
├── tailwind.config.ts
├── tsconfig.json
└── package.json
```

---

## Supabase 스키마

```sql
-- 카테고리 (6개 고정)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,                    -- 'development', 'testing', etc.
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  icon TEXT NOT NULL,                     -- emoji or icon name
  sort_order INT NOT NULL DEFAULT 0
);

-- 스킬
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,              -- URL-friendly identifier
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  github_url TEXT NOT NULL,
  stars INT NOT NULL DEFAULT 0,
  forks INT NOT NULL DEFAULT 0,
  last_github_update TIMESTAMPTZ,

  -- 구조화 추출 데이터
  name TEXT NOT NULL,
  description_en TEXT,
  description_ko TEXT,
  summary_en TEXT,                        -- AI 생성 한줄 요약
  summary_ko TEXT,
  install_guide TEXT,                     -- 설치법 (markdown)
  usage_guide TEXT,                       -- 사용법 (markdown)
  examples TEXT,                          -- 예시 (markdown)
  readme_raw TEXT,                        -- 원본 README

  category_id TEXT REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',

  -- 플랫폼 시그널
  view_count INT NOT NULL DEFAULT 0,
  install_count INT NOT NULL DEFAULT 0,
  good_count INT NOT NULL DEFAULT 0,
  bad_count INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 투표 (1인 1스킬 1투표)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('good', 'bad')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- 설치 추적
CREATE TABLE installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),   -- nullable (비로그인 CLI 설치)
  source TEXT NOT NULL CHECK (source IN ('web', 'cli', 'skill')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 뷰 추적 (집계용, 개별 로그 불필요)
-- view_count는 skills 테이블에서 직접 increment

-- 인덱스
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_skills_stars ON skills(stars DESC);
CREATE INDEX idx_skills_good_count ON skills(good_count DESC);
CREATE INDEX idx_skills_install_count ON skills(install_count DESC);
CREATE INDEX idx_skills_updated ON skills(updated_at DESC);
CREATE INDEX idx_votes_user_skill ON votes(user_id, skill_id);
CREATE INDEX idx_installs_skill ON installs(skill_id);

-- RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE installs ENABLE ROW LEVEL SECURITY;

-- skills: 누구나 읽기 가능
CREATE POLICY "skills_read" ON skills FOR SELECT USING (true);

-- votes: 로그인 사용자만 본인 투표 CRUD
CREATE POLICY "votes_read" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- installs: 삽입만 가능
CREATE POLICY "installs_insert" ON installs FOR INSERT WITH CHECK (true);
CREATE POLICY "installs_read" ON installs FOR SELECT USING (true);

-- 봇 방지: GitHub 계정 생성일 30일 이상 체크 함수
CREATE OR REPLACE FUNCTION check_github_account_age()
RETURNS TRIGGER AS $$
DECLARE
  github_created_at TIMESTAMPTZ;
BEGIN
  SELECT raw_user_meta_data->>'created_at'
  INTO github_created_at
  FROM auth.users
  WHERE id = NEW.user_id;

  IF github_created_at IS NOT NULL
     AND github_created_at > (now() - INTERVAL '30 days') THEN
    RAISE EXCEPTION 'Account too new to vote';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_vote_account_age
  BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION check_github_account_age();

-- 투표 시 자동 집계 업데이트
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count + 1 WHERE id = NEW.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count + 1 WHERE id = NEW.skill_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count - 1 WHERE id = OLD.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count - 1 WHERE id = OLD.skill_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    -- 투표 변경 시 (good → bad or bad → good)
    IF OLD.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count - 1 WHERE id = OLD.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count - 1 WHERE id = OLD.skill_id;
    END IF;
    IF NEW.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count + 1 WHERE id = NEW.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count + 1 WHERE id = NEW.skill_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- 설치 시 자동 집계
CREATE OR REPLACE FUNCTION update_install_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills SET install_count = install_count + 1 WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_install
  AFTER INSERT ON installs
  FOR EACH ROW EXECUTE FUNCTION update_install_count();
```

---

## 카테고리 시드 데이터

```sql
INSERT INTO categories (id, name_en, name_ko, icon, sort_order) VALUES
  ('development', 'Development', '개발', 'code', 1),
  ('testing', 'Testing & QA', '테스트 & QA', 'flask-conical', 2),
  ('devops', 'DevOps & Infra', 'DevOps & 인프라', 'server', 3),
  ('productivity', 'Productivity', '생산성', 'zap', 4),
  ('docs', 'Documentation', '문서화', 'file-text', 5),
  ('other', 'Other', '기타', 'puzzle', 6);
```

---

## Task 1: 프로젝트 초기 설정

**Files:**
- Create: `package.json`, `next.config.ts`, `tsconfig.json`, `tailwind.config.ts`
- Create: `.env.local`, `.gitignore`
- Create: `src/i18n/routing.ts`, `src/i18n/request.ts`
- Create: `messages/en.json`, `messages/ko.json`

**Step 1: Next.js 프로젝트 생성**

```bash
cd /Users/ab180-yechan-mbp/projects/skill-directory
npx create-next-app@latest . --typescript --tailwind --app --src-dir --use-npm --no-import-alias
```

**Step 2: 필수 패키지 설치**

```bash
cd /Users/ab180-yechan-mbp/projects/skill-directory
npm install @supabase/supabase-js @supabase/ssr next-intl lucide-react
npm install -D supabase
```

**Step 3: 환경변수 설정**

Create `.env.local`:
```env
NEXT_PUBLIC_SUPABASE_URL=<supabase-url>
NEXT_PUBLIC_SUPABASE_ANON_KEY=<supabase-anon-key>
SUPABASE_SERVICE_ROLE_KEY=<service-role-key>
GITHUB_TOKEN=<github-personal-access-token>
ANTHROPIC_API_KEY=<claude-api-key>
NEXT_PUBLIC_SITE_URL=http://localhost:3000
```

**Step 4: i18n 설정**

Create `src/i18n/routing.ts`:
```typescript
import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['ko', 'en'],
  defaultLocale: 'ko'
});
```

Create `src/i18n/request.ts`:
```typescript
import { getRequestConfig } from 'next-intl/server';
import { routing } from './routing';

export default getRequestConfig(async ({ requestLocale }) => {
  let locale = await requestLocale;
  if (!locale || !routing.locales.includes(locale as any)) {
    locale = routing.defaultLocale;
  }
  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default
  };
});
```

Create `messages/ko.json`:
```json
{
  "common": {
    "siteName": "Claude Skill Directory",
    "search": "검색",
    "login": "GitHub로 로그인",
    "logout": "로그아웃",
    "all": "전체",
    "about": "소개"
  },
  "home": {
    "title": "Claude Code 스킬을 발견하세요",
    "subtitle": "AI가 추천하는 검증된 스킬 디렉토리",
    "searchPlaceholder": "어떤 스킬을 찾고 있나요?",
    "suggestedTags": "이런 걸 찾고 있나요?",
    "sortBy": "정렬",
    "sortStars": "Stars",
    "sortGood": "추천순",
    "sortInstalls": "설치순",
    "sortRecent": "최신순",
    "category": "카테고리",
    "language": "언어"
  },
  "skill": {
    "install": "설치하기",
    "installCommand": "설치 명령어",
    "copied": "복사됨!",
    "good": "유용해요",
    "bad": "별로예요",
    "views": "조회",
    "installs": "설치",
    "stars": "Stars",
    "lastUpdated": "최근 업데이트",
    "howToInstall": "설치 방법",
    "howToUse": "사용 방법",
    "examples": "예시",
    "viewReadme": "원본 README 보기",
    "loginToVote": "투표하려면 로그인하세요",
    "accountTooNew": "계정 생성 30일 이후 투표 가능합니다"
  },
  "about": {
    "title": "Claude Skill Directory란?",
    "description": "GitHub에서 Claude Code 스킬을 자동 수집하고, AI로 구조화하여 보여주는 디렉토리입니다."
  },
  "categories": {
    "development": "개발",
    "testing": "테스트 & QA",
    "devops": "DevOps & 인프라",
    "productivity": "생산성",
    "docs": "문서화",
    "other": "기타"
  }
}
```

Create `messages/en.json`:
```json
{
  "common": {
    "siteName": "Claude Skill Directory",
    "search": "Search",
    "login": "Sign in with GitHub",
    "logout": "Sign out",
    "all": "All",
    "about": "About"
  },
  "home": {
    "title": "Discover Claude Code Skills",
    "subtitle": "AI-powered, community-verified skill directory",
    "searchPlaceholder": "What skill are you looking for?",
    "suggestedTags": "Looking for something like this?",
    "sortBy": "Sort by",
    "sortStars": "Stars",
    "sortGood": "Most recommended",
    "sortInstalls": "Most installed",
    "sortRecent": "Recently updated",
    "category": "Category",
    "language": "Language"
  },
  "skill": {
    "install": "Install",
    "installCommand": "Install command",
    "copied": "Copied!",
    "good": "Useful",
    "bad": "Not useful",
    "views": "Views",
    "installs": "Installs",
    "stars": "Stars",
    "lastUpdated": "Last updated",
    "howToInstall": "Installation",
    "howToUse": "Usage",
    "examples": "Examples",
    "viewReadme": "View original README",
    "loginToVote": "Sign in to vote",
    "accountTooNew": "Your account must be at least 30 days old to vote"
  },
  "about": {
    "title": "What is Claude Skill Directory?",
    "description": "A directory that automatically collects Claude Code skills from GitHub, structures them with AI, and lets the community vote."
  },
  "categories": {
    "development": "Development",
    "testing": "Testing & QA",
    "devops": "DevOps & Infra",
    "productivity": "Productivity",
    "docs": "Documentation",
    "other": "Other"
  }
}
```

**Step 5: next.config.ts 수정**

```typescript
import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin('./src/i18n/request.ts');

const nextConfig = {};

export default withNextIntl(nextConfig);
```

**Step 6: Git 초기화 & 커밋**

```bash
cd /Users/ab180-yechan-mbp/projects/skill-directory
git init
git add .
git commit -m "chore: initial Next.js 15 + Supabase + next-intl setup"
```

---

## Task 2: Supabase 설정 + DB 스키마

**Files:**
- Create: `src/lib/supabase/client.ts`
- Create: `src/lib/supabase/server.ts`
- Create: `supabase/migrations/001_initial_schema.sql`
- Create: `supabase/seed.sql`

**Step 1: Supabase CLI 초기화**

```bash
cd /Users/ab180-yechan-mbp/projects/skill-directory
npx supabase init
```

**Step 2: 마이그레이션 파일 생성**

Create `supabase/migrations/001_initial_schema.sql` with the full schema from the "Supabase 스키마" section above.

**Step 3: 시드 데이터 생성**

Create `supabase/seed.sql` with the category seed data from the "카테고리 시드 데이터" section above.

**Step 4: Supabase 클라이언트 유틸 생성**

Create `src/lib/supabase/client.ts`:
```typescript
import { createBrowserClient } from '@supabase/ssr';

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
```

Create `src/lib/supabase/server.ts`:
```typescript
import { createServerClient } from '@supabase/ssr';
import { cookies } from 'next/headers';

export async function createClient() {
  const cookieStore = await cookies();

  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll();
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            );
          } catch {
            // Server Component에서 호출 시 무시
          }
        }
      }
    }
  );
}
```

**Step 5: Supabase 프로젝트에 마이그레이션 적용**

```bash
npx supabase db push
```

**Step 6: 타입 생성**

```bash
npx supabase gen types typescript --project-id <project-id> > src/lib/supabase/types.ts
```

**Step 7: 커밋**

```bash
git add .
git commit -m "feat: add Supabase schema, client utils, and seed data"
```

---

## Task 3: 미들웨어 + 인증 (GitHub OAuth)

**Files:**
- Create: `src/middleware.ts`
- Create: `src/app/[locale]/auth/callback/route.ts`
- Create: `src/components/auth/github-login-button.tsx`

**Step 1: 통합 미들웨어 생성**

Create `src/middleware.ts`:
```typescript
import createMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

// next-intl 미들웨어가 Supabase 쿠키를 방해하지 않도록
// Supabase auth는 Route Handler와 Server Component에서 처리
const intlMiddleware = createMiddleware(routing);

export default intlMiddleware;

export const config = {
  matcher: ['/', '/(ko|en)/:path*']
};
```

**Step 2: OAuth 콜백 Route Handler 생성**

Create `src/app/[locale]/auth/callback/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams, origin } = new URL(request.url);
  const code = searchParams.get('code');
  const next = searchParams.get('next') ?? '/';

  if (code) {
    const supabase = await createClient();
    const { error } = await supabase.auth.exchangeCodeForSession(code);

    if (!error) {
      return NextResponse.redirect(`${origin}${next}`);
    }
  }

  return NextResponse.redirect(`${origin}/auth/error`);
}
```

**Step 3: GitHub 로그인 버튼 생성**

Create `src/components/auth/github-login-button.tsx`:
```typescript
'use client';

import { createClient } from '@/lib/supabase/client';
import { useTranslations } from 'next-intl';

export function GitHubLoginButton() {
  const t = useTranslations('common');
  const supabase = createClient();

  const handleLogin = async () => {
    await supabase.auth.signInWithOAuth({
      provider: 'github',
      options: {
        redirectTo: `${window.location.origin}/auth/callback`
      }
    });
  };

  return (
    <button
      onClick={handleLogin}
      className="flex items-center gap-2 rounded-lg bg-gray-900 px-4 py-2 text-sm text-white hover:bg-gray-800"
    >
      <svg className="h-5 w-5" fill="currentColor" viewBox="0 0 24 24">
        <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
      </svg>
      {t('login')}
    </button>
  );
}
```

**Step 4: Supabase 대시보드에서 GitHub OAuth 활성화**

1. Supabase Dashboard → Authentication → Providers → GitHub
2. Client ID / Secret 입력
3. Callback URL: `https://<project>.supabase.co/auth/v1/callback`

**Step 5: 커밋**

```bash
git add .
git commit -m "feat: add middleware, GitHub OAuth, and login button"
```

---

## Task 4: 레이아웃 + 홈페이지 (스킬 목록)

**Files:**
- Create: `src/app/[locale]/layout.tsx`
- Create: `src/app/[locale]/page.tsx`
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/locale-switcher.tsx`
- Create: `src/components/skills/skill-card.tsx`
- Create: `src/components/skills/skill-grid.tsx`
- Create: `src/components/skills/skill-filters.tsx`
- Create: `src/components/skills/skill-search.tsx`

**Step 1: 로케일 레이아웃**

Create `src/app/[locale]/layout.tsx`:
```typescript
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Header } from '@/components/layout/header';
import { Footer } from '@/components/layout/footer';
import '@/app/globals.css';

export function generateStaticParams() {
  return routing.locales.map((locale) => ({ locale }));
}

export default async function LocaleLayout({
  children,
  params
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;

  if (!routing.locales.includes(locale as any)) {
    notFound();
  }

  const messages = await getMessages();

  return (
    <html lang={locale}>
      <body className="min-h-screen bg-gray-50 text-gray-900">
        <NextIntlClientProvider messages={messages}>
          <Header />
          <main className="mx-auto max-w-7xl px-4 py-8">
            {children}
          </main>
          <Footer />
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
```

**Step 2: 스킬 카드 컴포넌트**

Create `src/components/skills/skill-card.tsx`:
```typescript
import Link from 'next/link';
import { useLocale, useTranslations } from 'next-intl';
import { Star, ThumbsUp, ThumbsDown, Download, Eye } from 'lucide-react';

interface SkillCardProps {
  readonly skill: {
    readonly slug: string;
    readonly name: string;
    readonly summary_ko: string | null;
    readonly summary_en: string | null;
    readonly stars: number;
    readonly good_count: number;
    readonly bad_count: number;
    readonly view_count: number;
    readonly install_count: number;
    readonly category_id: string;
    readonly tags: readonly string[];
  };
}

export function SkillCard({ skill }: SkillCardProps) {
  const t = useTranslations('skill');
  const locale = useLocale();
  const summary = locale === 'ko' ? skill.summary_ko : skill.summary_en;

  return (
    <Link
      href={`/${locale}/skills/${skill.slug}`}
      className="group flex flex-col rounded-xl border border-gray-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <h3 className="text-lg font-semibold group-hover:text-blue-600">
        {skill.name}
      </h3>
      <p className="mt-2 flex-1 text-sm text-gray-600 line-clamp-2">
        {summary}
      </p>
      <div className="mt-3 flex flex-wrap gap-1.5">
        {skill.tags.slice(0, 3).map((tag) => (
          <span
            key={tag}
            className="rounded-full bg-gray-100 px-2.5 py-0.5 text-xs text-gray-600"
          >
            {tag}
          </span>
        ))}
      </div>
      <div className="mt-4 flex items-center gap-4 border-t border-gray-100 pt-3 text-xs text-gray-500">
        <span className="flex items-center gap-1">
          <Star className="h-3.5 w-3.5" /> {skill.stars}
        </span>
        <span className="flex items-center gap-1">
          <ThumbsUp className="h-3.5 w-3.5" /> {skill.good_count}
        </span>
        <span className="flex items-center gap-1">
          <Download className="h-3.5 w-3.5" /> {skill.install_count}
        </span>
      </div>
    </Link>
  );
}
```

**Step 3: 필터 컴포넌트**

Create `src/components/skills/skill-filters.tsx`:
```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useRouter, useSearchParams, usePathname } from 'next/navigation';
import { useCallback } from 'react';

const SORT_OPTIONS = ['stars', 'good', 'installs', 'recent'] as const;

interface SkillFiltersProps {
  readonly categories: ReadonlyArray<{
    readonly id: string;
    readonly name_ko: string;
    readonly name_en: string;
  }>;
  readonly locale: string;
}

export function SkillFilters({ categories, locale }: SkillFiltersProps) {
  const t = useTranslations('home');
  const tCat = useTranslations('categories');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();

  const updateParam = useCallback(
    (key: string, value: string) => {
      const params = new URLSearchParams(searchParams.toString());
      if (value === 'all' || value === '') {
        params.delete(key);
      } else {
        params.set(key, value);
      }
      router.push(`${pathname}?${params.toString()}`);
    },
    [router, pathname, searchParams]
  );

  const currentCategory = searchParams.get('category') ?? 'all';
  const currentSort = searchParams.get('sort') ?? 'stars';

  return (
    <div className="flex flex-wrap items-center gap-3">
      {/* 카테고리 필터 */}
      <select
        value={currentCategory}
        onChange={(e) => updateParam('category', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        <option value="all">{t('category')}: {tCat('all') ?? '전체'}</option>
        {categories.map((cat) => (
          <option key={cat.id} value={cat.id}>
            {locale === 'ko' ? cat.name_ko : cat.name_en}
          </option>
        ))}
      </select>

      {/* 정렬 */}
      <select
        value={currentSort}
        onChange={(e) => updateParam('sort', e.target.value)}
        className="rounded-lg border border-gray-300 px-3 py-2 text-sm"
      >
        {SORT_OPTIONS.map((opt) => (
          <option key={opt} value={opt}>
            {t(`sort${opt.charAt(0).toUpperCase() + opt.slice(1)}` as any)}
          </option>
        ))}
      </select>
    </div>
  );
}
```

**Step 4: 가이드 검색 컴포넌트**

Create `src/components/skills/skill-search.tsx`:
```typescript
'use client';

import { useTranslations } from 'next-intl';
import { useRouter, usePathname, useSearchParams } from 'next/navigation';
import { Search } from 'lucide-react';
import { useState } from 'react';

const SUGGESTED_TAGS = [
  'test-automation', 'code-review', 'commit', 'security',
  'documentation', 'refactoring', 'deployment', 'debugging'
];

export function SkillSearch() {
  const t = useTranslations('home');
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const [query, setQuery] = useState(searchParams.get('q') ?? '');

  const handleSearch = (q: string) => {
    const params = new URLSearchParams(searchParams.toString());
    if (q) {
      params.set('q', q);
    } else {
      params.delete('q');
    }
    router.push(`${pathname}?${params.toString()}`);
  };

  return (
    <div className="space-y-4">
      <div className="relative">
        <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-gray-400" />
        <input
          type="text"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleSearch(query)}
          placeholder={t('searchPlaceholder')}
          className="w-full rounded-xl border border-gray-300 py-3 pl-12 pr-4 text-lg focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-200"
        />
      </div>
      <div className="flex flex-wrap gap-2">
        <span className="text-sm text-gray-500">{t('suggestedTags')}</span>
        {SUGGESTED_TAGS.map((tag) => (
          <button
            key={tag}
            onClick={() => handleSearch(tag)}
            className="rounded-full bg-blue-50 px-3 py-1 text-sm text-blue-700 hover:bg-blue-100"
          >
            {tag}
          </button>
        ))}
      </div>
    </div>
  );
}
```

**Step 5: 홈페이지 (Server Component)**

Create `src/app/[locale]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { SkillSearch } from '@/components/skills/skill-search';
import { SkillFilters } from '@/components/skills/skill-filters';
import { SkillCard } from '@/components/skills/skill-card';

interface HomePageProps {
  params: Promise<{ locale: string }>;
  searchParams: Promise<{ q?: string; category?: string; sort?: string }>;
}

const SORT_COLUMNS: Record<string, string> = {
  stars: 'stars',
  good: 'good_count',
  installs: 'install_count',
  recent: 'updated_at'
};

export default async function HomePage({ params, searchParams }: HomePageProps) {
  const { locale } = await params;
  const { q, category, sort = 'stars' } = await searchParams;
  const t = await getTranslations('home');
  const supabase = await createClient();

  // 카테고리 조회
  const { data: categories } = await supabase
    .from('categories')
    .select('*')
    .order('sort_order');

  // 스킬 조회 (필터 + 정렬)
  let query = supabase.from('skills').select('*');

  if (category && category !== 'all') {
    query = query.eq('category_id', category);
  }

  if (q) {
    // 텍스트 검색 (name, description, tags)
    query = query.or(
      `name.ilike.%${q}%,description_en.ilike.%${q}%,description_ko.ilike.%${q}%`
    );
  }

  const sortColumn = SORT_COLUMNS[sort] ?? 'stars';
  query = query.order(sortColumn, { ascending: false }).limit(50);

  const { data: skills } = await query;

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h1 className="text-4xl font-bold">{t('title')}</h1>
        <p className="mt-2 text-lg text-gray-600">{t('subtitle')}</p>
      </div>

      <SkillSearch />

      <SkillFilters categories={categories ?? []} locale={locale} />

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {(skills ?? []).map((skill) => (
          <SkillCard key={skill.id} skill={skill} />
        ))}
      </div>

      {(!skills || skills.length === 0) && (
        <p className="text-center text-gray-500">No skills found.</p>
      )}
    </div>
  );
}
```

**Step 6: 커밋**

```bash
git add .
git commit -m "feat: add layout, home page with search, filters, and skill cards"
```

---

## Task 5: 스킬 상세 페이지 + 투표

**Files:**
- Create: `src/app/[locale]/skills/[slug]/page.tsx`
- Create: `src/components/skills/skill-detail.tsx`
- Create: `src/components/skills/vote-button.tsx`
- Create: `src/app/api/skills/[id]/vote/route.ts`
- Create: `src/app/api/skills/[id]/install/route.ts`

**Step 1: 투표 API Route**

Create `src/app/api/skills/[id]/vote/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { vote_type } = await request.json();

  if (!['good', 'bad'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // upsert: 기존 투표 있으면 변경, 없으면 생성
  const { error } = await supabase
    .from('votes')
    .upsert(
      { user_id: user.id, skill_id: skillId, vote_type },
      { onConflict: 'user_id,skill_id' }
    );

  if (error) {
    // 계정 나이 체크 트리거에서 걸리면
    if (error.message.includes('Account too new')) {
      return NextResponse.json({ error: 'account_too_new' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await supabase
    .from('votes')
    .delete()
    .eq('user_id', user.id)
    .eq('skill_id', skillId);

  return NextResponse.json({ success: true });
}
```

**Step 2: 설치 추적 API Route**

Create `src/app/api/skills/[id]/install/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { source = 'web' } = await request.json();

  if (!['web', 'cli', 'skill'].includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('installs').insert({
    skill_id: skillId,
    user_id: user?.id ?? null,
    source
  });

  return NextResponse.json({ success: true });
}
```

**Step 3: 투표 버튼 컴포넌트**

Create `src/components/skills/vote-button.tsx`:
```typescript
'use client';

import { useState, useTransition } from 'react';
import { ThumbsUp, ThumbsDown } from 'lucide-react';
import { useTranslations } from 'next-intl';

interface VoteButtonProps {
  readonly skillId: string;
  readonly goodCount: number;
  readonly badCount: number;
  readonly userVote: 'good' | 'bad' | null;
  readonly isLoggedIn: boolean;
}

export function VoteButton({
  skillId,
  goodCount,
  badCount,
  userVote: initialVote,
  isLoggedIn
}: VoteButtonProps) {
  const t = useTranslations('skill');
  const [vote, setVote] = useState(initialVote);
  const [counts, setCounts] = useState({ good: goodCount, bad: badCount });
  const [isPending, startTransition] = useTransition();

  const handleVote = (type: 'good' | 'bad') => {
    if (!isLoggedIn) return;

    startTransition(async () => {
      if (vote === type) {
        // 투표 취소
        await fetch(`/api/skills/${skillId}/vote`, { method: 'DELETE' });
        setCounts((prev) => ({ ...prev, [type]: prev[type] - 1 }));
        setVote(null);
      } else {
        // 새 투표 또는 변경
        await fetch(`/api/skills/${skillId}/vote`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ vote_type: type })
        });
        setCounts((prev) => ({
          good: prev.good + (type === 'good' ? 1 : 0) - (vote === 'good' ? 1 : 0),
          bad: prev.bad + (type === 'bad' ? 1 : 0) - (vote === 'bad' ? 1 : 0)
        }));
        setVote(type);
      }
    });
  };

  return (
    <div className="flex items-center gap-3">
      <button
        onClick={() => handleVote('good')}
        disabled={isPending || !isLoggedIn}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          vote === 'good'
            ? 'bg-green-100 text-green-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ThumbsUp className="h-4 w-4" />
        {t('good')} {counts.good}
      </button>
      <button
        onClick={() => handleVote('bad')}
        disabled={isPending || !isLoggedIn}
        className={`flex items-center gap-1.5 rounded-lg px-4 py-2 text-sm font-medium transition-colors ${
          vote === 'bad'
            ? 'bg-red-100 text-red-700'
            : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
        } disabled:cursor-not-allowed disabled:opacity-50`}
      >
        <ThumbsDown className="h-4 w-4" />
        {t('bad')} {counts.bad}
      </button>
      {!isLoggedIn && (
        <span className="text-xs text-gray-400">{t('loginToVote')}</span>
      )}
    </div>
  );
}
```

**Step 4: 스킬 상세 페이지**

Create `src/app/[locale]/skills/[slug]/page.tsx`:
```typescript
import { createClient } from '@/lib/supabase/server';
import { getTranslations } from 'next-intl/server';
import { notFound } from 'next/navigation';
import { VoteButton } from '@/components/skills/vote-button';
import { Star, Download, Eye, ExternalLink, Copy } from 'lucide-react';

interface SkillPageProps {
  params: Promise<{ locale: string; slug: string }>;
}

export default async function SkillPage({ params }: SkillPageProps) {
  const { locale, slug } = await params;
  const t = await getTranslations('skill');
  const supabase = await createClient();

  // 스킬 조회
  const { data: skill } = await supabase
    .from('skills')
    .select('*')
    .eq('slug', slug)
    .single();

  if (!skill) notFound();

  // 뷰 카운트 증가
  await supabase.rpc('increment_view', { skill_id: skill.id });

  // 현재 사용자 투표 확인
  const { data: { user } } = await supabase.auth.getUser();
  let userVote: 'good' | 'bad' | null = null;

  if (user) {
    const { data: vote } = await supabase
      .from('votes')
      .select('vote_type')
      .eq('user_id', user.id)
      .eq('skill_id', skill.id)
      .single();
    userVote = (vote?.vote_type as 'good' | 'bad') ?? null;
  }

  const description = locale === 'ko' ? skill.description_ko : skill.description_en;
  const installCommand = `npx skill-directory install ${skill.slug}`;

  return (
    <div className="mx-auto max-w-4xl space-y-8">
      {/* 헤더 */}
      <div>
        <h1 className="text-3xl font-bold">{skill.name}</h1>
        <p className="mt-2 text-lg text-gray-600">{description}</p>

        <div className="mt-4 flex flex-wrap items-center gap-4 text-sm text-gray-500">
          <span className="flex items-center gap-1">
            <Star className="h-4 w-4" /> {skill.stars} Stars
          </span>
          <span className="flex items-center gap-1">
            <Eye className="h-4 w-4" /> {skill.view_count} {t('views')}
          </span>
          <span className="flex items-center gap-1">
            <Download className="h-4 w-4" /> {skill.install_count} {t('installs')}
          </span>
          <a
            href={skill.github_url}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1 text-blue-600 hover:underline"
          >
            <ExternalLink className="h-4 w-4" /> GitHub
          </a>
        </div>
      </div>

      {/* 투표 */}
      <VoteButton
        skillId={skill.id}
        goodCount={skill.good_count}
        badCount={skill.bad_count}
        userVote={userVote}
        isLoggedIn={!!user}
      />

      {/* 설치 명령어 */}
      <div className="rounded-xl border border-gray-200 bg-gray-50 p-5">
        <h2 className="text-lg font-semibold">{t('installCommand')}</h2>
        <div className="mt-3 flex items-center gap-2">
          <code className="flex-1 rounded-lg bg-gray-900 px-4 py-3 text-sm text-green-400">
            {installCommand}
          </code>
        </div>
      </div>

      {/* 구조화된 설명 */}
      {skill.install_guide && (
        <section>
          <h2 className="text-xl font-semibold">{t('howToInstall')}</h2>
          <div
            className="prose mt-3 max-w-none"
            dangerouslySetInnerHTML={{ __html: skill.install_guide }}
          />
        </section>
      )}

      {skill.usage_guide && (
        <section>
          <h2 className="text-xl font-semibold">{t('howToUse')}</h2>
          <div
            className="prose mt-3 max-w-none"
            dangerouslySetInnerHTML={{ __html: skill.usage_guide }}
          />
        </section>
      )}

      {skill.examples && (
        <section>
          <h2 className="text-xl font-semibold">{t('examples')}</h2>
          <div
            className="prose mt-3 max-w-none"
            dangerouslySetInnerHTML={{ __html: skill.examples }}
          />
        </section>
      )}

      {/* 원본 README 토글 */}
      <details className="rounded-xl border border-gray-200 p-5">
        <summary className="cursor-pointer font-semibold">
          {t('viewReadme')}
        </summary>
        <div
          className="prose mt-4 max-w-none"
          dangerouslySetInnerHTML={{ __html: skill.readme_raw ?? '' }}
        />
      </details>
    </div>
  );
}
```

**Step 5: 뷰 카운트 RPC 함수 추가 (마이그레이션)**

Create `supabase/migrations/002_increment_view.sql`:
```sql
CREATE OR REPLACE FUNCTION increment_view(skill_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE skills SET view_count = view_count + 1 WHERE id = skill_id;
END;
$$ LANGUAGE plpgsql;
```

**Step 6: 커밋**

```bash
git add .
git commit -m "feat: add skill detail page with voting and install tracking"
```

---

## Task 6: 공개 API (검색 + 메타데이터)

**Files:**
- Create: `src/app/api/skills/route.ts`
- Create: `src/app/api/skills/[id]/route.ts`

**Step 1: 스킬 검색 API**

Create `src/app/api/skills/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') ?? 'stars';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const supabase = await createClient();

  let query = supabase
    .from('skills')
    .select('id, slug, name, summary_en, summary_ko, stars, good_count, bad_count, view_count, install_count, category_id, tags, github_url, updated_at');

  if (category) {
    query = query.eq('category_id', category);
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description_en.ilike.%${q}%,description_ko.ilike.%${q}%,tags.cs.{${q}}`
    );
  }

  const sortMap: Record<string, string> = {
    stars: 'stars',
    good: 'good_count',
    installs: 'install_count',
    recent: 'updated_at'
  };

  query = query
    .order(sortMap[sort] ?? 'stars', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ skills: data, count: data?.length ?? 0 });
}
```

**Step 2: 스킬 상세 API**

Create `src/app/api/skills/[id]/route.ts`:
```typescript
import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }

  return NextResponse.json({ skill: data });
}
```

**Step 3: 커밋**

```bash
git add .
git commit -m "feat: add public REST API for skill search and detail"
```

---

## Task 7: 데이터 수집 파이프라인 (GitHub + AI 추출)

**Files:**
- Create: `src/lib/github/collector.ts`
- Create: `src/lib/ai/extractor.ts`
- Create: `supabase/functions/collect-skills/index.ts`

**Step 1: GitHub 수집 모듈**

Create `src/lib/github/collector.ts`:
```typescript
const GITHUB_API = 'https://api.github.com';

interface GitHubRepo {
  readonly full_name: string;
  readonly owner: { readonly login: string };
  readonly name: string;
  readonly html_url: string;
  readonly stargazers_count: number;
  readonly forks_count: number;
  readonly updated_at: string;
  readonly description: string | null;
}

const SEARCH_QUERIES = [
  'path:.claude/skills filename:SKILL.md',
  'path:.claude/skills filename:instructions.md',
  'topic:claude-code-skills',
  'topic:claude-skills',
  '"claude code" skill in:readme stars:>5',
];

export async function searchSkillRepos(token: string): Promise<GitHubRepo[]> {
  const allRepos = new Map<string, GitHubRepo>();

  for (const query of SEARCH_QUERIES) {
    const url = `${GITHUB_API}/search/repositories?q=${encodeURIComponent(query)}&sort=stars&per_page=100`;
    const res = await fetch(url, {
      headers: {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github+json'
      }
    });

    if (!res.ok) continue;

    const data = await res.json();
    for (const repo of data.items ?? []) {
      allRepos.set(repo.full_name, repo);
    }

    // Rate limit 대기
    await new Promise((resolve) => setTimeout(resolve, 2000));
  }

  return Array.from(allRepos.values());
}

export async function fetchReadme(
  owner: string,
  repo: string,
  token: string
): Promise<string | null> {
  const url = `${GITHUB_API}/repos/${owner}/${repo}/readme`;
  const res = await fetch(url, {
    headers: {
      Authorization: `Bearer ${token}`,
      Accept: 'application/vnd.github.raw+json'
    }
  });

  if (!res.ok) return null;
  return res.text();
}
```

**Step 2: AI 구조화 추출 모듈**

Create `src/lib/ai/extractor.ts`:
```typescript
import Anthropic from '@anthropic-ai/sdk';

interface ExtractedSkill {
  readonly name: string;
  readonly description_en: string;
  readonly description_ko: string;
  readonly summary_en: string;
  readonly summary_ko: string;
  readonly install_guide: string;
  readonly usage_guide: string;
  readonly examples: string;
  readonly category: string;
  readonly tags: readonly string[];
}

const CATEGORIES = ['development', 'testing', 'devops', 'productivity', 'docs', 'other'];

export async function extractSkillInfo(
  readme: string,
  apiKey: string
): Promise<ExtractedSkill> {
  const client = new Anthropic({ apiKey });

  const response = await client.messages.create({
    model: 'claude-sonnet-4-5-20250929',
    max_tokens: 2000,
    messages: [
      {
        role: 'user',
        content: `Analyze this Claude Code skill README and extract structured information.

README:
${readme.slice(0, 8000)}

Return a JSON object with these fields:
- name: skill name (short, human-readable)
- description_en: 1-2 sentence description in English
- description_ko: same description in Korean
- summary_en: one-line summary in English (max 100 chars)
- summary_ko: same summary in Korean
- install_guide: installation steps (markdown, keep original code blocks)
- usage_guide: how to use the skill (markdown)
- examples: example usage or output (markdown)
- category: one of ${JSON.stringify(CATEGORIES)}
- tags: 3-5 relevant tags (lowercase, kebab-case)

Return ONLY valid JSON, no markdown fences.`
      }
    ]
  });

  const text = response.content[0].type === 'text' ? response.content[0].text : '';
  return JSON.parse(text);
}
```

**Step 3: Supabase Edge Function (크론 잡)**

Create `supabase/functions/collect-skills/index.ts`:
```typescript
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')!;
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

  // 1. GitHub에서 스킬 레포 검색
  // 2. 각 레포의 README 수집
  // 3. Claude API로 구조화 추출
  // 4. Supabase에 upsert

  // (collector.ts와 extractor.ts 로직을 Edge Function용으로 인라인)

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
```

**Step 4: pg_cron 설정 (SQL)**

```sql
-- 매일 오전 4시 (UTC) 실행
SELECT cron.schedule(
  'collect-skills-daily',
  '0 4 * * *',
  $$
  SELECT net.http_post(
    url := current_setting('app.settings.edge_function_url') || '/collect-skills',
    headers := jsonb_build_object(
      'Authorization', 'Bearer ' || current_setting('app.settings.cron_secret'),
      'Content-Type', 'application/json'
    )
  ) AS request_id;
  $$
);
```

**Step 5: 커밋**

```bash
git add .
git commit -m "feat: add GitHub skill collector and AI extraction pipeline"
```

---

## Task 8: CLI 설치 도구

**Files:**
- Create: `cli/index.ts` (별도 npm 패키지 또는 npx 실행 가능)
- Create: `cli/package.json`

**Step 1: CLI 패키지 구조**

Create `cli/package.json`:
```json
{
  "name": "skill-directory",
  "version": "0.1.0",
  "bin": { "skill-directory": "./dist/index.js" },
  "scripts": { "build": "tsc" },
  "dependencies": {}
}
```

Create `cli/index.ts`:
```typescript
#!/usr/bin/env node

const API_URL = 'https://skill-directory.vercel.app/api';

async function main() {
  const [, , command, ...args] = process.argv;

  if (command === 'install' && args[0]) {
    await installSkill(args[0]);
  } else if (command === 'search' && args[0]) {
    await searchSkills(args.join(' '));
  } else {
    console.log('Usage:');
    console.log('  npx skill-directory install <slug>');
    console.log('  npx skill-directory search <query>');
  }
}

async function installSkill(slug: string) {
  // 1. API에서 스킬 정보 조회
  const res = await fetch(`${API_URL}/skills/${slug}`);
  if (!res.ok) {
    console.error(`Skill "${slug}" not found`);
    process.exit(1);
  }

  const { skill } = await res.json();
  console.log(`Installing: ${skill.name}`);

  // 2. GitHub에서 스킬 파일 클론
  const { execSync } = await import('child_process');
  const skillDir = `${process.env.HOME}/.claude/skills/${slug}`;

  execSync(`git clone ${skill.github_url} ${skillDir}`, { stdio: 'inherit' });

  // 3. 설치 추적
  await fetch(`${API_URL}/skills/${skill.id}/install`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ source: 'cli' })
  });

  console.log(`\n✓ Installed to ${skillDir}`);
}

async function searchSkills(query: string) {
  const res = await fetch(`${API_URL}/skills?q=${encodeURIComponent(query)}&limit=10`);
  const { skills } = await res.json();

  if (!skills?.length) {
    console.log('No skills found.');
    return;
  }

  for (const skill of skills) {
    console.log(`  ${skill.name} (⭐${skill.stars} 👍${skill.good_count})`);
    console.log(`    ${skill.summary_en}`);
    console.log(`    → npx skill-directory install ${skill.slug}\n`);
  }
}

main();
```

**Step 2: 커밋**

```bash
git add .
git commit -m "feat: add CLI tool for skill search and install"
```

---

## Task 9: Claude Code 스킬 (/find-skill)

**Files:**
- Create: `skill/instructions.md`

**Step 1: /find-skill 스킬 생성**

Create `skill/instructions.md`:
```markdown
# /find-skill

Claude Skill Directory에서 현재 작업에 맞는 스킬을 검색하고 추천합니다.

## 실행 단계

### Step 1: 사용자 요구 파악

사용자에게 어떤 스킬을 찾는지 물어보거나, 현재 작업 맥락에서 유용할 스킬을 파악합니다.

### Step 2: API 검색

```bash
curl -s "https://skill-directory.vercel.app/api/skills?q=<검색어>&limit=5" | jq
```

### Step 3: 결과 제시

검색 결과를 사용자에게 보여줍니다:
- 스킬 이름과 설명
- Stars, 추천수, 설치수
- 설치 명령어

### Step 4: 설치

사용자가 선택하면 설치 진행:
```bash
npx skill-directory install <slug>
```

## 맥락 기반 추천

현재 작업을 분석하여 자동 추천이 가능합니다:
- 테스트 코드 작성 중 → testing 카테고리 스킬 추천
- 배포 작업 중 → devops 카테고리 스킬 추천
- 문서 작성 중 → docs 카테고리 스킬 추천
```

**Step 2: 커밋**

```bash
git add .
git commit -m "feat: add /find-skill Claude Code skill"
```

---

## Task 10: Header, Footer, 소개 페이지

**Files:**
- Create: `src/components/layout/header.tsx`
- Create: `src/components/layout/footer.tsx`
- Create: `src/components/layout/locale-switcher.tsx`
- Create: `src/app/[locale]/about/page.tsx`

**Step 1~4:** 각 컴포넌트 및 페이지 구현 (생략 — 표준 레이아웃 패턴)

**Step 5: 커밋**

```bash
git add .
git commit -m "feat: add header, footer, locale switcher, and about page"
```

---

## Task 11: 배포 + 도메인 연결

**Step 1: Vercel 배포**

```bash
cd /Users/ab180-yechan-mbp/projects/skill-directory
npx vercel
```

**Step 2: 환경변수 설정 (Vercel Dashboard)**

모든 `.env.local` 변수를 Vercel 환경변수로 추가.

**Step 3: 도메인 연결**

Vercel Dashboard에서 커스텀 도메인 연결.

**Step 4: Supabase Edge Function 배포**

```bash
npx supabase functions deploy collect-skills
```

**Step 5: 최종 검증**

- 홈페이지 접속 확인
- 검색/필터 동작 확인
- GitHub 로그인 + 투표 확인
- 스킬 상세 페이지 확인
- API 엔드포인트 확인
- CLI 설치 확인

---

## 요약: 구현 순서

| Task | 내용 | 의존성 |
|------|------|--------|
| 1 | 프로젝트 초기 설정 | 없음 |
| 2 | Supabase 스키마 + 클라이언트 | Task 1 |
| 3 | 미들웨어 + GitHub OAuth | Task 1, 2 |
| 4 | 레이아웃 + 홈페이지 | Task 1, 2, 3 |
| 5 | 스킬 상세 + 투표 | Task 4 |
| 6 | 공개 API | Task 2 |
| 7 | 데이터 수집 파이프라인 | Task 2, 6 |
| 8 | CLI 도구 | Task 6 |
| 9 | Claude Code 스킬 | Task 6 |
| 10 | 레이아웃/소개 페이지 | Task 4 |
| 11 | 배포 | All |

**병렬 가능:**
- Task 6, 7, 8, 9는 Task 2 이후 병렬 진행 가능
- Task 4, 10은 병렬 진행 가능
