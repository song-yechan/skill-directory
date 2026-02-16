# Claude Skill Hub — Marketing Plan

> **작성일**: 2026-02-16
> **상태**: DRAFT — 사용자 검토 대기
> **목표**: 8주 내 주간 방문자 1,000+ / GitHub Stars 100+ / 총 설치 500+

---

## 1. 현황 분석

### 우리 제품
- **라이브**: https://skill-directory-livid.vercel.app
- **스킬 수**: 159개 (AI enriched, ko/en)
- **기능**: 검색, 투표, 설치 추적, REST API, `/find-skill` CLI 스킬
- **스택**: Next.js 16 + Supabase + Vercel (ISR)
- **차별점**: 한/영 이중언어, 커뮤니티 투표, 트렌딩 시스템, 오픈소스

### 경쟁 환경

| 경쟁자 | 규모 | 강점 | 약점 |
|--------|------|------|------|
| **SkillsMP** | 96,000+ | 압도적 규모, 멀티 에이전트 | 품질 보장 없음, 영어만 |
| **SkillHub** | 7,000+ | Playground 체험, 멀티 에이전트 | 영어만, 커뮤니티 신호 약함 |
| **awesome-claude-skills** (GitHub) | 300+ | GitHub 네이티브, 높은 인지도 | 정적 리스트, 검색/필터 없음 |
| **mcpservers.org** | - | MCP 중심 에코시스템 | Skills 전용 아님 |

### SWOT

| | 긍정 | 부정 |
|--|------|------|
| **내부** | 한/영 이중언어 유일, 커뮤니티 투표, 오픈소스, 트렌딩 | 규모 열세(159 vs 96K), 인지도 0, 1인 운영 |
| **외부** | Claude Code 사용자 급증, 한국어 시장 무주공산 | 대형 플랫폼 진입(Anthropic 공식), 경쟁자 다수 |

---

## 2. 포지셔닝 전략

### 피해야 할 포지셔닝
- ~~"가장 큰 스킬 디렉토리"~~ → SkillsMP(96K)에 규모로 질 수 없음
- ~~"모든 AI 에이전트 지원"~~ → 멀티 에이전트는 SkillsMP/SkillHub 영역

### 우리의 포지셔닝

> **"Claude Code 스킬의 큐레이션 앱스토어"**
> — 양보다 질. AI 검증 + 커뮤니티 투표로 **진짜 쓸 만한 스킬**만 엄선.

**핵심 메시지 3가지**:
1. **Curated, not crawled** — AI가 분석하고 커뮤니티가 검증한 스킬만
2. **한국어 지원** — 유일한 한국어 Claude Code 스킬 디렉토리
3. **오픈소스 & 투명** — 스코어링 공식 공개, 누구나 기여 가능

### 타겟 세그먼트 (우선순위순)

| 세그먼트 | 규모 | 접근 채널 | 메시지 |
|----------|------|-----------|--------|
| **한국 개발자** | 중 | 한국 커뮤니티, 블로그 | "한국어로 Claude Code 스킬 찾기" |
| **Claude Code 파워유저** | 소 | Reddit, Discord, Twitter | "큐레이션된 검증 스킬" |
| **스킬 제작자** | 소 | GitHub, Direct outreach | "당신의 스킬을 홍보하세요" |

---

## 3. ORB 채널 전략

### Owned (소유 채널) — 장기 자산
| 채널 | 현황 | 액션 |
|------|------|------|
| **웹사이트** | 라이브 | Hero 카피 강화, Social proof 추가 |
| **GitHub** | topics 미설정 | topics 추가, README 마케팅 최적화 |
| **블로그 (SEO)** | 미구축 | `/blog` 라우트 추가 or 외부 블로그 |
| **/find-skill CLI** | 완료 | 설치 경로 자체가 마케팅 채널 |

### Rented (임대 채널) — 초기 트래픽
| 채널 | 우선순위 | 전략 |
|------|----------|------|
| **Reddit** (r/ClaudeAI, r/ClaudeCode) | ★★★ | Show & Tell 포스트, 댓글 마케팅 |
| **Twitter/X** | ★★★ | 빌드 스레드, 주간 스킬 추천 |
| **Hacker News** | ★★☆ | Show HN (타이밍 중요) |
| **Product Hunt** | ★★☆ | 제품 완성 후 런칭 |

