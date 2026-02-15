-- Add snapshot columns for weekly trending delta calculation.
ALTER TABLE skills
  ADD COLUMN IF NOT EXISTS view_count_snapshot integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS install_count_snapshot integer DEFAULT 0,
  ADD COLUMN IF NOT EXISTS good_count_snapshot integer DEFAULT 0;
