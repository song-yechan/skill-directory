import { createClient } from 'https://esm.sh/@supabase/supabase-js@2';

Deno.serve(async (req) => {
  const authHeader = req.headers.get('Authorization');
  if (authHeader !== `Bearer ${Deno.env.get('CRON_SECRET')}`) {
    return new Response('Unauthorized', { status: 401 });
  }

  const supabase = createClient(
    Deno.env.get('SUPABASE_URL')!,
    Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
  );

  const GITHUB_TOKEN = Deno.env.get('GITHUB_TOKEN')!;
  const ANTHROPIC_API_KEY = Deno.env.get('ANTHROPIC_API_KEY')!;

  // 1. GitHub에서 스킬 레포 검색
  // 2. 각 레포의 README 수집
  // 3. Claude API로 구조화 추출
  // 4. Supabase에 upsert

  // TODO: collector.ts와 extractor.ts 로직을 Edge Function용 Deno 호환으로 인라인

  return new Response(JSON.stringify({ success: true }), {
    headers: { 'Content-Type': 'application/json' }
  });
});
