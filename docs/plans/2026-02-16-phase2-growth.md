# Phase 2: Growth & Distribution Plan

> **현재 상태**: Phase 1 완료 + A1/A2 완료 + Sprint 1 완료 (검색/관련스킬/API). 다크모드/반응형부터 진행.
> **Compact 후 복구**: 이 파일의 맨 아래 "Resume Prompt" 섹션을 그대로 붙여넣기.

---

## Current State (2026-02-16)

### 완료된 작업
- [x] **A1 데이터**: 148개 스킬 enrichment (ko/en), seed 필터, name_ko 분리
- [x] **A2 SEO**: generateMetadata, sitemap, robots.txt, JSON-LD, generateStaticParams
- [x] **버그픽스**: 투표/설치 API (SECURITY DEFINER RPC), 클라이언트 에러 핸들링
- [x] **성능**: 스킬 목록 클라이언트 사이드 필터링 (Dynamic → SSG)

### 현재 코드베이스 상태
- 148개 스킬, 6개 카테고리, 투표/설치/뷰 추적 작동 중
- ISR 60s + revalidatePath로 캐시 무효화
- ko/en 완전 i18n (UI + DB 필드)
- 라이브: https://skill-directory-livid.vercel.app

---

## A3. UX 개선 (다음 작업)

### T1. 관련 스킬 추천 ⭐ 우선순위 높음
- 스킬 상세 페이지 하단에 "관련 스킬" 섹션 추가
- 로직: 같은 category_id → 공통 tag 수 기준 정렬 → 상위 4개
- 서버 사이드에서 계산 (ISR 캐싱 가능)
- 파일: `src/app/[locale]/skills/[slug]/page.tsx`

### T2. 검색 개선
- 현재: Enter 키 입력 시 클라이언트 필터링 (이미 빠름)
- 개선: 타이핑 중 실시간 필터 (debounce 300ms)
- 파일: `src/components/skills/skills-list-client.tsx`

### T3. 다크 모드
- CSS Variables 기반이므로 `:root` / `[data-theme="dark"]` 전환
- `components/layout/` 에 ThemeToggle 추가
- `globals.css`에 다크 모드 변수 세트

### T4. 반응형 개선
- 모바일 카테고리 바: 가로 스크롤 + 현재 선택 표시
- 스킬 카드 그리드: 1열(모바일) → 2열(태블릿) → 3열(데스크톱)
- 상세 페이지 사이드바: 모바일에서 상단으로 이동

---

## A4. API & CLI

### T5. `/find-skill` Claude Code 스킬
- 사용자가 Claude Code 안에서 `claude skill search <keyword>` 실행
- REST API `/api/skills?q=keyword` 호출 → 결과 반환
- `~/.claude/skills/find-skill/SKILL.md` 생성

### T6. npm CLI 패키지
- `npx claude-skill install <slug>` → SKILL.md 다운로드 + `~/.claude/skills/<slug>/` 배치
- GitHub raw content에서 직접 fetch

---

## B. 마케팅 전략

### B1. 런칭 채널 (우선순위순)

| 채널 | 전략 | 시기 |
|------|------|------|
| **Reddit** | r/ClaudeAI, r/anthropic 게시 | A3 완료 후 즉시 |
| **Twitter/X** | "I built an app store for Claude Code skills" 스레드 | Reddit과 동시 |
| **Claude Code Discord** | 커뮤니티에 공유 | 동시 |
| **Hacker News** | "Show HN: Claude Skill Hub" | Reddit 반응 확인 후 |
| **Product Hunt** | "App Store for Claude Code" | 제품 완성 후 |

### B2. 콘텐츠
1. "Claude Code 스킬 베스트 10" — SEO 키워드: "claude code 스킬"
2. "Claude Code 스킬 만드는 법 — 5분 가이드" — 작성자 유입
3. "AI 코딩 에이전트 비교 — Cursor vs Claude Code vs Copilot" — 비교 트래픽

### B3. SEO 키워드

| 키워드 | 의도 | 대응 |
|--------|------|------|
| claude code skills | 탐색 | 홈 |
| claude code 스킬 추천 | 정보 | 블로그 |
| claude code skill install | 거래 | 상세 |
| best claude code extensions | 비교 | 블로그 |

---

## C. 로드맵

### Sprint 1 (완료): 검색 + 관련 스킬 + API
- [x] T1. 관련 스킬 추천
- [x] T2. 검색 실시간 필터 (debounce) + Hero 드롭다운 프리뷰 + 태그 검색 + 빈 결과 인기 태그 추천
- [ ] T3. 다크 모드
- [ ] T4. 반응형 개선
- [x] T5. `/find-skill` 스킬 + API CORS + name_ko/summary 검색 + tag 파라미터
- [x] README 정리 + .env.local.example

### Sprint 2 (다음): 다크모드 + 반응형 + 런칭
- [x] T3. 다크 모드
- [x] T4. 반응형 개선 (헤더 햄버거 + 상세 페이지 사이드바)
- [x] OG Image (next/og edge)
- [x] GitHub topics 추가
- [x] 마케팅 플랜 작성 (`docs/plans/2026-02-16-marketing-plan.md`)
- [ ] T6. npm CLI 패키지
- [ ] Reddit/Discord/Twitter 첫 공유

### Sprint 3: 런칭 & 성장
- [ ] Product Hunt 준비
- [ ] Hacker News "Show HN"
- [ ] 블로그 시리즈 1편
- [ ] 스킬 작성자 연락

---

## D. KPI (8주 후)

| 지표 | 목표 |
|------|------|
| 등록 스킬 수 | 300+ |
| 주간 방문자 | 1,000+ |
| 총 설치 수 | 500+ |
| GitHub Stars | 100+ |
| 구글 검색 노출 키워드 | 10+ |

---

## Resume Prompt

> **아래 프롬프트를 compact/clear 후 첫 메시지로 붙여넣으면 컨텍스트가 복구됩니다.**

```
skill-directory 프로젝트 Phase 2 이어서 진행해줘.

현재 상태:
- Phase 1 완료, Phase 2 A1(데이터)/A2(SEO) 완료
- 148개 스킬, 투표/설치/뷰 모두 작동 중
- 배포: https://skill-directory-livid.vercel.app

다음 작업:
1. `docs/plans/2026-02-16-phase2-growth.md` 읽어서 Sprint 2 확인
2. T3 다크 모드부터 시작

규칙:
- CLAUDE.md 먼저 읽어서 아키텍처/컨벤션 파악
- 작업 완료마다 CLAUDE.md + Phase 2 플랜 체크박스 업데이트
- 커밋 후 push (Vercel 자동 배포)
```
