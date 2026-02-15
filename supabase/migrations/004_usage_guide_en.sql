-- Add English usage guide column for i18n
-- Existing usage_guide contains Korean content, this adds English variant
ALTER TABLE skills ADD COLUMN IF NOT EXISTS usage_guide_en text;
