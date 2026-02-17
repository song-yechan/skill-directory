import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { source = 'web' } = await request.json();

  if (!['web', 'cli', 'skill'].includes(source)) {
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
