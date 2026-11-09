import { NextRequest, NextResponse } from 'next/server';
import { db } from '@/lib/db';
import { isSafeExternalUrl } from '@/lib/utils/ssrf';

export async function GET(req: NextRequest, { params }: { params: { id: string } }) {
  const productId = params.id;
  const product = await db.getProductById(productId);

  if (!product || !product.affiliate_url) {
    return NextResponse.redirect(new URL('/products', req.url));
  }

  // Extract analytics context
  const referrer = req.headers.get('referer') || undefined;
  const userAgent = req.headers.get('user-agent') || undefined;
  const urlObj = new URL(req.url);
  const campaign = urlObj.searchParams.get('utm_campaign') || urlObj.searchParams.get('ref') || 'direct';
  const sessionId = req.cookies.get('sx_session')?.value || `sess_${Math.random().toString(36).substring(2, 10)}`;

  // Record click asynchronously
  try {
    await db.trackAffiliateClick({
      productId: product.id,
      referrer,
      campaign,
      sessionId,
      userAgent,
    });
  } catch (err) {
    console.error('Failed to log affiliate click:', err);
  }

  // SSRF and Destination Safety Check
  const destination = product.affiliate_url;
  const safe = isSafeExternalUrl(destination);
  if (!safe.isSafe) {
    console.warn(`Blocked unsafe affiliate redirect destination: ${destination}`);
    return NextResponse.redirect(new URL(`/products/${product.slug}?error=invalid_destination`, req.url));
  }

  // Set anonymous session cookie if not set, and 302 redirect with no-cache
  const response = NextResponse.redirect(destination, { status: 302 });
  response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  response.headers.set('X-Robots-Tag', 'noindex, nofollow');
  response.cookies.set('sx_session', sessionId, {
    maxAge: 60 * 60 * 24 * 30, // 30 days
    httpOnly: true,
    sameSite: 'lax',
  });

  return response;
}

