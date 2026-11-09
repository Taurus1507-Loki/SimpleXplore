import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { retryTelegramImport } from '@/lib/telegram/service';

export const dynamic = 'force-dynamic';
export const maxDuration = 30;

/** Re-run extraction for a failed Telegram import. Success creates a DRAFT product — never published. */
export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let importId: unknown;
  try {
    ({ importId } = await req.json());
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }
  if (typeof importId !== 'string' || !importId) {
    return NextResponse.json({ error: 'importId is required.' }, { status: 400 });
  }

  const result = await retryTelegramImport(importId);
  if (!result.ok) {
    return NextResponse.json({ success: false, error: result.error, import: result.import ?? null }, { status: 422 });
  }
  return NextResponse.json({ success: true, import: result.import });
}
