import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function POST(request: Request) {
  const authClient = await createClient();
  const { data: { user } } = await authClient.auth.getUser();

  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const { github_url, description } = await request.json();

  if (!github_url || typeof github_url !== 'string') {
    return NextResponse.json({ error: 'github_url is required' }, { status: 400 });
  }

  // Basic GitHub URL validation
  const githubUrlPattern = /^https:\/\/github\.com\/[\w.-]+\/[\w.-]+\/?$/;
  if (!githubUrlPattern.test(github_url)) {
    return NextResponse.json({ error: 'Invalid GitHub URL' }, { status: 400 });
  }

  const { error } = await authClient
    .from('skill_requests')
    .insert({
      user_id: user.id,
      github_url,
      description: description?.trim() || null,
    });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ success: true });
}
