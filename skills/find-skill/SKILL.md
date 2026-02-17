# /find-skill — AI 기반 스킬 검색 & 맞춤 추천 & 원클릭 설치

사용자의 프로젝트 환경과 설치된 스킬을 분석해서, 가장 적합한 Claude Code 스킬을 찾아주고 바로 설치합니다.

## 이런 경우에 사용하세요

- "커밋 관련 좋은 스킬 없을까?"
- "테스트 자동화 스킬 찾아줘"
- "code-review 태그로 인기 스킬 보여줘"
- "commit-helper 설치해줘"

## 실행 흐름

### Step 1: 환경 분석 (검색 전 자동 실행)

**1-1. 설치된 스킬 수집**

Glob 도구로 `~/.claude/skills/*/SKILL.md` 패턴을 검색합니다.
디렉토리명이 slug입니다. 이 목록을 기억해둡니다.

**1-2. 프로젝트 컨텍스트 감지**

현재 작업 디렉토리에서 아래 파일 중 존재하는 것을 Read로 읽어 기술 스택을 파악합니다:

| 파일 | 감지 대상 |
|------|-----------|
| `CLAUDE.md` | 프로젝트 종류, 스택, 규칙 |
| `package.json` | dependencies에서 프레임워크 (next, react, vue, svelte, express 등) |
| `Cargo.toml` | Rust |
| `requirements.txt` / `pyproject.toml` | Python |
| `Package.swift` | Swift/iOS |
| `go.mod` | Go |

파일이 없으면 건너뜁니다. 감지된 스택 키워드를 기억해둡니다.

### Step 2: API 검색

```bash
curl -s "https://skill-directory-livid.vercel.app/api/skills?q=<검색어>&sort=installs&limit=20"
```

**파라미터:**

| 파라미터 | 설명 | 예시 |
|----------|------|------|
| `q` | 키워드 검색 (이름, 설명, 태그) | `q=commit` |
| `category` | 카테고리 필터 | `category=development` |
| `tag` | 태그 필터 | `tag=code-review` |
| `sort` | 정렬 (stars, good, installs, views, recent) | `sort=installs` |
| `limit` | 결과 수 (최대 100) | `limit=20` |

**카테고리:** development, testing, devops, productivity, docs, other

### Step 3: 필터링 & 추천 순위

API 결과를 아래 기준으로 **순서대로** 처리합니다. 모든 단계를 반드시 수행할 것.

**3-1. 설치 제외**
- Step 1의 slug 목록과 대조하여 이미 설치된 스킬 제거
- slug가 정확히 일치하지 않아도 name이 같으면 제외 (예: 설치된 `ui-ux-pro-max` = API의 `nextlevelbuilder-ui-ux-pro-max-skill`)

**3-2. 검색어 관련성 필터 (오탐 제거)**
- 각 결과의 `name`, `name_ko`, `summary_en`, `summary_ko`, `tags`를 확인
- 검색어가 위 필드에 **하나도 포함되지 않는** 결과는 제거 (description에서만 매칭된 오탐)
- 검색어가 포함되어 있더라도, **스킬의 핵심 목적과 무관한 부수적 언급**이면 제거
  - 예: "design"으로 검색했는데 "from design to deployment"에서 매칭 → 이 스킬의 핵심은 deployment이므로 제거
  - 판단 기준: 스킬의 name과 summary만 읽고 "이게 검색어에 대한 스킬인가?" 자문

**3-3. 프로젝트 컨텍스트 필터**
- CLAUDE.md에서 파악한 프로젝트의 **도메인과 현재 작업**을 기준으로 판단
- 명백한 스택 불일치 제거: Flutter 전용 스킬을 Next.js 프로젝트에 추천하지 않음
- 프로젝트와 무관한 스킬은 포함하되 추천 사유(→)를 붙이지 않음

