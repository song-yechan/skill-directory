import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getClientIp } from '@/lib/ip';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);

  // Rate limit: 10 installs per minute per IP
  const rateLimitClient = createPublicClient();
  const { data: allowed, error: rlError } = await rateLimitClient.rpc('check_rate_limit', {
    p_identifier: ip,
    p_endpoint: 'install',
    p_limit: 10,
    p_window_seconds: 60,
  });
  if (rlError || allowed === false) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }

  const { id: skillId } = await params;
  const { source = 'web' } = await request.json();

  if (!['web', 'cli', 'skill', 'find-skill'].includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  // Try to get logged-in user
  let userId: string | null = null;
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    userId = user?.id ?? null;
  } catch {
    // Not logged in — continue without user_id
  }

  const supabase = createPublicClient();
  const { error } = await supabase.rpc('track_install', {
    p_skill_id: skillId,
    p_source: source,
    p_user_id: userId,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/skills', 'page');
  return NextResponse.json({ success: true });
}
