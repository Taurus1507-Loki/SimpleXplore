import { requireAdminApi } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { importId, action, productData } = await req.json();

    if (!importId) {
      return NextResponse.json({ error: 'Import ID is required' }, { status: 400 });
    }

    if (action === 'approve_and_publish') {
      const result = await db.approveAndPublishTelegramImport(importId, productData);
      if (!result.success) {
        return NextResponse.json({ error: result.error || 'Approval failed' }, { status: 500 });
      }
      return NextResponse.json({ success: true, product: result.product });
    }

    if (action === 'reject') {
      const success = await db.rejectTelegramImport(importId);
      return NextResponse.json({ success });
    }

    return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

