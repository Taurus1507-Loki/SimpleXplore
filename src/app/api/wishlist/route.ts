import { NextRequest, NextResponse } from 'next/server';
import { getCustomer } from '@/lib/auth';
import { db } from '@/lib/db';
import type { Product } from '@/types';

export const dynamic = 'force-dynamic';

const MAX_ITEMS = 500;

async function listProducts(userId: string): Promise<Product[]> {
  const ids = await db.getWishlistProductIds(userId);
  const products = await Promise.all(ids.map((id) => db.getProductById(id)));
  // Products that were unpublished or deleted silently drop out of the list.
  return products.filter((p): p is Product => !!p && p.status === 'published');
}

/** The signed-in customer's wishlist. 401 means "guest" — the browser keeps a local list instead. */
export async function GET() {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  return NextResponse.json({ products: await listProducts(customer.id) });
}

/** Add one product (`productId`) or merge a guest list (`productIds`) into the account. */
export async function POST(req: NextRequest) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });

  let body: { productId?: unknown; productIds?: unknown };
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: 'Invalid request.' }, { status: 400 });
  }

  const ids = (Array.isArray(body.productIds) ? body.productIds : [body.productId])
    .filter((id): id is string => typeof id === 'string' && id.length > 0 && id.length < 100)
    .slice(0, MAX_ITEMS);
  if (ids.length === 0) return NextResponse.json({ error: 'productId is required.' }, { status: 400 });

  const existing = await db.getWishlistProductIds(customer.id);
  if (existing.length + ids.length > MAX_ITEMS) {
    return NextResponse.json({ error: 'Wishlist is full.' }, { status: 400 });
  }

  for (const id of ids) await db.addToWishlist(customer.id, id);
  return NextResponse.json({ products: await listProducts(customer.id) });
}

export async function DELETE(req: NextRequest) {
  const customer = await getCustomer();
  if (!customer) return NextResponse.json({ error: 'Not signed in' }, { status: 401 });
  const productId = req.nextUrl.searchParams.get('productId');
  if (!productId) return NextResponse.json({ error: 'productId is required.' }, { status: 400 });
  await db.removeFromWishlist(customer.id, productId);
  return NextResponse.json({ success: true });
}
