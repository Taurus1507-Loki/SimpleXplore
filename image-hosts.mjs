/**
 * Image hosts the Next.js image optimizer may fetch from (shared by next.config.mjs
 * and src/components/SafeImage.tsx).
 *
 * Allowing every host ("**") lets anyone make the server download arbitrary URLs,
 * which several Next.js advisories exploit. Images from other hosts are still shown,
 * but loaded directly by the visitor's browser (unoptimized) instead of by the server.
 */
export const OPTIMIZED_IMAGE_HOSTS = [
  // Supabase Storage (admin uploads)
  '*.supabase.co',
  // Retailer CDNs
  'm.media-amazon.com',
  'images-na.ssl-images-amazon.com',
  'images-eu.ssl-images-amazon.com',
  '*.flixcart.com',
  'assets.myntassets.com',
  'images-static.nykaa.com',
  'images-static.nykaafashion.com',
  'assets.ajio.com',
  'img.tatacliq.com',
  'img.tatacliqluxury.com',
  'images.meesho.com',
  // Demo / seed photos
  'images.unsplash.com',
];
