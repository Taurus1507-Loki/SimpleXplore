import { NextRequest, NextResponse } from 'next/server';
import {
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  createCustomerSessionToken,
  isAdminSessionConfigured,
} from '@/lib/admin-session';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';

export const dynamic = 'force-dynamic';

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

/** Customer sign-up. Public registrations are always customers — the role is never taken from input. */
export async function POST(req: NextRequest) {
  let body: { email?: unknown; password?: unknown; fullName?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  const fullName = typeof body.fullName === 'string' ? body.fullName.trim().slice(0, 100) : '';

  if (!EMAIL_RE.test(email)) return NextResponse.json({ error: 'Enter a valid email address.' }, { status: 400 });
  if (password.length < 8) return NextResponse.json({ error: 'Password must be at least 8 characters.' }, { status: 400 });

  if (isSupabaseConfigured()) {
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signUp({
      email,
      password,
      options: { data: { full_name: fullName } },
    });
    if (error) return NextResponse.json({ error: error.message }, { status: 400 });
    // With email confirmation enabled Supabase returns no session until the link is clicked.
    const needsConfirmation = !data.session;
    const res = NextResponse.json({ success: true, needsConfirmation, redirect: needsConfirmation ? null : '/products' });
    if (!needsConfirmation) res.cookies.set('sx_user_email', email, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
    return res;
  }

  if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true' || !isAdminSessionConfigured()) {
    return NextResponse.json({ error: 'Registration is not available right now.' }, { status: 503 });
  }

  // Demo mode: no real user store, but the signed session keeps each shopper's wishlist separate.
  const res = NextResponse.json({ success: true, needsConfirmation: false, redirect: '/products' });
  res.cookies.set(CUSTOMER_SESSION_COOKIE, await createCustomerSessionToken(email), {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: CUSTOMER_SESSION_MAX_AGE,
  });
  res.cookies.set('sx_user_email', email, { sameSite: 'lax', path: '/', maxAge: 60 * 60 * 24 });
  return res;
}
