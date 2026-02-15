import { NextResponse } from 'next/server';
import { createClient } from '@/lib/supabase/server';

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const sort = searchParams.get('sort') ?? 'stars';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const supabase = await createClient();

  let query = supabase
    .from('skills')
    .select('id, slug, name, summary_en, summary_ko, stars, good_count, bad_count, view_count, install_count, category_id, tags, github_url, updated_at');

  if (category) {
    query = query.eq('category_id', category);
  }

  if (q) {
    query = query.or(
      `name.ilike.%${q}%,description_en.ilike.%${q}%,description_ko.ilike.%${q}%`
    );
  }

  const sortMap: Record<string, string> = {
    stars: 'stars',
    good: 'good_count',
    installs: 'install_count',
    recent: 'updated_at'
  };

  query = query
    .order(sortMap[sort] ?? 'stars', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ skills: data, count: data?.length ?? 0 });
}
