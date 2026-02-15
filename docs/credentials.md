# Skill Directory — 외부 서비스 자격 증명 가이드

이 문서는 프로젝트에서 사용하는 외부 서비스의 키/시크릿이 무엇이고 어떤 역할인지 정리합니다.
**실제 값은 `.env.local`에만 보관** (git에 커밋되지 않음).

---

## Supabase

| 항목 | 설명 |
|------|------|
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase 프로젝트의 REST API 엔드포인트. 브라우저/서버 모두에서 DB 요청 시 사용. |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | **공개 키** (anon role). RLS 정책에 의해 허용된 범위만 접근 가능. 브라우저에 노출돼도 안전. |
| `SUPABASE_SERVICE_ROLE_KEY` | **비공개 키** (service_role). RLS를 우회하는 관리자 권한. **절대 브라우저에 노출 금지.** 서버 사이드에서만 사용. |

- **프로젝트 Ref:** `ktspcmbjksxwbwtdgggy`
- **대시보드:** https://supabase.com/dashboard/project/ktspcmbjksxwbwtdgggy
- **리전:** Southeast Asia (Singapore)

---

## GitHub OAuth App

GitHub 로그인(투표 기능)을 위한 OAuth 인증에 사용.

| 항목 | 설명 |
|------|------|
| **Client ID** | OAuth App의 공개 식별자. 로그인 요청 시 GitHub에 "어떤 앱인지" 알려주는 역할. 브라우저에 노출돼도 안전. |
| **Client Secret** | OAuth App의 비밀 키. GitHub가 인증 코드를 액세스 토큰으로 교환할 때 사용. **절대 브라우저에 노출 금지.** Supabase Auth 서버가 내부적으로 사용. |

- **설정 위치:** Supabase Dashboard → Authentication → Providers → GitHub
- **Callback URL:** `https://ktspcmbjksxwbwtdgggy.supabase.co/auth/v1/callback`
- **GitHub 관리:** https://github.com/settings/developers → "Skill Directory"

### 값 변경이 필요한 경우

1. GitHub Developer Settings에서 새 Client Secret 생성
2. Supabase Dashboard → Auth → Providers → GitHub에 새 값 입력
3. `.env.local`에는 Supabase 키만 있으면 됨 (OAuth 시크릿은 Supabase가 보관)

---

## 추후 추가 예정

| 항목 | 용도 | 발급처 |
|------|------|--------|
| `GITHUB_TOKEN` | 스킬 수집 크롤러용 GitHub Personal Access Token | https://github.com/settings/tokens |
| `ANTHROPIC_API_KEY` | README → 구조화 추출에 사용하는 Claude API 키 | https://console.anthropic.com/ |
