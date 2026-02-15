-- 카테고리 (6개 고정)
CREATE TABLE categories (
  id TEXT PRIMARY KEY,
  name_en TEXT NOT NULL,
  name_ko TEXT NOT NULL,
  icon TEXT NOT NULL,
  sort_order INT NOT NULL DEFAULT 0
);

-- 스킬
CREATE TABLE skills (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  slug TEXT UNIQUE NOT NULL,
  github_owner TEXT NOT NULL,
  github_repo TEXT NOT NULL,
  github_url TEXT NOT NULL,
  stars INT NOT NULL DEFAULT 0,
  forks INT NOT NULL DEFAULT 0,
  last_github_update TIMESTAMPTZ,

  -- 구조화 추출 데이터
  name TEXT NOT NULL,
  description_en TEXT,
  description_ko TEXT,
  summary_en TEXT,
  summary_ko TEXT,
  install_guide TEXT,
  usage_guide TEXT,
  examples TEXT,
  readme_raw TEXT,

  category_id TEXT REFERENCES categories(id),
  tags TEXT[] DEFAULT '{}',

  -- 플랫폼 시그널
  view_count INT NOT NULL DEFAULT 0,
  install_count INT NOT NULL DEFAULT 0,
  good_count INT NOT NULL DEFAULT 0,
  bad_count INT NOT NULL DEFAULT 0,

  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 투표 (1인 1스킬 1투표)
CREATE TABLE votes (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  vote_type TEXT NOT NULL CHECK (vote_type IN ('good', 'bad')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now(),
  UNIQUE(user_id, skill_id)
);

-- 설치 추적
CREATE TABLE installs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  skill_id UUID NOT NULL REFERENCES skills(id) ON DELETE CASCADE,
  user_id UUID REFERENCES auth.users(id),
  source TEXT NOT NULL CHECK (source IN ('web', 'cli', 'skill')),
  created_at TIMESTAMPTZ NOT NULL DEFAULT now()
);

-- 인덱스
CREATE INDEX idx_skills_category ON skills(category_id);
CREATE INDEX idx_skills_stars ON skills(stars DESC);
CREATE INDEX idx_skills_good_count ON skills(good_count DESC);
CREATE INDEX idx_skills_install_count ON skills(install_count DESC);
CREATE INDEX idx_skills_updated ON skills(updated_at DESC);
CREATE INDEX idx_votes_user_skill ON votes(user_id, skill_id);
CREATE INDEX idx_installs_skill ON installs(skill_id);

-- RLS
ALTER TABLE skills ENABLE ROW LEVEL SECURITY;
ALTER TABLE votes ENABLE ROW LEVEL SECURITY;
ALTER TABLE installs ENABLE ROW LEVEL SECURITY;

-- skills: 누구나 읽기 가능
CREATE POLICY "skills_read" ON skills FOR SELECT USING (true);

-- votes: 로그인 사용자만 본인 투표 CRUD
CREATE POLICY "votes_read" ON votes FOR SELECT USING (true);
CREATE POLICY "votes_insert" ON votes FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "votes_update" ON votes FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "votes_delete" ON votes FOR DELETE USING (auth.uid() = user_id);

-- installs: 삽입만 가능
CREATE POLICY "installs_insert" ON installs FOR INSERT WITH CHECK (true);
CREATE POLICY "installs_read" ON installs FOR SELECT USING (true);

-- 봇 방지: GitHub 계정 생성일 30일 이상 체크 함수
CREATE OR REPLACE FUNCTION check_github_account_age()
RETURNS TRIGGER AS $$
DECLARE
  github_created_at TIMESTAMPTZ;
BEGIN
  SELECT (raw_user_meta_data->>'created_at')::timestamptz
  INTO github_created_at
  FROM auth.users
  WHERE id = NEW.user_id;

  IF github_created_at IS NOT NULL
     AND github_created_at > (now() - INTERVAL '30 days') THEN
    RAISE EXCEPTION 'Account too new to vote';
  END IF;

  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER check_vote_account_age
  BEFORE INSERT ON votes
  FOR EACH ROW EXECUTE FUNCTION check_github_account_age();

-- 투표 시 자동 집계 업데이트
CREATE OR REPLACE FUNCTION update_vote_counts()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'INSERT' THEN
    IF NEW.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count + 1 WHERE id = NEW.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count + 1 WHERE id = NEW.skill_id;
    END IF;
  ELSIF TG_OP = 'DELETE' THEN
    IF OLD.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count - 1 WHERE id = OLD.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count - 1 WHERE id = OLD.skill_id;
    END IF;
  ELSIF TG_OP = 'UPDATE' THEN
    IF OLD.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count - 1 WHERE id = OLD.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count - 1 WHERE id = OLD.skill_id;
    END IF;
    IF NEW.vote_type = 'good' THEN
      UPDATE skills SET good_count = good_count + 1 WHERE id = NEW.skill_id;
    ELSE
      UPDATE skills SET bad_count = bad_count + 1 WHERE id = NEW.skill_id;
    END IF;
  END IF;
  RETURN COALESCE(NEW, OLD);
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_vote_change
  AFTER INSERT OR UPDATE OR DELETE ON votes
  FOR EACH ROW EXECUTE FUNCTION update_vote_counts();

-- 설치 시 자동 집계
CREATE OR REPLACE FUNCTION update_install_count()
RETURNS TRIGGER AS $$
BEGIN
  UPDATE skills SET install_count = install_count + 1 WHERE id = NEW.skill_id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER on_install
  AFTER INSERT ON installs
  FOR EACH ROW EXECUTE FUNCTION update_install_count();

-- 뷰 카운트 증가 RPC
CREATE OR REPLACE FUNCTION increment_view(p_skill_id UUID)
RETURNS VOID AS $$
BEGIN
  UPDATE skills SET view_count = view_count + 1 WHERE id = p_skill_id;
END;
$$ LANGUAGE plpgsql;
