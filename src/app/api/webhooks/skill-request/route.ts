import { NextRequest, NextResponse } from 'next/server';
import { Resend } from 'resend';

interface WebhookPayload {
  readonly type: 'INSERT' | 'UPDATE' | 'DELETE';
  readonly table: string;
  readonly schema: string;
  readonly record: {
    readonly id: string;
    readonly github_url: string;
    readonly description: string | null;
    readonly status: string;
    readonly created_at: string;
    readonly user_id: string;
  };
  readonly old_record: unknown;
}

export async function POST(request: NextRequest) {
  const webhookSecret = process.env.WEBHOOK_SECRET ?? '';
  const adminEmail = process.env.ADMIN_EMAIL ?? '';

  // Verify webhook secret
  const secret = request.headers.get('x-webhook-secret');
  if (!webhookSecret || secret !== webhookSecret) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  if (!adminEmail) {
    return NextResponse.json(
      { error: 'ADMIN_EMAIL not configured' },
      { status: 500 }
    );
  }

  const payload = (await request.json()) as WebhookPayload;

  if (payload.type !== 'INSERT' || payload.table !== 'skill_requests') {
    return NextResponse.json({ ok: true, skipped: true });
  }

  const { github_url, description, created_at, user_id } = payload.record;

  const resend = new Resend(process.env.RESEND_API_KEY);
  const { error } = await resend.emails.send({
    from: 'Skill Directory <onboarding@resend.dev>',
    to: adminEmail,
    subject: `[Skill Directory] 새 스킬 제보: ${github_url}`,
    html: `
      <h2>새 스킬 제보가 접수되었습니다</h2>
      <table style="border-collapse:collapse;font-family:sans-serif;">
        <tr><td style="padding:8px;font-weight:bold;">GitHub URL</td><td style="padding:8px;"><a href="${escapeHtml(github_url)}">${escapeHtml(github_url)}</a></td></tr>
        <tr><td style="padding:8px;font-weight:bold;">설명</td><td style="padding:8px;">${escapeHtml(description ?? '(없음)')}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">제보자 ID</td><td style="padding:8px;">${escapeHtml(user_id)}</td></tr>
        <tr><td style="padding:8px;font-weight:bold;">제보 시각</td><td style="padding:8px;">${escapeHtml(created_at)}</td></tr>
      </table>
      <br/>
      <p><a href="https://supabase.com/dashboard/project/ktspcmbjksxwbwtdgggy/editor/skill_requests">Supabase에서 확인하기</a></p>
    `,
  });

  if (error) {
    console.error('Email send failed:', error);
    return NextResponse.json({ error: 'Email send failed' }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}

function escapeHtml(str: string): string {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}
