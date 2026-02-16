import { createServerClient } from '@supabase/ssr';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import createIntlMiddleware from 'next-intl/middleware';
import { routing } from './i18n/routing';

const intlMiddleware = createIntlMiddleware(routing);

export async function middleware(request: NextRequest) {
  // 1. Run next-intl middleware first
  const intlResponse = intlMiddleware(request);

  // 2. Refresh Supabase session (updates cookies on the response)
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

  // Refresh the session — this updates the cookies if needed
  await supabase.auth.getUser();

  return intlResponse;
}

export const config = {
  matcher: ['/', '/(ko|en)/:path*'],
};
