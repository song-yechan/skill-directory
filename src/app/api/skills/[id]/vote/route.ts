import { NextResponse } from 'next/server';
import { revalidatePath } from 'next/cache';
import { createPublicClient } from '@/lib/supabase/public';
import { createClient } from '@/lib/supabase/server';
import { headers } from 'next/headers';
import { getClientIp } from '@/lib/ip';

async function checkWriteRateLimit(ip: string): Promise<NextResponse | null> {
  const supabase = createPublicClient();
  const { data: allowed, error } = await supabase.rpc('check_rate_limit', {
    p_identifier: ip,
    p_endpoint: 'vote',
    p_limit: 10,
    p_window_seconds: 60,
  });

  if (error || allowed === false) {
    return NextResponse.json(
      { error: 'Too many requests' },
      { status: 429, headers: { 'Retry-After': '60' } }
    );
  }
  return null;
}

async function getAuthUser() {
  try {
    const authClient = await createClient();
    const { data: { user } } = await authClient.auth.getUser();
    return user;
  } catch {
    return null;
  }
}

/**
 * Vote flow:
 * - Logged in: insert/upsert into votes table (trigger auto-updates counts)
 * - Not logged in: use adjust_vote_count RPC directly (localStorage dedup on client)
 */
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rateLimited = await checkWriteRateLimit(ip);
  if (rateLimited) return rateLimited;

  const { id: skillId } = await params;
  const { vote_type, previous_vote } = await request.json();

  if (!['good', 'bad'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const user = await getAuthUser();
  const supabase = createPublicClient();

  if (user) {
    // Logged in: use votes table (triggers handle count updates)
    const authClient = await createClient();

    if (previous_vote && previous_vote !== vote_type) {
      // Change vote: update existing record
      const { error } = await authClient
        .from('votes')
        .update({ vote_type })
        .eq('user_id', user.id)
        .eq('skill_id', skillId);
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    } else {
      // New vote: insert
      const { error } = await authClient
        .from('votes')
        .upsert({ user_id: user.id, skill_id: skillId, vote_type }, {
          onConflict: 'user_id,skill_id',
        });
      if (error) {
        return NextResponse.json({ error: error.message }, { status: 500 });
      }
    }
  } else {
    // Not logged in: use RPC (existing behavior)
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

    const { error } = await supabase.rpc('adjust_vote_count', {
      p_skill_id: skillId,
      p_vote_type: vote_type,
      p_delta: 1,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/skills', 'page');
  return NextResponse.json({ success: true });
}

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const hdrs = await headers();
  const ip = getClientIp(hdrs);
  const rateLimited = await checkWriteRateLimit(ip);
  if (rateLimited) return rateLimited;

  const { id: skillId } = await params;
  const { vote_type } = await request.json();

  if (!['good', 'bad'].includes(vote_type)) {
    return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
  }

  const user = await getAuthUser();
  const supabase = createPublicClient();

  if (user) {
    // Logged in: delete from votes table (trigger handles count)
    const authClient = await createClient();
    const { error } = await authClient
      .from('votes')
      .delete()
      .eq('user_id', user.id)
      .eq('skill_id', skillId);
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  } else {
    // Not logged in: use RPC
    const { error } = await supabase.rpc('adjust_vote_count', {
      p_skill_id: skillId,
      p_vote_type: vote_type,
      p_delta: -1,
    });
    if (error) {
      return NextResponse.json({ error: error.message }, { status: 500 });
    }
  }

  revalidatePath('/[locale]', 'page');
  revalidatePath('/[locale]/skills', 'page');
  return NextResponse.json({ success: true });
}
