-- Rate limiting table for write endpoints (vote, install)
CREATE TABLE IF NOT EXISTS api_rate_limits (
  identifier TEXT NOT NULL,
  endpoint TEXT NOT NULL,
  window_start TIMESTAMPTZ NOT NULL,
  request_count INT NOT NULL DEFAULT 1,
  PRIMARY KEY (identifier, endpoint, window_start)
);

-- Enable RLS (no direct access policies — only SECURITY DEFINER functions)
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- RPC: check and increment rate limit (atomic)
-- Returns TRUE if the request is allowed, FALSE if rate limited.
CREATE OR REPLACE FUNCTION check_rate_limit(
  p_identifier TEXT,
  p_endpoint TEXT,
  p_limit INT,
  p_window_seconds INT
)
RETURNS BOOLEAN
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  v_window_start TIMESTAMPTZ;
  v_count INT;
BEGIN
  -- Fixed window: floor epoch to window boundary
  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  -- Atomic upsert: insert or increment
  INSERT INTO api_rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (md5(p_identifier), p_endpoint, v_window_start, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  -- Probabilistic cleanup: ~1% of requests clean old entries (older than 5 minutes)
  IF random() < 0.01 THEN
    DELETE FROM api_rate_limits
    WHERE window_start < now() - INTERVAL '5 minutes';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

-- Only grant function execution to anon (no direct table access)
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INT, INT) TO anon;
