import { NextRequest, NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  ADMIN_SESSION_MAX_AGE,
  createAdminSessionToken,
  createCustomerSessionToken,
  CUSTOMER_SESSION_COOKIE,
  CUSTOMER_SESSION_MAX_AGE,
  isAdminSessionConfigured,
  safeEqual,
} from '@/lib/admin-session';
import { getConfiguredAdminEmail } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createServerSupabaseClient } from '@/lib/supabase/server';
import { createAdminClient } from '@/lib/supabase/admin';

export const dynamic = 'force-dynamic';

// Basic per-IP brute-force protection (per server instance).
const WINDOW_MS = 15 * 60 * 1000;
const MAX_ATTEMPTS = 10;
const attempts = new Map<string, { count: number; resetAt: number }>();

function rateLimited(ip: string): boolean {
  const now = Date.now();
  const entry = attempts.get(ip);
  if (!entry || entry.resetAt < now) {
    attempts.set(ip, { count: 1, resetAt: now + WINDOW_MS });
    return false;
  }
  entry.count += 1;
  return entry.count > MAX_ATTEMPTS;
}

function safeRedirectPath(path: unknown, fallback: string): string {
  if (typeof path !== 'string' || !path.startsWith('/') || path.startsWith('//')) return fallback;
  return path;
}

const INVALID = 'Invalid email or password.';

export async function POST(req: NextRequest) {
  const ip = req.headers.get('x-forwarded-for')?.split(',')[0]?.trim() || 'local';
  if (rateLimited(ip)) {
    return NextResponse.json({ error: 'Too many sign-in attempts. Try again in 15 minutes.' }, { status: 429 });
  }

  let body: { email?: unknown; password?: unknown; redirect?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const email = typeof body.email === 'string' ? body.email.toLowerCase().trim() : '';
  const password = typeof body.password === 'string' ? body.password : '';
  if (!email || !password) {
    return NextResponse.json({ error: INVALID }, { status: 400 });
  }

  const adminEmail = getConfiguredAdminEmail();
  let isAdmin = false;

  if (isSupabaseConfigured()) {
    // Live mode: Supabase verifies the password; the admin role comes from the
    // profiles table (which customers cannot write — see migration 002).
    const supabase = await createServerSupabaseClient();
    const { data, error } = await supabase.auth.signInWithPassword({ email, password });
    if (error || !data.user) {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }
    const { data: profile } = await createAdminClient()
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();
    isAdmin = profile?.role === 'admin';
  } else {
    // Demo mode (no Supabase): the single admin is configured in server env.
    const adminPassword = process.env.ADMIN_PASSWORD;
    if (adminEmail && email === adminEmail) {
      if (!adminPassword || !safeEqual(password, adminPassword)) {
        return NextResponse.json({ error: INVALID }, { status: 401 });
      }
      isAdmin = true;
    } else if (process.env.NEXT_PUBLIC_DEMO_MODE !== 'true') {
      return NextResponse.json({ error: INVALID }, { status: 401 });
    }
  }

  const res = NextResponse.json({
    success: true,
    isAdmin,
    redirect: isAdmin ? safeRedirectPath(body.redirect, '/admin') : '/products',
  });

  if (isAdmin) {
    if (!isAdminSessionConfigured()) {
      return NextResponse.json(
        { error: 'Admin sign-in is not configured on the server (ADMIN_SESSION_SECRET).' },
        { status: 500 }
      );
    }
    res.cookies.set(ADMIN_SESSION_COOKIE, await createAdminSessionToken(email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: ADMIN_SESSION_MAX_AGE,
    });
  }

  // Demo mode: signed customer session so wishlists can be saved per account.
  if (!isSupabaseConfigured() && isAdminSessionConfigured()) {
    res.cookies.set(CUSTOMER_SESSION_COOKIE, await createCustomerSessionToken(email), {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      path: '/',
      maxAge: CUSTOMER_SESSION_MAX_AGE,
    });
  }

  // Display-only hint for the storefront header. Grants no privileges.
  res.cookies.set('sx_user_email', email, {
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24,
  });

  return res;
}
