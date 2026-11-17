import { NextRequest, NextResponse } from 'next/server';
import { clientIp, createRateLimiter } from '@/lib/rate-limit';

export const dynamic = 'force-dynamic';

const contactLimit = createRateLimiter({ limit: 5, windowMs: 10 * 60_000 });
const DEFAULT_RECIPIENT = 'simplore01@gmail.com';
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function isValidContact(value: string): boolean {
  if (EMAIL_REGEX.test(value)) return true;
  // Accept phone numbers with at least 7 digits (spaces, +, -, () allowed)
  const digits = value.replace(/\D/g, '');
  return digits.length >= 7 && digits.length <= 15 && /^[+\d\s().-]+$/.test(value);
}

/**
 * Sends contact form submissions directly to the site owner's inbox via Resend,
 * without ever exposing the recipient email address to the browser.
 */
export async function POST(req: NextRequest) {
  const ip = clientIp(req.headers);
  const rate = contactLimit(ip);
  if (!rate.allowed) {
    return NextResponse.json(
      { error: 'Too many messages sent. Please try again in a few minutes.' },
      { status: 429, headers: { 'Retry-After': String(rate.retryAfterSeconds) } }
    );
  }

  let body: Record<string, unknown>;
  try {
    body = (await req.json()) as Record<string, unknown>;
  } catch {
    return NextResponse.json({ error: 'Invalid request body.' }, { status: 400 });
  }

  const name = String(body.name ?? '').trim();
  const contact = String(body.contact ?? '').trim();
  const topic = String(body.topic ?? '').trim();
  const message = String(body.message ?? '').trim();

  if (name.length < 2 || name.length > 100) {
    return NextResponse.json({ error: 'Please enter your name (2–100 characters).' }, { status: 400 });
  }
  if (!isValidContact(contact) || contact.length > 120) {
    return NextResponse.json({ error: 'Please enter a valid phone number or email address.' }, { status: 400 });
  }
  if (topic.length < 2 || topic.length > 120) {
    return NextResponse.json({ error: 'Please select a topic.' }, { status: 400 });
  }
  if (message.length < 5 || message.length > 2000) {
    return NextResponse.json({ error: 'Please enter a message (5–2000 characters).' }, { status: 400 });
  }

  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    console.error('RESEND_API_KEY is not configured; cannot deliver contact message.');
    return NextResponse.json(
      { error: 'Message service is not configured yet. Please try again later.' },
      { status: 503 }
    );
  }

  const recipient = process.env.CONTACT_RECIPIENT_EMAIL || DEFAULT_RECIPIENT;
  const from = process.env.CONTACT_FROM_EMAIL || 'SimpleXplore <onboarding@resend.dev>';
  const isEmail = EMAIL_REGEX.test(contact);

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from,
      to: [recipient],
      ...(isEmail ? { reply_to: contact } : {}),
      subject: `[SimpleXplore] ${topic} — from ${name}`,
      text: [
        `Name: ${name}`,
        `Phone / Email: ${contact}`,
        `Topic: ${topic}`,
        '',
        'Message:',
        message,
      ].join('\n'),
    }),
  });

  if (!res.ok) {
    const errText = await res.text().catch(() => '');
    console.error('Resend API error:', res.status, errText);
    return NextResponse.json(
      { error: 'Could not send your message right now. Please try again later.' },
      { status: 502 }
    );
  }

  return NextResponse.json({ success: true });
}
