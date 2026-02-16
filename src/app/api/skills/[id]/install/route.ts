import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { source = 'web' } = await request.json();

  if (!['web', 'cli', 'skill'].includes(source)) {
    return NextResponse.json({ error: 'Invalid source' }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase.rpc('track_install', {
    p_skill_id: skillId,
    p_source: source,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/skills', 'page');
  return NextResponse.json({ success: true });
}
