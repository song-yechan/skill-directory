import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';
import { rateLimit } from './lib/rate-limit';
import { getClientIp } from './lib/ip';

const intlMiddleware = createIntlMiddleware(routing);

function handleApiRateLimit(request: NextRequest): NextResponse | null {
  const ip = getClientIp(request.headers);
  const method = request.method;

  const isWrite = method === 'POST' || method === 'DELETE';
  const bucket = isWrite ? 'write' : 'read';
  const limit = isWrite ? 20 : 60;
  const windowMs = 60_000; // 1 minute

  const key = `${ip}:${bucket}`;
  const result = rateLimit(key, limit, windowMs);

  if (!result.allowed) {
    const retryAfter = Math.ceil((result.resetAt - Date.now()) / 1000);
    return NextResponse.json(
      { error: 'Too many requests' },
      {
        status: 429,
        headers: {
          'Retry-After': String(retryAfter),
          'Access-Control-Allow-Origin': '*',
        },
      }
    );
  }

  return null;
}

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // API routes — rate limit only, no intl/auth
  if (pathname.startsWith('/api/')) {
    const blocked = handleApiRateLimit(request);
    if (blocked) return blocked;
    return NextResponse.next();
  }

  // Locale routes — intl + Supabase session (existing logic)
  const intlResponse = intlMiddleware(request);

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return request.cookies.getAll();
        },
        setAll(cookiesToSet) {
          cookiesToSet.forEach(({ name, value, options }) => {
            intlResponse.cookies.set(name, value, options);
          });
        },
      },
    }
  );

  await supabase.auth.getUser();

  return intlResponse;
}

export const config = {
  matcher: ['/', '/(ko|en)/:path*', '/api/:path*'],
};
