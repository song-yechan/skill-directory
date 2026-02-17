# User Dashboard — Implementation Plan

> **작성일**: 2026-02-17
> **상태**: APPROVED
> **규모**: L (7-8 new files, 3-4 modified)

## Overview

로그인 사용자를 위한 개인 대시보드. 설치한 스킬 목록, 사용 패턴 통계, 스킬 제보 기능 제공.

## Requirements

1. **내 설치 스킬**: 설치한 스킬 카드 목록 (날짜순, 투표 표시 포함)
2. **사용 패턴**: 카테고리별 비율 바 + 상위 태그 5개
3. **요약 카드**: 설치 N개, 투표 N개, 가장 많이 쓴 카테고리
4. **스킬 제보**: GitHub URL + 설명 입력 → DB 저장
5. **인증 가드**: 비로그인 시 로그인 유도 CTA (리다이렉트 아님)
6. **기존 호환**: 비로그인 사용자의 localStorage 기반 설치/투표 그대로 유지

## DB Changes

### Modified: `track_install` RPC
- `p_user_id uuid DEFAULT NULL` 파라미터 추가
- 로그인 시 user_id 저장, 아니면 NULL (기존 동작 유지)

### Modified: Vote flow
- 로그인 시 `votes` 테이블에 insert/delete + 기존 `adjust_vote_count` RPC 호출
- 비로그인은 기존 localStorage + RPC only 유지

### New table: `skill_requests`
```sql
create table skill_requests (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  github_url text not null,
  description text,
  status text default 'pending' check (status in ('pending', 'approved', 'rejected')),
  created_at timestamptz default now()
);

alter table skill_requests enable row level security;
create policy "Users read own" on skill_requests for select using (auth.uid() = user_id);
create policy "Users insert own" on skill_requests for insert with check (auth.uid() = user_id);
```

### New RPC: `get_user_dashboard`
```sql
-- 한 번의 호출로 대시보드 데이터 조회
create or replace function get_user_dashboard(p_user_id uuid)
returns json as $$
  select json_build_object(
    'installs', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select i.skill_id, i.created_at, s.name, s.name_ko, s.slug, s.category_id, s.tags,
               s.good_count, s.install_count, s.stars
        from installs i join skills s on s.id = i.skill_id
        where i.user_id = p_user_id
        order by i.created_at desc
      ) t
    ),
    'votes', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select v.skill_id, v.vote_type, s.name, s.name_ko, s.slug
        from votes v join skills s on s.id = v.skill_id
        where v.user_id = p_user_id
      ) t
    ),
    'requests', (
      select coalesce(json_agg(row_to_json(t)), '[]'::json) from (
        select id, github_url, description, status, created_at
        from skill_requests
        where user_id = p_user_id
        order by created_at desc
      ) t
    )
  );
$$ language sql security definer;
```

## Tasks

### T1. DB Migration
- [ ] `skill_requests` 테이블 생성 + RLS
- [ ] `track_install` RPC 수정 (p_user_id 추가)
- [ ] `get_user_dashboard` RPC 생성
- 파일: `supabase/migrations/XXXX_user_dashboard.sql`

### T2. Install/Vote에 user_id 연동
- [ ] `install-command.tsx`: 로그인 시 user_id를 POST body에 포함
- [ ] `vote-button.tsx`: 로그인 시 votes 테이블에 insert/delete + 기존 RPC
- [ ] `/api/skills/[id]/install/route.ts`: user_id 처리
- [ ] 새 API: `POST /api/votes` (로그인 투표 기록)

### T3. Dashboard Page + Components
- [ ] `src/app/[locale]/dashboard/page.tsx` — 서버 컴포넌트, 인증 체크
- [ ] `src/components/dashboard/login-prompt.tsx` — 비로그인 CTA
- [ ] `src/components/dashboard/dashboard-summary.tsx` — 요약 카드 3개
- [ ] `src/components/dashboard/my-skills-list.tsx` — 설치 스킬 목록
- [ ] `src/components/dashboard/usage-pattern.tsx` — 카테고리 바 + 태그

### T4. Skill Request Form
- [ ] `src/components/dashboard/skill-request-form.tsx` — 폼 UI
- [ ] `POST /api/skill-requests` — API 라우트
- [ ] 제출 후 목록에 즉시 반영 (optimistic)

### T5. Navigation + i18n
- [ ] Header에 대시보드 링크 추가 (로그인 시만)
- [ ] `messages/ko.json`, `messages/en.json` — dashboard 네임스페이스

### T6. Integration Test
- [ ] 비로그인 → 로그인 CTA 표시 확인
- [ ] 설치 → 대시보드 반영 확인
- [ ] 스킬 제보 → DB 저장 확인
- [ ] 빌드 성공

## Dependencies
- T1 → T2 → T3 (순차)
- T4는 T1 이후 독립 가능
- T5는 T3 이후
- T6는 전체 완료 후

## Notes
- 차트 라이브러리 없음 — CSS 바 + Tailwind로 통계 표현
- 대시보드는 Dynamic 렌더링 (사용자별 다름, ISR 불가)
- SkillCard 컴포넌트 재사용 (my-skills-list에서)
