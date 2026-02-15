import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(
  _request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params;
  const supabase = await createClient();

  const { data, error } = await supabase
    .from('skills')
    .select('*')
    .or(`id.eq.${id},slug.eq.${id}`)
    .single();

  if (error || !data) {
    return NextResponse.json({ error: 'Skill not found' }, { status: 404 });
  }

  return NextResponse.json({ skill: data });
}
