import { NextResponse } from 'next/server';
import { db } from '@/lib/db';

export const dynamic = 'force-dynamic';

/** Public brand info (already visible on every page) for the generated social preview image. */
export async function GET() {
  const s = await db.getSettings();
  return NextResponse.json(
    { name: s.site_name, tagline: s.tagline },
    { headers: { 'Cache-Control': 'public, max-age=300, s-maxage=300' } }
  );
}
