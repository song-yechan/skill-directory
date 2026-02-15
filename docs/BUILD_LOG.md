# Skill Directory — Build Log

> 최종 업데이트: 2026-02-15
> 배포: https://skill-directory-livid.vercel.app
> GitHub: https://github.com/song-yechan/skill-directory

---

## 현재 상태 요약

### ✅ 완료

| # | 항목 | 설명 |
|---|------|------|
| 1 | 프로젝트 스캐폴딩 | Next.js 15 + Supabase + next-intl + Tailwind CSS 4 |
| 2 | Supabase 스키마 | skills, categories, votes, installs 테이블 + RLS + Trigger |
| 3 | GitHub OAuth | Supabase Auth + GitHub 로그인 + 30일 봇 방지 |
| 4 | 홈페이지 | Hero 검색 + 카테고리 필터 + 정렬 + 스킬 카드 그리드 |
| 5 | 스킬 상세 페이지 | 2-column 레이아웃 + 마크다운 렌더링 + 투표 + 설치 커맨드 복사 |
| 6 | REST API | GET /api/skills, GET /api/skills/[id], POST vote, POST install |
| 7 | 소개 페이지 | 라이브 통계 + 동작 원리 + 핵심 기능 + CTA |
| 8 | Discover 페이지 | New 탭 (최신순) + Trending 탭 (추천순) + NEW 배지 |
| 9 | i18n | 한국어/영어 전체 지원 (next-intl) |
| 10 | 데이터 시딩 | GitHub Search API → 36개 스킬 수집 (1000+ stars) |
| 11 | Official 배지 | Anthropic 공식 스킬 구분 표시 |
| 12 | 로딩 스켈레톤 | 홈/상세/Discover 페이지 |
| 13 | Vercel 배포 | 자동 배포 (main push → deploy) |
| 14 | /find-skill 스킬 | Claude Code에서 스킬 검색하는 skill instructions 작성 |

### ❌ 미완료

| # | 항목 | 설명 | 우선순위 |
|---|------|------|----------|
| 1 | **Gemini enrichment 실행** | 프롬프트 완성됨. rate limit로 미실행. 내일 재시도 | **P0** |
| 2 | **스킬 데이터 품질** | description_ko, summary_ko 전부 비어있음. enrichment 완료 시 해결 | **P0** |
| 3 | **일일 크롤링 자동화** | GitHub Search API CRON (Edge Function 또는 GitHub Actions) | P1 |
| 4 | **상세 페이지 섹션 정리** | install_guide/examples 섹션 제거, usage_guide만 표시하도록 변경 | P1 |
| 5 | **모바일 네비게이션** | Discover/About 링크가 모바일에서 숨김 (sm:block) | P2 |
| 6 | **검색 고도화** | 현재 ilike 검색. 풀텍스트 서치 or 태그 기반 필터 | P2 |
| 7 | **SEO 메타데이터** | og:image, description, sitemap.xml | P2 |
| 8 | **CLI 패키지** | npm 패키지로 터미널에서 스킬 검색/설치 | P3 |
| 9 | **Edge Function 배포** | collect-skills 함수 Supabase에 배포 | P3 |

---

## 기술 스택

| 영역 | 기술 | 버전 |
|------|------|------|
| 프레임워크 | Next.js (App Router) | 16.1.6 |
| 런타임 | React | 19.2.3 |
| 언어 | TypeScript | 5 |
| DB / Auth | Supabase (PostgreSQL + Auth) | SSR 0.8.0 |
| i18n | next-intl | 4.8.2 |
| 스타일 | Tailwind CSS | 4 |
| 아이콘 | Lucide React | 0.564.0 |
| 마크다운 | react-markdown + remark-gfm | 10.1.0 |
| AI (enrichment) | Google Gemini 2.0 Flash | Free tier |
| 배포 | Vercel | 자동 배포 |

---

## 프로젝트 구조

```
skill-directory/
├── src/
│   ├── app/
│   │   ├── [locale]/
│   │   │   ├── page.tsx              # 홈페이지
│   │   │   ├── loading.tsx           # 홈 스켈레톤
│   │   │   ├── layout.tsx            # i18n 레이아웃
│   │   │   ├── discover/page.tsx     # New/Trending
│   │   │   ├── about/page.tsx        # 소개
│   │   │   ├── skills/[slug]/page.tsx # 스킬 상세
│   │   │   └── auth/callback/        # OAuth 콜백
│   │   └── api/
│   │       ├── skills/               # 스킬 API (검색/상세)
│   │       ├── skills/[id]/          # 투표/설치 API
│   │       └── health/               # 헬스체크
│   ├── components/
│   │   ├── layout/                   # Header, Footer, LocaleSwitcher
│   │   ├── skills/                   # SkillCard, HeroSection, CategoryBar, VoteButton, InstallCommand
│   │   ├── auth/                     # GitHubLoginButton
│   │   └── ui/                       # MarkdownRenderer
│   ├── lib/
│   │   ├── supabase/                 # Server/Client 유틸
│   │   ├── github/collector.ts       # GitHub API 수집기
│   │   └── ai/extractor.ts          # AI 구조화 추출기
│   └── middleware.ts                 # next-intl + Supabase 쿠키
├── scripts/
│   ├── seed-skills.ts               # GitHub → DB 시딩
│   ├── enrich-skills.ts             # Gemini AI enrichment
│   ├── clean-low-stars.ts           # 저스타 스킬 삭제
│   ├── fix-official-names.ts        # Anthropic 스킬명 보정
│   └── check-data.ts               # DB 데이터 점검
├── messages/
│   ├── ko.json                      # 한국어
│   └── en.json                      # 영어
├── supabase/
│   ├── migrations/001_initial_schema.sql
│   ├── seed.sql                     # 카테고리 6개
│   └── functions/collect-skills/    # Edge Function (미완)
├── skill/instructions.md            # /find-skill 스킬
└── docs/
    ├── plans/2026-02-15-*.md        # 설계 문서
    ├── credentials.md               # 외부 서비스 설정 가이드
    └── BUILD_LOG.md                 # 이 파일
```

