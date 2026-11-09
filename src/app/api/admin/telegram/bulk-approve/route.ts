import { audit } from '@/lib/audit';
import { requireAdminApi } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const { importIds } = await req.json();

    if (!Array.isArray(importIds) || importIds.length === 0) {
      return NextResponse.json({ error: 'Array of import IDs is required' }, { status: 400 });
    }

    let approvedCount = 0;
    const skipped: Array<{ id: string; reason: string }> = [];
    for (const id of importIds) {
      const result = await db.approveAndPublishTelegramImport(id);
      if (result.success) {
        approvedCount++;
        await audit('telegram.approve_publish', 'telegram_import', id, { bulk: true, product_id: result.product?.id });
      } else {
        skipped.push({ id, reason: result.error || 'Could not publish' });
      }
    }

    return NextResponse.json({
      success: true,
      count: approvedCount,
      skipped,
      message: skipped.length
        ? `Published ${approvedCount} draft(s). ${skipped.length} need details first (e.g. image or price).`
        : `Successfully approved and published ${approvedCount} draft(s).`,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

