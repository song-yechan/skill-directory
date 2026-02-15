import { createClient } from '@supabase/supabase-js';

/**
 * Admin Supabase client with service role key.
 * Server-only: for API routes that need to bypass RLS.
 */
export function createAdminClient() {
  return createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.SUPABASE_SERVICE_ROLE_KEY!
  );
}