---

## DB 스키마

### skills 테이블

| 컬럼 | 타입 | 설명 |
|------|------|------|
| id | uuid (PK) | 자동 생성 |
| slug | text (unique) | URL 식별자 |
| name | text | 스킬 이름 |
| description_en / _ko | text | AI 생성 설명 (2문장) |
| summary_en / _ko | text | AI 생성 한 줄 요약 |
| usage_guide | text | 동작 흐름 + 활용 시나리오 (마크다운) |
| install_guide | text | 설치 가이드 (사용 안 함 → null) |
| examples | text | 예시 (사용 안 함 → null) |
| readme_raw | text | GitHub README 원문 |
| github_url | text | GitHub 레포 URL |
| github_owner | text | 레포 소유자 |
| stars | int | GitHub stars |
| category_id | text (FK) | 카테고리 |
| tags | text[] | 태그 배열 |
| good_count / bad_count | int | 투표 수 (trigger 동기화) |
| view_count | int | 조회 수 |
| install_count | int | 설치 수 |
| created_at / updated_at | timestamptz | 타임스탬프 |

### 보조 테이블

- **categories**: 6개 고정 (development, testing, devops, productivity, docs, other)
- **votes**: user_id + skill_id unique, vote_type (good/bad)
- **installs**: 설치 추적 (source: web/cli/skill)

---

## 커밋 히스토리

```
0972c99 feat: add discover page (New/Trending) and improve enrichment prompt
6bfeac6 feat: AI-enriched skill descriptions via Groq Llama 3.1
14c8b0b feat: loading skeletons, star cleanup, AI enrichment script
4e503d3 feat: markdown rendering, official badge, about page redesign
37b6176 fix: improve Anthropic official skill names and categories
08c810e fix: add 'use client' to skill-card for useLocale/useTranslations hooks
fec0ce1 feat: add Phase 1 skill seed script
b5dcbf4 feat: redesign skill detail page with 2-column layout
61bff53 feat: redesign homepage UI with proper design system
0357170 docs: add credentials guide for external services
bc42273 feat: scaffold full skill directory app
240639f docs: add skill directory implementation plan
```

---

## 스킬 수집 전략

### 현재 (수동)

```
seed-skills.ts 실행 → GitHub Search API 호출 → stars 1000+ 필터 → DB insert
→ enrich-skills.ts 실행 → Gemini API로 구조화 → DB update
```

### 목표 (자동화)

| 항목 | 설계 |
|------|------|
| 주기 | 매일 1회 (GitHub Actions CRON) |
| 검색 쿼리 | `filename:SKILL.md path:.claude`, `topic:claude-code-skills` |
| 최소 기준 | Stars 1,000+ / 최근 6개월 내 업데이트 |
| 신규 처리 | DB에 없는 slug → 자동 등록 + Gemini enrichment |
| 기존 업데이트 | Stars, README 변경 감지 → DB update |
| 삭제 처리 | 레포 비공개/삭제 시 soft delete |

---

## Enrichment 프롬프트 형식

### 생성 필드 (usage_guide)

```markdown
### 동작 흐름

자연어 요청 → Claude가 코드 작성 → 실행 → 결과 리포트

### 활용 시나리오

| 상황 | 요청 예시 |
|------|----------|
| 기능 검증 | "회원가입 폼 테스트해줘" |
| 반응형 확인 | "모바일/데스크톱 스크린샷 찍어줘" |
| 링크 점검 | "깨진 링크 찾아줘" |
| 폼 테스트 | "에러 메시지 확인해줘" |

> 트리거 방식 안내
```

### 품질 규칙

- description: 딱 2문장
- summary: 60자 이내 (영), 30자 이내 (한)
- 한자 절대 금지
- ~해요/~이에요 체
- 활용 시나리오 테이블 4행
- 동작 흐름은 화살표(→) 한 줄

---

## 다음 작업 (우선순위)

### P0 — 즉시

- [ ] Gemini enrichment 재실행 (일일 쿼터 리셋 후)
- [ ] 상세 페이지에서 install_guide/examples 섹션 조건부 숨김 확인

### P1 — 이번 주

- [ ] 일일 크롤링 자동화 (GitHub Actions CRON)
- [ ] 모바일 네비게이션 개선 (햄버거 메뉴 or 바텀 탭)

### P2 — 다음 주

- [ ] SEO (sitemap.xml, og:image, meta description)
- [ ] 검색 고도화 (태그 필터, 풀텍스트)

### P3 — 이후

- [ ] CLI npm 패키지
- [ ] 주간 다이제스트 이메일
- [ ] Edge Function 배포
