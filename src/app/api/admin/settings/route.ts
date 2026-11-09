import { audit } from '@/lib/audit';
import { requireAdminApi } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const data = await req.json();
    const updated = await db.updateSettings(data);
    await audit('settings.update', 'settings', null, { fields: Object.keys(data ?? {}) });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

