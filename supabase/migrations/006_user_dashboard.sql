-- ============================================================
-- 006: User Dashboard — skill_requests + RPC updates
-- ============================================================

-- 1. skill_requests 테이블
CREATE TABLE skill_requests (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  github_url TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'pending' CHECK (status IN ('pending', 'approved', 'rejected')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

ALTER TABLE skill_requests ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own requests" ON skill_requests FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users insert own requests" ON skill_requests FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE INDEX idx_skill_requests_user ON skill_requests(user_id);

-- 2. installs 테이블에 user_id 인덱스 추가 (대시보드 쿼리 성능)
CREATE INDEX idx_installs_user ON installs(user_id) WHERE user_id IS NOT NULL;

-- 3. track_install RPC 수정 — optional user_id 지원
CREATE OR REPLACE FUNCTION track_install(
  p_skill_id UUID,
  p_source TEXT,
  p_user_id UUID DEFAULT NULL
)
RETURNS VOID AS $$
BEGIN
  IF p_source NOT IN ('web', 'cli', 'skill') THEN
    RAISE EXCEPTION 'Invalid source: %', p_source;
  END IF;

  -- 로그인 사용자: 같은 스킬 중복 설치 방지
  IF p_user_id IS NOT NULL THEN
    IF EXISTS (SELECT 1 FROM installs WHERE skill_id = p_skill_id AND user_id = p_user_id) THEN
      RETURN;
    END IF;
  END IF;

  INSERT INTO installs (skill_id, user_id, source)
  VALUES (p_skill_id, p_user_id, p_source);
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. get_user_dashboard RPC — 대시보드 데이터 한 번에 조회
CREATE OR REPLACE FUNCTION get_user_dashboard(p_user_id UUID)
RETURNS JSON AS $$
  SELECT json_build_object(
    'installs', (
      SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json)
      FROM (
        SELECT i.skill_id, i.created_at, s.name, s.name_ko, s.slug,
               s.category_id, s.tags, s.good_count, s.install_count, s.stars
        FROM installs i
        JOIN skills s ON s.id = i.skill_id
        WHERE i.user_id = p_user_id
      ) t
    ),
    'votes', (
      SELECT COALESCE(json_agg(row_to_json(t)), '[]'::json)
      FROM (
        SELECT v.skill_id, v.vote_type, s.name, s.name_ko, s.slug
        FROM votes v
        JOIN skills s ON s.id = v.skill_id
        WHERE v.user_id = p_user_id
      ) t
    ),
    'requests', (
      SELECT COALESCE(json_agg(row_to_json(t) ORDER BY t.created_at DESC), '[]'::json)
      FROM (
        SELECT id, github_url, description, status, created_at
        FROM skill_requests
        WHERE user_id = p_user_id
      ) t
    )
  );
$$ LANGUAGE sql SECURITY DEFINER;
