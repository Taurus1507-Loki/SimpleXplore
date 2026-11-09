import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import {
  ADMIN_SESSION_COOKIE,
  CUSTOMER_SESSION_COOKIE,
  verifyAdminSessionToken,
  verifyCustomerSessionToken,
} from './admin-session';
import { isSupabaseConfigured } from './supabase/config';
import { createServerSupabaseClient } from './supabase/server';

/**
 * Server-only authorization helpers.
 *
 * Admin status is never derived from an email typed into a form, from a plain
 * cookie, or from Supabase `user_metadata` (which users can set themselves at
 * sign-up). It comes only from a signed session cookie that the server issues
 * after verifying credentials in /api/auth/login.
 */

export function getConfiguredAdminEmail(): string | null {
  const email = process.env.ADMIN_EMAIL?.toLowerCase().trim();
  return email || null;
}

export async function getAdminSession(): Promise<{ email: string } | null> {
  const token = cookies().get(ADMIN_SESSION_COOKIE)?.value;
  return verifyAdminSessionToken(token);
}

export interface CustomerIdentity {
  /** Stable key for per-customer data (Supabase user id, or `demo:<email>` in demo mode). */
  id: string;
  email: string;
}

/**
 * The signed-in shopper, verified server-side.
 * Live mode: Supabase Auth (`getUser()` validates the JWT with Supabase).
 * Demo mode: signed `sx_customer_session` cookie issued by /api/auth/login or /register.
 */
export async function getCustomer(): Promise<CustomerIdentity | null> {
  if (isSupabaseConfigured()) {
    try {
      const supabase = await createServerSupabaseClient();
      const { data } = await supabase.auth.getUser();
      if (data.user?.email) return { id: data.user.id, email: data.user.email };
    } catch {
      // fall through
    }
    return null;
  }
  const session = await verifyCustomerSessionToken(cookies().get(CUSTOMER_SESSION_COOKIE)?.value);
  return session ? { id: `demo:${session.email}`, email: session.email } : null;
}

/** Returns a 401 response when the caller is not the admin, otherwise null. */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