### Borrowed (차용 채널) — 신뢰도
| 채널 | 전략 |
|------|------|
| **awesome-claude-skills** | 리스트에 우리 디렉토리 PR 제출 |
| **스킬 제작자** | 인기 스킬 제작자에게 DM → 프로필 링크 제안 |
| **한국 테크 블로그** | GeekNews, 요즘IT 기고 |

---

## 4. 실행 로드맵

### Phase 0: 런칭 준비 (1주) ← 코드 작업 필요

제품을 마케팅하기 전에 먼저 갖춰야 할 것들:

| Task | 설명 | 우선순위 |
|------|------|----------|
| **P0-1. 다크 모드** | 개발자 타겟이므로 다크 모드 필수 | ★★★ |
| **P0-2. 반응형** | 모바일에서 깨지면 신뢰 하락 | ★★★ |
| **P0-3. Social Proof** | 홈에 "159개 스킬 / X회 설치" 실시간 표시 | ★★☆ |
| **P0-4. GitHub topics** | `claude-code`, `skills`, `directory` 등 태그 추가 | ★★★ |
| **P0-5. OG Image** | SNS 공유 시 보이는 미리보기 이미지 생성 | ★★☆ |
| **P0-6. 커스텀 도메인** | `skillhub.dev` 등 기억하기 쉬운 도메인 (선택) | ★☆☆ |

### Phase 1: 커뮤니티 시딩 (2주)

**목표**: 첫 500 방문자 + 피드백 수집

#### 1-1. Reddit 런칭 (Day 1-3)

**r/ClaudeAI 포스트** (영어):
```
Title: I built a curated directory for Claude Code skills — 159 skills, searchable, with community voting

Body:
Hey everyone! I've been using Claude Code daily and got frustrated trying
to find good skills scattered across GitHub. So I built Claude Skill Hub —
a curated directory where skills are:

- AI-analyzed and enriched with usage guides
- Community-verified through voting
- Searchable by category, tags, and keywords
- Available in English and Korean

It's free, open-source, and has 159 skills right now.

Check it out: [link]

I'd love feedback on:
1. What skills are you looking for that aren't listed?
2. Would you use community voting to decide which skills to try?

GitHub: [link]
```

**r/ClaudeCode 포스트**: 더 기술적인 톤, API/CLI 기능 강조

**댓글 마케팅**: Claude Code 스킬 관련 질문에 자연스럽게 링크 첨부 (스팸 아닌 실제 도움)

#### 1-2. Twitter/X 스레드 (Day 1)

```
🧵 Claude Code에 159개 스킬이 있다는 거 알고 계셨나요?

1/ 스킬이 GitHub 곳곳에 흩어져 있어서 찾기가 너무 어려웠습니다.
   그래서 직접 큐레이션 디렉토리를 만들었어요.

2/ 주요 기능:
   - AI가 분석한 상세 가이드 (한/영)
   - 커뮤니티 투표로 검증
   - 카테고리/태그 검색
   - 트렌딩 시스템

3/ 가장 인기 있는 스킬 TOP 5:
   [스크린샷]

4/ CLI에서 바로 검색도 됩니다:
   claude skill install find-skill

5/ 오픈소스이고 무료입니다.
   [link]

   피드백 환영합니다! 🙏
```

#### 1-3. Claude Code Discord (Day 2)

공식 Discord의 `#showcase` 또는 `#skills` 채널에 공유.

#### 1-4. awesome-claude-skills PR (Day 3)

