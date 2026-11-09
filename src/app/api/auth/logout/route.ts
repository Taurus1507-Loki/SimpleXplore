import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE } from '@/lib/admin-session';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export async function POST() {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      await supabase.auth.signOut();
    } catch {
      // Session may already be gone.
    }
  }
  const res = NextResponse.json({ success: true });
  res.cookies.set(ADMIN_SESSION_COOKIE, '', { path: '/', maxAge: 0 });
  res.cookies.set('sx_user_email', '', { path: '/', maxAge: 0 });
  res.cookies.set('sx_customer_session', '', { path: '/', maxAge: 0 });
  res.cookies.set('sx_admin_demo', '', { path: '/', maxAge: 0 }); // legacy cookie
  return res;
}
