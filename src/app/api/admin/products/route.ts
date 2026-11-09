import { requireAdminApi } from '@/lib/auth';
import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils/slugify';

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const data = await req.json();

    if (!data.title || !data.current_price || !data.affiliate_url) {
      return NextResponse.json({ error: 'Title, Current Price, and Affiliate URL are required.' }, { status: 400 });
    }

    const slug = data.slug ? slugify(data.slug) : slugify(data.title) + '-' + Math.random().toString(36).substr(2, 4);

    const { source_import_id: sourceImportId, ...productData } = data;
    const product = await db.createProduct({
      ...productData,
      slug,
      source_type: sourceImportId ? 'telegram' : productData.source_type || 'manual',
      status: productData.status || 'draft',
    });

    // Manual creation from a failed Telegram import: link the import to the new product.
    if (typeof sourceImportId === 'string' && sourceImportId) {
      await db.updateTelegramImport(sourceImportId, {
        product_id: product.id,
        error_message: 'Product created manually by admin',
      });
    }

    return NextResponse.json({ success: true, product });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const data = await req.json();
    if (!data.id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const updated = await db.updateProduct(data.id, data);
    return NextResponse.json({ success: true, product: updated });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const id = req.nextUrl.searchParams.get('id');
    const clearDefaults = req.nextUrl.searchParams.get('clearDefaults') === 'true';

    if (clearDefaults) {
      const all = await db.getProducts({ status: 'all' });
      for (const p of all.products) {
        if (p.source_type === 'manual' && p.id.startsWith('prod-')) {
          await db.deleteProduct(p.id);
        }
      }
      return NextResponse.json({ success: true, message: 'Default products cleared.' });
    }

    if (!id) {
      return NextResponse.json({ error: 'Product ID required' }, { status: 400 });
    }

    const success = await db.deleteProduct(id);
    return NextResponse.json({ success });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

