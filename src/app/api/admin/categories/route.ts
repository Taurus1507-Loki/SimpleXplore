import { audit } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { requireAdminApi } from '@/lib/auth';
import { db, type CategoryInput } from '@/lib/db';
import { slugify } from '@/lib/utils/slugify';

export const dynamic = 'force-dynamic';

/** Validates and normalises admin input. `partial` allows updates that change only some fields. */
function parseInput(raw: Record<string, unknown>, partial: boolean): { input?: Partial<CategoryInput>; error?: string } {
  const input: Partial<CategoryInput> = {};

  if (raw.name !== undefined || !partial) {
    const name = typeof raw.name === 'string' ? raw.name.trim() : '';
    if (!name) return { error: 'Category name is required.' };
    if (name.length > 80) return { error: 'Category name must be 80 characters or fewer.' };
    input.name = name;
  }

  if (raw.slug !== undefined || !partial) {
    const source = typeof raw.slug === 'string' && raw.slug.trim() ? raw.slug : input.name ?? '';
    const slug = slugify(source);
    if (!slug) return { error: 'Slug must contain letters or numbers.' };
    input.slug = slug;
  }

  if (raw.description !== undefined) {
    input.description = typeof raw.description === 'string' && raw.description.trim() ? raw.description.trim().slice(0, 300) : null;
  }

  if (raw.image !== undefined) {
    const image = typeof raw.image === 'string' ? raw.image.trim() : '';
    if (image && !/^(https:\/\/|\/uploads\/)/.test(image)) return { error: 'Image must be an https:// link or an uploaded image.' };
    input.image = image || null;
  }

  if (raw.parent_id !== undefined) input.parent_id = typeof raw.parent_id === 'string' && raw.parent_id ? raw.parent_id : null;
  if (raw.is_active !== undefined) input.is_active = Boolean(raw.is_active);
  if (raw.sort_order !== undefined) {
    const n = Number(raw.sort_order);
    if (!Number.isFinite(n)) return { error: 'Sort order must be a number.' };
    input.sort_order = Math.round(n);
  }

  return { input };
}

export async function GET() {
  const denied = await requireAdminApi();
  if (denied) return denied;
  return NextResponse.json({ categories: await db.getAllCategories() });
}

export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const { input, error } = parseInput(await req.json(), false);
    if (error || !input) return NextResponse.json({ error }, { status: 400 });
    const category = await db.createCategory(input as CategoryInput);
    await audit('category.create', 'category', category.id, { name: category.name });
    return NextResponse.json({ success: true, category });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}

export async function PATCH(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  try {
    const raw = await req.json();
    if (typeof raw.id !== 'string' || !raw.id) return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
    const { input, error } = parseInput(raw, true);
    if (error || !input) return NextResponse.json({ error }, { status: 400 });
    const category = await db.updateCategory(raw.id, input);
    if (!category) return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    await audit('category.update', 'category', category.id, { name: category.name, fields: Object.keys(input) });
    return NextResponse.json({ success: true, category });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;
  const id = req.nextUrl.searchParams.get('id');
  if (!id) return NextResponse.json({ error: 'Category id is required.' }, { status: 400 });
  try {
    const ok = await db.deleteCategory(id);
    if (!ok) return NextResponse.json({ error: 'Category not found.' }, { status: 404 });
    await audit('category.delete', 'category', id);
    return NextResponse.json({ success: true });
  } catch (e) {
    return NextResponse.json({ error: e instanceof Error ? e.message : String(e) }, { status: 500 });
  }
}
