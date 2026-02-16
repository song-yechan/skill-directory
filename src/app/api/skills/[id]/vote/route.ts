import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';

/**
 * Anonymous voting via SECURITY DEFINER RPC.
 * Dedup is handled client-side via localStorage.
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { vote_type, previous_vote } = await request.json();

  if (!['good', 'bad'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const supabase = createPublicClient();

  // If changing vote (e.g. good → bad), decrement previous
  if (previous_vote && previous_vote !== vote_type) {
    const { error } = await supabase.rpc('adjust_vote_count', {
      p_skill_id: skillId,
      p_vote_type: previous_vote,
      p_delta: -1,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  // Increment new vote
  const { error } = await supabase.rpc('adjust_vote_count', {
    p_skill_id: skillId,
    p_vote_type: vote_type,
    p_delta: 1,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/skills', 'page');
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id: skillId } = await params;
  const { vote_type } = await request.json();

  if (!['good', 'bad'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const supabase = createPublicClient();
  const { error } = await supabase.rpc('adjust_vote_count', {
    p_skill_id: skillId,
    p_vote_type: vote_type,
    p_delta: -1,
  });
  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/skills', 'page');
  return NextResponse.json({ success: true });
}
