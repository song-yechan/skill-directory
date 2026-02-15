import { NextResponse } from 'next/server';
import { createAdminClient } from '@/lib/supabase/admin';

/**
 * Anonymous voting: directly increment/decrement good_count or bad_count.
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

  const supabase = createAdminClient();

  // If changing vote (e.g. good → bad), decrement previous
  if (previous_vote && previous_vote !== vote_type) {
    const prevCol = previous_vote === 'good' ? 'good_count' : 'bad_count';
    const { data: skill } = await supabase.from('skills').select(prevCol).eq('id', skillId).single();
    if (skill) {
      await supabase.from('skills').update({ [prevCol]: Math.max((skill as Record<string, number>)[prevCol] - 1, 0) }).eq('id', skillId);
    }
  }

  // Increment new vote
  const col = vote_type === 'good' ? 'good_count' : 'bad_count';
  const { data: skill } = await supabase.from('skills').select(col).eq('id', skillId).single();
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }
  await supabase.from('skills').update({ [col]: (skill as Record<string, number>)[col] + 1 }).eq('id', skillId);

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

  const supabase = createAdminClient();
  const col = vote_type === 'good' ? 'good_count' : 'bad_count';
  const { data: skill } = await supabase.from('skills').select(col).eq('id', skillId).single();
  if (!skill) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }
  await supabase.from('skills').update({ [col]: Math.max((skill as Record<string, number>)[col] - 1, 0) }).eq('id', skillId);

  return NextResponse.json({ success: true });
}
