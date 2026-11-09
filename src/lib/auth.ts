import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { ADMIN_SESSION_COOKIE, verifyAdminSessionToken } from './admin-session';

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

/** Returns a 401 response when the caller is not the admin, otherwise null. */
export async function requireAdminApi(): Promise<NextResponse | null> {
  const session = await getAdminSession();
  if (!session) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  return null;
}
