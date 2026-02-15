import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { source = 'web' } = await request.json();

  if (!['web', 'cli', 'skill'].includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const supabase = createAdminClient();

  await supabase.from('installs').insert({
    skill_id: skillId,
    user_id: null,
    source,
  });

  return NextResponse.json({ success: true });
}
