-- Enable pg_net for HTTP requests from PostgreSQL
CREATE EXTENSION IF NOT EXISTS pg_net WITH SCHEMA extensions;

-- Trigger function: send webhook on skill_requests INSERT
CREATE OR REPLACE FUNCTION notify_skill_request()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  PERFORM net.http_post(
    url := 'https://skill-directory-livid.vercel.app/api/webhooks/skill-request',
    headers := '{"Content-Type": "application/json", "x-webhook-secret": "cf8250eb128d60123a037a9d469e3e217677c8314513cec4347a860ba291b418"}'::jsonb,
    body := jsonb_build_object(
      'type', 'INSERT',
      'table', 'skill_requests',
      'schema', 'public',
      'record', jsonb_build_object(
        'id', NEW.id,
        'github_url', NEW.github_url,
        'description', NEW.description,
        'status', NEW.status,
        'created_at', NEW.created_at,
        'user_id', NEW.user_id
      ),
      'old_record', NULL
    )
  );
  RETURN NEW;
END;
$$;

CREATE TRIGGER on_skill_request_insert
  AFTER INSERT ON skill_requests
  FOR EACH ROW
  EXECUTE FUNCTION notify_skill_request();