- [travisvn/awesome-claude-skills](https://github.com/travisvn/awesome-claude-skills) — PR 제출
- [VoltAgent/awesome-agent-skills](https://github.com/VoltAgent/awesome-agent-skills) — PR 제출
- [ComposioHQ/awesome-claude-skills](https://github.com/ComposioHQ/awesome-claude-skills) — PR 제출

#### 1-5. 한국 커뮤니티 (Day 3-5)

| 채널 | 형태 |
|------|------|
| **GeekNews** | Show 포스트 |
| **요즘IT** | 기고 또는 프로젝트 소개 |
| **커리어리** | 사이드 프로젝트 소개 |
| **디스콰이어** | Claude Code 관련 글 |

### Phase 2: 콘텐츠 & SEO (3-4주)

**목표**: 검색 유입 시작, 주간 500+ 방문자

#### 2-1. SEO 콘텐츠 3편

| 순서 | 제목 | 타겟 키워드 | 형식 |
|------|------|-------------|------|
| 1 | "2026 Claude Code 스킬 추천 TOP 10" | claude code 스킬 추천 | 블로그/리스티클 |
| 2 | "Claude Code 스킬 만드는 법 — 5분 가이드" | claude code skill 만들기 | 튜토리얼 |
| 3 | "Claude Code Skills vs Cursor Rules — 비교 가이드" | claude code vs cursor | 비교 |

**발행 채널**:
- 자체 블로그 (`/blog` 라우트) — SEO 직접 혜택
- Medium (영어) — 발견성 극대화
- 벨로그 (한국어) — 한국 개발자 유입

#### 2-2. 스킬 제작자 아웃리치

인기 스킬 제작자 10명에게 DM/이메일:

```
Subject: Your skill [name] is featured on Claude Skill Hub

Hi [name],

Your Claude Code skill [name] is listed on Claude Skill Hub with
[X] community votes and [Y] installs tracked.

Check your skill page: [link]

If you'd like to:
- Update the description
- Add a usage guide
- Get a "verified author" badge

Just let me know! We're also happy to feature your skill on our
homepage if you share our directory with your community.

Cheers
```

**기대 효과**: 제작자가 자기 스킬 페이지 링크를 공유 → 자연 유입

#### 2-3. 주간 스킬 하이라이트

매주 월요일 Twitter/X에 "이 주의 스킬" 포스트:
- 스킬 소개 + 스크린샷
- 사용 예시 1-2개
- 디렉토리 링크

### Phase 3: 런칭 이벤트 (5-6주)

**목표**: 트래픽 스파이크, 주간 1,000+ 방문자

#### 3-1. Hacker News "Show HN" (Week 5)

```
Title: Show HN: Claude Skill Hub – Curated directory for Claude Code skills

Body:
I built a curated directory for Claude Code skills because finding
good ones across GitHub was painful.

Key features:
- 159 AI-analyzed skills with usage guides
- Community voting to surface the best ones
- Bilingual (English/Korean)
- Open-source, REST API, CLI search

Unlike larger directories that crawl everything, we focus on curation —
every skill has AI-generated summaries, install guides, and examples.

Tech: Next.js 16, Supabase, Vercel ISR, Gemini for enrichment

Live: [link]
Source: [github link]
```

**타이밍**: 미국 서부 화~목 오전 8-9시 (PST) 게시가 최적

#### 3-2. Product Hunt (Week 6)

**준비물**:
- [ ] 태그라인: "Curated app store for Claude Code skills"
- [ ] 스크린샷 5장 (검색, 상세, 투표, 트렌딩, 모바일)
- [ ] 데모 GIF (30초 — 검색 → 상세 → 설치)
- [ ] Maker 코멘트 준비
- [ ] 서포터 5명+ 확보 (Phase 1에서 확보한 커뮤니티 멤버)

**당일 전략**:
- 00:01 PST 런칭
- 모든 댓글 실시간 응답
- Twitter/Reddit 크로스 프로모션
- 한국 커뮤니티에도 PH 링크 공유

### Phase 4: 지속 성장 (7주+)

| 전략 | 주기 | 설명 |
|------|------|------|
| **주간 스킬 하이라이트** | 매주 | Twitter/X + 블로그 |
| **월간 트렌딩 리포트** | 매월 | "이달의 인기 스킬 TOP 10" |
| **스킬 제작자 인터뷰** | 격주 | 블로그/Twitter 스레드 |
| **새 스킬 알림** | 자동 | GitHub Actions → Twitter 자동 포스트 |
| **댓글 마케팅** | 상시 | Reddit/HN에서 관련 질문에 도움 + 링크 |

---

## 5. Product-Led Growth 전략

코드 자체가 마케팅 채널이 되는 전략:

### 5-1. `/find-skill` CLI 스킬 (완료)
사용자가 Claude Code 안에서 스킬 검색 → 자연스럽게 디렉토리 인지

### 5-2. "Powered by Claude Skill Hub" 배지
스킬 제작자의 README에 배지 추가 유도:
```markdown
[![Listed on Claude Skill Hub](https://skill-directory-livid.vercel.app/badge.svg)](https://skill-directory-livid.vercel.app/skills/[slug])
```

### 5-3. npm CLI 패키지 (미구현)
`npx claude-skill install <slug>` → 설치 과정 자체가 브랜드 노출

### 5-4. GitHub Action
스킬 레포에 "Claude Skill Hub에 등록" GitHub Action 제공

---

## 6. 한국 시장 전략 (차별화 핵심)

**무주공산 기회**: 한국어 Claude Code 스킬 디렉토리는 현재 0개

| 액션 | 채널 | 기대 효과 |
|------|------|-----------|
| "Claude Code 입문 가이드 + 추천 스킬" | 벨로그 | 검색 유입 |
| "Claude Code 스킬 만들기 튜토리얼" | 벨로그 + YouTube | 제작자 유입 |
| GeekNews Show 포스트 | GeekNews | 얼리어답터 유입 |
| "AI 코딩 도구 비교" | 브런치/요즘IT | 일반 개발자 |
| 한국 개발자 커뮤니티 공유 | 오픈카톡, Discord | 커뮤니티 |

---

## 7. KPI & 마일스톤

### 8주 후 목표

| 지표 | 현재 | 4주 후 | 8주 후 |
|------|------|--------|--------|
| 주간 방문자 | ~0 | 300+ | 1,000+ |
| GitHub Stars | 0 | 30+ | 100+ |
| 총 설치 추적 | 목데이터 | 100+ (실제) | 500+ |
| 등록 스킬 | 159 | 200+ | 300+ |
| 구글 노출 키워드 | 0 | 5+ | 15+ |
| Twitter 팔로워 | 0 | 50+ | 200+ |

### 주요 마일스톤

| 주 | 마일스톤 | 성공 기준 |
|----|----------|-----------|
| W1 | Phase 0 완료 (다크모드/반응형/OG) | 빌드 성공 |
| W2 | Reddit + Twitter 첫 포스트 | 50+ upvotes |
| W3 | awesome-* 리스트 등재 | PR 머지 1+ |
| W4 | SEO 콘텐츠 1편 발행 | 구글 인덱싱 |
| W5 | Hacker News Show HN | 30+ points |
| W6 | Product Hunt 런칭 | Top 10 Daily |
| W7 | 스킬 제작자 5명 참여 | README 배지 5+ |
| W8 | 한국 커뮤니티 확산 | GeekNews 50+ 추천 |

---

## 8. 실행 우선순위 요약

```
즉시 (이번 주)
├── P0-1. 다크 모드 구현
├── P0-2. 반응형 개선
├── P0-4. GitHub topics 추가
└── P0-5. OG Image 생성

다음 주
├── 1-1. Reddit 포스트 (r/ClaudeAI, r/ClaudeCode)
├── 1-2. Twitter/X 빌드 스레드
├── 1-4. awesome-* PR 제출
└── 1-5. 한국 커뮤니티 (GeekNews)

2-4주
├── 2-1. SEO 블로그 1편 ("스킬 추천 TOP 10")
├── 2-2. 스킬 제작자 아웃리치 10명
└── 2-3. 주간 스킬 하이라이트 시작

5-6주
├── 3-1. Hacker News Show HN
└── 3-2. Product Hunt 런칭

7주+
└── Phase 4 지속 성장 루틴
```

---

## Resume Prompt

```
skill-directory 마케팅 플랜 이어서 진행.
docs/plans/2026-02-16-marketing-plan.md 읽고 현재 Phase 확인 후 실행.
```