**3-4. 정렬 & 선택**
- 프로젝트에 구체적으로 도움되는 스킬 우선 (→ 추천 사유를 붙일 수 있는 것)
- 그 다음 범용 스킬을 install_count 순으로
- 최종 상위 10개 선택
- 결과가 3개 이하여도 억지로 채우지 않음

### Step 4: 결과 출력

**반드시 아래 형식을 따를 것.**

먼저 환경 요약 헤더를 출력합니다:

```
프로젝트: <감지된 스택> (없으면 이 줄 생략)
설치 완료: <slug1>, <slug2>, ... (<N>개 제외됨)
```

그 다음 검색 결과를 구분선 카드 형식으로 출력합니다:

```
#1  UI/UX Pro Max (설치 287)
    데이터 기반 디자인 시스템 생성
    → React 프론트엔드 프로젝트에 적합
─────────────────────────────────────
#2  스프레드시트 파일 관리 (설치 245)
    다양한 스프레드시트 파일 관리 및 생성
─────────────────────────────────────
#3  Frontend Design (설치 134)
    독창적인 프론트엔드 UI를 디자인하고 구현해요
    → React 컴포넌트 작업에 활용 가능
```

**필드 매핑:**
- 1행: `#번호  name_ko ?? name (설치 install_count)`
- 2행: `    summary_ko ?? summary_en`
- 3행 (선택): `    → 추천 사유` — 프로젝트 스택과 관련성이 있을 때만 표시
- 구분선: `─────────────────────────────────────`

**규칙:**
- 결과가 없으면: "검색 결과가 없습니다. 다른 키워드로 시도해보세요."
- 사용자가 설치를 원하면 번호로 지정 가능 (예: "2번 설치해줘")
- 추천 사유(→ 줄)는 명확한 관련성이 있을 때만. 억지로 붙이지 않음

## 설치

사용자가 특정 스킬의 설치를 요청하면 아래 순서로 진행합니다.

**1) 스킬 정보 확인**

검색 결과에서 해당 스킬의 `github_url`, `slug`, `id`를 확인합니다.
결과가 없으면 API로 재조회:
```bash
curl -s "https://skill-directory-livid.vercel.app/api/skills?q=<slug>&limit=5"
```

**2) GitHub에서 SKILL.md 다운로드**

`github_url`에서 owner/repo를 추출하고 순서대로 시도합니다:
```bash
# 1순위: main 브랜치 SKILL.md
curl -fsSL "https://raw.githubusercontent.com/<owner>/<repo>/main/SKILL.md"

# 2순위: master 브랜치 SKILL.md
curl -fsSL "https://raw.githubusercontent.com/<owner>/<repo>/master/SKILL.md"

# 3순위: README.md로 대체
curl -fsSL "https://raw.githubusercontent.com/<owner>/<repo>/main/README.md"
```

**3) 로컬에 저장**

```bash
mkdir -p ~/.claude/skills/<slug>
```
다운로드한 내용을 `~/.claude/skills/<slug>/SKILL.md`에 Write 도구로 저장합니다.

**4) 설치 추적**

```bash
curl -s -X POST "https://skill-directory-livid.vercel.app/api/skills/<id>/install" \
  -H "Content-Type: application/json" \
  -d '{"source":"find-skill"}'
```

**5) 완료 안내**

- 설치 경로: `~/.claude/skills/<slug>/SKILL.md`
- Claude Code가 자동으로 인식하며, 다음 대화부터 `/slug`로 사용 가능
- 웹 상세: `https://skill-directory-livid.vercel.app/ko/skills/<slug>`

## API 응답 예시

```json
{
  "skills": [
    {
      "id": "uuid",
      "slug": "skill-name",
      "name": "Skill Name",
      "name_ko": "스킬 이름",
      "summary_en": "English summary",
      "summary_ko": "한국어 요약",
      "stars": 42,
      "good_count": 10,
      "install_count": 50,
      "category_id": "development",
      "tags": ["code-review", "automation"],
      "github_url": "https://github.com/owner/repo"
    }
  ],
  "count": 1
}
```
