import { createClient as createSupabaseClient } from '@supabase/supabase-js';

/**
 * Public Supabase client for read-only pages.
 * Does NOT use cookies() → enables ISR/static caching.
 */
export function createPublicClient() {
  return createSupabaseClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
  );
}
