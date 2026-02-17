import { NextResponse } from 'next/server';
import { createPublicClient } from '@/lib/supabase/public';

const headers = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Methods': 'GET, OPTIONS',
  'Access-Control-Allow-Headers': 'Content-Type',
};

/** Strip PostgREST filter meta-characters to prevent filter injection */
function sanitizeFilter(input: string): string {
  return input.replace(/[,.()"{}\\]/g, '');
}

export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const q = searchParams.get('q');
  const category = searchParams.get('category');
  const tag = searchParams.get('tag');
  const sort = searchParams.get('sort') ?? 'stars';
  const limit = Math.min(parseInt(searchParams.get('limit') ?? '50'), 100);
  const offset = parseInt(searchParams.get('offset') ?? '0');

  const supabase = createPublicClient();

  let query = supabase
    .from('skills')
    .select('id, slug, name, name_ko, summary_en, summary_ko, stars, good_count, bad_count, view_count, install_count, category_id, tags, github_url, updated_at');

  if (category) {
    query = query.eq('category_id', sanitizeFilter(category));
  }

  if (q) {
    const safe = sanitizeFilter(q);
    const lower = safe.toLowerCase();
    query = query.or(
      `name.ilike.%${safe}%,name_ko.ilike.%${safe}%,summary_en.ilike.%${safe}%,summary_ko.ilike.%${safe}%,description_en.ilike.%${safe}%,description_ko.ilike.%${safe}%,tags.cs.{${lower}}`
    );
  }

  if (tag) {
    query = query.contains('tags', [sanitizeFilter(tag)]);
  }

  const sortMap: Record<string, string> = {
    stars: 'stars',
    good: 'good_count',
    installs: 'install_count',
    views: 'view_count',
    recent: 'updated_at'
  };

  query = query
    .order(sortMap[sort] ?? 'stars', { ascending: false })
    .range(offset, offset + limit - 1);

  const { data, error } = await query;

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500, headers });
  }

  return NextResponse.json({ skills: data, count: data?.length ?? 0 }, { headers });
}

export async function OPTIONS() {
  return new Response(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}
