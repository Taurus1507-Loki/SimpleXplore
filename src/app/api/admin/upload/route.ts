import { audit } from '@/lib/audit';
import { NextRequest, NextResponse } from 'next/server';
import { randomUUID } from 'crypto';
import { promises as fs } from 'fs';
import path from 'path';
import { requireAdminApi } from '@/lib/auth';
import { isSupabaseConfigured } from '@/lib/supabase/config';
import { createAdminClient } from '@/lib/supabase/admin';
import { MAX_UPLOAD_BYTES, sniffImageType } from '@/lib/utils/image-type';

export const dynamic = 'force-dynamic';
export const runtime = 'nodejs';

const BUCKET = 'product-images';

/** Admin image upload. Live: Supabase Storage (public bucket). Demo: public/uploads on local disk. */
export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  let form: FormData;
  try {
    form = await req.formData();
  } catch {
    return NextResponse.json({ error: 'Expected a file upload.' }, { status: 400 });
  }
  const file = form.get('file');
  if (!(file instanceof Blob)) return NextResponse.json({ error: 'No file received.' }, { status: 400 });
  if (file.size === 0) return NextResponse.json({ error: 'The file is empty.' }, { status: 400 });
  if (file.size > MAX_UPLOAD_BYTES) {
    return NextResponse.json({ error: 'Image is too large. The maximum is 5 MB.' }, { status: 413 });
  }

  const bytes = new Uint8Array(await file.arrayBuffer());
  const type = sniffImageType(bytes);
  if (!type) {
    return NextResponse.json({ error: 'Unsupported file. Upload a JPG, PNG, WebP, GIF or AVIF image.' }, { status: 415 });
  }

  const folder = form.get('folder') === 'categories' ? 'categories' : 'products';
  const name = `${folder}/${new Date().toISOString().slice(0, 7)}/${randomUUID()}.${type.ext}`;

  if (isSupabaseConfigured()) {
    const sb = createAdminClient();
    const { error } = await sb.storage.from(BUCKET).upload(name, bytes, {
      contentType: type.mime,
      cacheControl: '31536000',
      upsert: false,
    });
    if (error) {
      return NextResponse.json(
        { error: `Upload failed: ${error.message}. Has migration 003 (storage bucket) been run?` },
        { status: 500 }
      );
    }
    const { data } = sb.storage.from(BUCKET).getPublicUrl(name);
    await audit('image.upload', 'image', null, { path: name, bytes: file.size });
    return NextResponse.json({ url: data.publicUrl });
  }

  // Demo mode: local disk. Not suitable for serverless hosting — connect Supabase in production.
  const target = path.join(process.cwd(), 'public', 'uploads', name);
  await fs.mkdir(path.dirname(target), { recursive: true });
  await fs.writeFile(target, bytes);
  await audit('image.upload', 'image', null, { path: name, bytes: file.size });
  return NextResponse.json({ url: `/uploads/${name}` });
}
