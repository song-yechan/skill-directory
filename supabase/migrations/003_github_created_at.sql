-- Store GitHub repo creation date for "New" badge calculation.
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS github_created_at timestamptz;
