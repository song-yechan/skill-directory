-- 1. name_ko 컬럼 추가
ALTER TABLE skills ADD COLUMN IF NOT EXISTS name_ko TEXT;

-- 2. 투표 원자적 증감 RPC (SECURITY DEFINER → anon key로 호출 가능)
CREATE OR REPLACE FUNCTION adjust_vote_count(
  p_skill_id UUID,
  p_vote_type TEXT,
  p_delta INT
)
RETURNS VOID AS $$
BEGIN
  IF p_vote_type NOT IN ('good', 'bad') THEN
    RAISE EXCEPTION 'Invalid vote type: %', p_vote_type;
  END IF;

  IF p_vote_type = 'good' THEN
    UPDATE skills SET good_count = GREATEST(good_count + p_delta, 0) WHERE id = p_skill_id;
  ELSE
    UPDATE skills SET bad_count = GREATEST(bad_count + p_delta, 0) WHERE id = p_skill_id;
  END IF;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. 설치 추적 RPC (SECURITY DEFINER → anon key로 호출 가능)
CREATE OR REPLACE FUNCTION track_install(
  p_skill_id UUID,
  p_source TEXT
)
RETURNS VOID AS $$
BEGIN
  IF p_source NOT IN ('web', 'cli', 'skill') THEN
    RAISE EXCEPTION 'Invalid source: %', p_source;
  END IF;

  INSERT INTO installs (skill_id, user_id, source)
  VALUES (p_skill_id, NULL, p_source);
  -- trigger on_install will update install_count automatically
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 4. increment_view도 SECURITY DEFINER로 재생성 (일관성)
CREATE OR REPLACE FUNCTION increment_view(p_skill_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE skills SET view_count = view_count + 1 WHERE id = p_skill_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;
