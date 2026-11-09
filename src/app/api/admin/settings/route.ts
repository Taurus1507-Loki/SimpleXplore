import { NextRequest, NextResponse } from 'next/server';
import { audit } from '@/lib/audit';
import { requireAdminApi } from '@/lib/auth';
import { db } from '@/lib/db';
import { validateSettingsInput } from '@/lib/settings-validation';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { update, errors } = validateSettingsInput(await req.json());
    if (errors.length || !update) return NextResponse.json({ error: errors.join(' ') }, { status: 400 });
    const updated = await db.updateSettings(update);
    await audit('settings.update', 'settings', null, { fields: Object.keys(update) });
    return NextResponse.json({ success: true, settings: updated });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}
