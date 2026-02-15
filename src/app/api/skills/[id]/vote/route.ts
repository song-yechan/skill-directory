import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { vote_type } = await request.json();

  if (!['good', 'bad'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { error } = await supabase
    .from('votes')
    .upsert(
      { user_id: user.id, skill_id: skillId, vote_type },
      { onConflict: 'user_id,skill_id' }
    );

  if (error) {
    if (error.message.includes('Account too new')) {
      return NextResponse.json({ error: 'account_too_new' }, { status: 403 });
    }
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}

export async function DELETE(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const supabase = await createClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  await supabase
    .from('votes')
    .delete()
    .eq('user_id', user.id)
    .eq('skill_id', skillId);

  return NextResponse.json({ success: true });
}
