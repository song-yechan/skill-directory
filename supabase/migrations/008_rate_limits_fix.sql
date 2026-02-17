-- Fix: Enable RLS on api_rate_limits
ALTER TABLE api_rate_limits ENABLE ROW LEVEL SECURITY;

-- Fix: Update function with probabilistic cleanup (was running DELETE on every request)
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
  v_window_start := to_timestamp(
    floor(extract(epoch FROM now()) / p_window_seconds) * p_window_seconds
  );

  INSERT INTO api_rate_limits (identifier, endpoint, window_start, request_count)
  VALUES (md5(p_identifier), p_endpoint, v_window_start, 1)
  ON CONFLICT (identifier, endpoint, window_start)
  DO UPDATE SET request_count = api_rate_limits.request_count + 1
  RETURNING request_count INTO v_count;

  -- Probabilistic cleanup: ~1% of requests clean old entries
  IF random() < 0.01 THEN
    DELETE FROM api_rate_limits
    WHERE window_start < now() - INTERVAL '5 minutes';
  END IF;

  RETURN v_count <= p_limit;
END;
$$;

-- Fix: Revoke direct table access from anon (SECURITY DEFINER handles it)
REVOKE ALL ON api_rate_limits FROM anon;
GRANT EXECUTE ON FUNCTION check_rate_limit(TEXT, TEXT, INT, INT) TO anon;
