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
