# Phase 2: Growth & Distribution Plan

> Phase 1 완료 (핵심 UI + 데이터 파이프라인). Phase 2는 제품 완성도 향상 + 외부 공유/마케팅에 집중.

---

## A. 제품 완성도 (구현 우선순위순)

### A1. 데이터 품질 강화
- [ ] seed 필터 재정비 — description/name에 "claude" 필수, MIN_STARS 조정
- [ ] enrich 실패 스킬 재시도 로직 (Gemini 429 시 큐잉)
- [ ] 수동 스킬 제출 폼 (GitHub URL 입력 → 관리자 승인)
- [ ] 스킬별 스크린샷/데모 GIF 지원 (og:image 활용)

### A2. SEO & 메타데이터
- [ ] 각 스킬 상세 페이지에 `generateMetadata` — title, description, og:image
- [ ] sitemap.xml 자동 생성 (`app/sitemap.ts`)
- [ ] robots.txt
- [ ] JSON-LD 구조화 데이터 (SoftwareApplication schema)
- [ ] 정적 빌드 최적화 — `generateStaticParams`로 인기 스킬 100개 사전 빌드

### A3. UX 개선
- [ ] 스킬 상세 페이지 — 관련 스킬 추천 (같은 카테고리/태그 기반)
- [ ] 검색 자동완성 (debounce + Supabase textSearch)
- [ ] 카테고리 아이콘 시각화 (현재 텍스트만)
- [ ] 다크 모드
- [ ] 스킬 비교 기능 (2-3개 선택 후 사이드바이사이드)

### A4. API & CLI
- [ ] REST API 문서화 (OpenAPI/Swagger)
- [ ] `npx claude-skill install <slug>` CLI 패키지 배포 (npm)
- [ ] 설치 시 `~/.claude/skills/<slug>/` 자동 구성
- [ ] `/find-skill` Claude Code 스킬 — API 기반 검색+설치

---

## B. 마케팅 & 배포 전략

### B1. 런칭 채널 (우선순위)

| 채널 | 전략 | 예상 효과 | 시기 |
|------|------|----------|------|
| **GitHub README** | anthropics/skills에 PR로 디렉토리 링크 추가 제안 | 공식 인정 시 폭발적 트래픽 | 즉시 |
| **Product Hunt** | "Claude Skill Hub — App Store for Claude Code" 런칭 | 개발자 초기 유입, 소셜 증거 | A2 완료 후 |
| **Reddit** | r/ClaudeAI, r/anthropic, r/ChatGPT 게시 | 타겟 커뮤니티 직접 접근 | 즉시 |
| **Twitter/X** | "I built an app store for Claude Code skills" 스레드 | 바이럴 가능성, 개발자 DM 유입 | 즉시 |
| **Hacker News** | "Show HN: Claude Skill Hub" | 대규모 개발자 트래픽 | Product Hunt과 동시 |
| **Claude Code Discord** | 커뮤니티에 공유 | 핵심 사용자 접근 | 즉시 |

### B2. 콘텐츠 마케팅

#### 블로그 시리즈 (content-blog 스킬 활용)
1. **"Claude Code 스킬 베스트 10 — 2026년 개발자 필수"** — SEO 키워드: "claude code 스킬", "클로드 코드 활용"
2. **"Claude Code 스킬 만드는 법 — 5분 가이드"** — 스킬 제작자 유입 목적
3. **"AI 코딩 에이전트 도구 비교 — Cursor vs Claude Code vs Copilot"** — 비교 검색 트래픽

#### 소셜 콘텐츠
- 주간 "Skill of the Week" 트윗/포스트
- 새 스킬 등록 시 자동 트윗 (GitHub Actions → Twitter API)
- 스킬 작성자 인터뷰/소개

### B3. SEO 전략

#### 타겟 키워드
| 키워드 | 의도 | 대응 페이지 |
|--------|------|------------|
| claude code skills | 탐색 | 홈페이지 |
| claude code 스킬 추천 | 정보 | 블로그 |
| claude code skill install | 거래 | 스킬 상세 |
| claude code testing skill | 세부 | 카테고리 필터 |
| best claude code extensions | 비교 | 블로그 |

#### 기술 SEO
- ISR 60s로 검색엔진 크롤링 최적화 (이미 적용됨)
- 각 스킬 페이지가 독립 검색 결과로 노출되도록 canonical URL
- hreflang 태그 (ko/en 언어별 페이지)

### B4. 커뮤니티 성장 플라이휠

```
스킬 작성자가 등록 → 디렉토리에 노출 → 사용자 설치/투표
        ↑                                      ↓
  작성자에게 통계 제공 ← 인기도 데이터 축적 ← 트래픽 유입
```

#### 작성자 유인 전략
- **배지 시스템** — 스킬 상세에 "Featured", "Trending", "Community Pick" 배지
- **작성자 프로필** — GitHub 프로필 연동, 제작 스킬 목록
- **통계 대시보드** — 내 스킬의 조회수, 설치수, 투표 추이
- **자동 알림** — 내 스킬이 투표/설치될 때 이메일 알림

### B5. 파트너십 & 생태계

| 파트너 | 방식 | 기대 효과 |
|--------|------|----------|
| Anthropic | 공식 디렉토리 인정, Skills 레포 연동 | 신뢰도 + 트래픽 |
| MCP 서버 개발자 | MCP 도구를 스킬로 래핑하여 등록 | 콘텐츠 확대 |
| Claude Code 인플루언서 | 사용 후기, 튜토리얼 | 인지도 |
| 개발 블로거 | 게스트 포스트, 스킬 리뷰 | SEO 백링크 |

---

## C. 구현 로드맵

### Week 1-2: 기반 다지기
- [ ] SEO 메타데이터 + sitemap + robots.txt
- [ ] JSON-LD 구조화 데이터
- [ ] README 정리 + .env.local.example 생성
- [ ] Reddit/Discord/Twitter 첫 공유

### Week 3-4: 제품 강화
- [ ] 관련 스킬 추천
- [ ] 검색 자동완성
- [ ] 수동 스킬 제출 폼
- [ ] CLI 패키지 (npm 배포)

### Week 5-6: 런칭
- [ ] Product Hunt 준비 (스크린샷, 데모 GIF, 카피)
- [ ] Hacker News "Show HN" 게시
- [ ] 블로그 시리즈 1편 발행
- [ ] 스킬 작성자 5명에게 개별 연락

### Week 7-8: 성장
- [ ] 작성자 통계 대시보드
- [ ] 주간 뉴스레터 / "Skill of the Week"
- [ ] 다크 모드
- [ ] 스킬 비교 기능

---

## D. 성공 지표 (KPI)

| 지표 | 목표 (8주 후) |
|------|-------------|
| 등록 스킬 수 | 300+ |
| 주간 방문자 | 1,000+ |
| 총 설치 수 | 500+ |
| GitHub Stars | 100+ |
| Product Hunt 순위 | Top 5 of the day |
| 구글 검색 노출 키워드 | 10+ |
