import { createClient } from '@supabase/supabase-js';

export function createAdminClient() {
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 'https://placeholder.supabase.co';
  const serviceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY || 'dummy_service_role_key';

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false,
    },
    global: {
      // Next.js caches fetch() by default; database reads must always be fresh
      // (e.g. settings saved in the admin panel, new Telegram imports).
      fetch: (input, init) => fetch(input, { ...init, cache: 'no-store' }),
    },
  });
}
