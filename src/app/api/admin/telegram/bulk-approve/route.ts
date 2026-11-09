import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';

export async function POST(req: NextRequest) {
  try {
    const { importIds } = await req.json();

    if (!Array.isArray(importIds) || importIds.length === 0) {
      return NextResponse.json({ error: 'Array of import IDs is required' }, { status: 400 });
    }

    let approvedCount = 0;
    for (const id of importIds) {
      const result = await db.approveAndPublishTelegramImport(id);
      if (result.success) {
        approvedCount++;
      }
    }

    return NextResponse.json({
      success: true,
      count: approvedCount,
      message: `Successfully approved and published ${approvedCount} draft(s).`,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

