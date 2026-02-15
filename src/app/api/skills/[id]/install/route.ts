import { NextResponse } from 'next/server';
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

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  await supabase.from('installs').insert({
    skill_id: skillId,
    user_id: user?.id ?? null,
    source
  });

  return NextResponse.json({ success: true });
}
