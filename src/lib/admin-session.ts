/**
 * Signed, httpOnly admin session tokens.
 *
 * Uses the Web Crypto API so the same code runs in Edge middleware and in
 * Node route handlers. A token is `base64url(payload).base64url(hmac)` where
 * the HMAC-SHA256 key is ADMIN_SESSION_SECRET (server-only, min 32 chars).
 * Without a valid signature the cookie grants nothing — unlike the previous
 * plain `sx_admin_demo=true` cookie, it cannot be forged from the browser.
 */

export const ADMIN_SESSION_COOKIE = 'sx_admin_session';
export const ADMIN_SESSION_MAX_AGE = 60 * 60 * 8; // 8 hours

interface AdminSessionPayload {
  sub: string; // admin email
  exp: number; // unix seconds
}

const encoder = new TextEncoder();

function getSecret(): string | null {
  const secret = process.env.ADMIN_SESSION_SECRET;
  return secret && secret.length >= 32 ? secret : null;
}

export function isAdminSessionConfigured(): boolean {
  return getSecret() !== null;
}

function toBase64Url(bytes: Uint8Array): string {
  let binary = '';
  bytes.forEach((b) => (binary += String.fromCharCode(b)));
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function fromBase64Url(input: string): Uint8Array {
  const padded = input.replace(/-/g, '+').replace(/_/g, '/') + '==='.slice((input.length + 3) % 4);
  const binary = atob(padded);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
  return bytes;
}

async function sign(data: string, secret: string): Promise<string> {
  const key = await crypto.subtle.importKey(
    'raw',
    encoder.encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign']
  );
  const sig = await crypto.subtle.sign('HMAC', key, encoder.encode(data));
  return toBase64Url(new Uint8Array(sig));
}

/** Constant-time string comparison. */
export function safeEqual(a: string, b: string): boolean {
  const ab = encoder.encode(a);
  const bb = encoder.encode(b);
  let diff = ab.length ^ bb.length;
  const len = Math.max(ab.length, bb.length);
  for (let i = 0; i < len; i++) diff |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  return diff === 0;
}

export async function createAdminSessionToken(email: string, now = Date.now()): Promise<string> {
  const secret = getSecret();
  if (!secret) throw new Error('ADMIN_SESSION_SECRET is not configured (min 32 characters).');
  const payload: AdminSessionPayload = {
    sub: email.toLowerCase().trim(),
    exp: Math.floor(now / 1000) + ADMIN_SESSION_MAX_AGE,
  };
  const body = toBase64Url(encoder.encode(JSON.stringify(payload)));
  return `${body}.${await sign(body, secret)}`;
}

export async function verifyAdminSessionToken(
  token: string | undefined | null,
  now = Date.now()
): Promise<{ email: string } | null> {
  const secret = getSecret();
  if (!secret || !token) return null;
  const [body, sig] = token.split('.');
  if (!body || !sig) return null;
  const expected = await sign(body, secret);
  if (!safeEqual(sig, expected)) return null;
  try {
    const payload = JSON.parse(new TextDecoder().decode(fromBase64Url(body))) as AdminSessionPayload;
    if (typeof payload.sub !== 'string' || typeof payload.exp !== 'number') return null;
    if (payload.exp * 1000 < now) return null;
    return { email: payload.sub };
  } catch {
    return null;
  }
}
