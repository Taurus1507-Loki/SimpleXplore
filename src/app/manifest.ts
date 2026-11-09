import type { MetadataRoute } from 'next';
import { db } from '@/lib/db';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export default async function manifest(): Promise<MetadataRoute.Manifest> {
  const s = await db.getSettings();
  const name = s.site_name || SITE_NAME;
  return {
    name: `${name} — ${s.tagline || SITE_TAGLINE}`,
    short_name: name,
    description: SITE_DESCRIPTION,
    start_url: '/',
    display: 'standalone',
    background_color: '#F7F9F7',
    theme_color: '#106B36',
    icons: s.logo_url ? [{ src: s.logo_url, sizes: 'any' }] : [{ src: '/icon.svg', sizes: 'any', type: 'image/svg+xml' }],
  };
}
