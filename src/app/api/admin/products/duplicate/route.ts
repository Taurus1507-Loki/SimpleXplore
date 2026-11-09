import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { db } from '@/lib/db';
import { audit } from '@/lib/audit';

export const dynamic = 'force-dynamic';

/** Duplicate a product. The copy is always a draft. */
export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const { id } = await req.json();
    if (typeof id !== 'string' || !id) return NextResponse.json({ error: 'Product id is required.' }, { status: 400 });
    const copy = await db.duplicateProduct(id);
    if (!copy) return NextResponse.json({ error: 'Product not found.' }, { status: 404 });
    await audit('product.duplicate', 'product', copy.id, { from: id, title: copy.title });
    return NextResponse.json({ success: true, product: copy });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
