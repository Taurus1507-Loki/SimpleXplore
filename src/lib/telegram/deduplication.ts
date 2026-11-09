/**
 * Retailer Product ID Extraction and URL Normalization
 * Detects Amazon ASINs, Flipkart PIDs, Myntra Style IDs, etc.
 * to prevent duplicate imports and link updates to existing products.
 */

export interface NormalizedProductIdentity {
  retailer: string;
  productId?: string;
  normalizedUrl: string;
}

export function extractProductIdentity(url: string): NormalizedProductIdentity {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();
    const pathname = parsed.pathname;

    // 1. Amazon (India / Global) - Extract ASIN (10 character alphanumeric)
    if (host.includes('amazon') || host.includes('amzn.to')) {
      const asinMatch = pathname.match(/\/(?:dp|gp\/product|product-reviews|aw\/d)\/([A-Z0-9]{10})/i);
      const asin = asinMatch ? asinMatch[1].toUpperCase() : undefined;
      const normalizedUrl = asin 
        ? `https://www.amazon.in/dp/${asin}`
        : `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;

      return {
        retailer: 'Amazon India',
        productId: asin,
        normalizedUrl,
      };
    }

    // 2. Flipkart - Extract Product ID from /p/itm... or ?pid=...
    if (host.includes('flipkart') || host.includes('fkrt.it')) {
      const pidParam = parsed.searchParams.get('pid');
      const itmMatch = pathname.match(/\/p\/(itm[a-z0-9]+)/i);
      const pid = pidParam || (itmMatch ? itmMatch[1] : undefined);
      const normalizedUrl = pid 
        ? `https://www.flipkart.com/product/p/itm?pid=${pid}`
        : `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;

      return {
        retailer: 'Flipkart',
        productId: pid,
        normalizedUrl,
      };
    }

    // 3. Myntra - Extract numeric style ID (e.g. /shoes/nike/.../231241/buy)
    if (host.includes('myntra')) {
      const idMatch = pathname.match(/\/(\d+)(?:\/buy)?$/);
      const styleId = idMatch ? idMatch[1] : undefined;
      const normalizedUrl = styleId 
        ? `https://www.myntra.com/${styleId}`
        : `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;

      return {
        retailer: 'Myntra',
        productId: styleId,
        normalizedUrl,
      };
    }

    // 4. Nykaa - Extract product ID from /p/1063920
    if (host.includes('nykaa')) {
      const idMatch = pathname.match(/\/p\/([0-9a-zA-Z]+)/);
      const nykaaId = idMatch ? idMatch[1] : undefined;
      const normalizedUrl = nykaaId 
        ? `https://www.nykaa.com/p/${nykaaId}`
        : `${parsed.protocol}//${parsed.hostname}${parsed.pathname}`;

      return {
        retailer: 'Nykaa',
        productId: nykaaId,
        normalizedUrl,
      };
    }

    // General fallback: Strip tracking query parameters (utm_*, tag, ref, affid)
    const cleanUrl = new URL(url);
    const trackingParams = ['tag', 'affid', 'aff', 'ref', 'ref_', 'ascsubtag', 'linkCode'];
    trackingParams.forEach(p => cleanUrl.searchParams.delete(p));
    Array.from(cleanUrl.searchParams.keys()).forEach(k => {
      if (k.startsWith('utm_') || k.startsWith('fbclid') || k.startsWith('gclid')) {
        cleanUrl.searchParams.delete(k);
      }
    });

    return {
      retailer: 'Online Retailer',
      normalizedUrl: cleanUrl.toString(),
    };
  } catch {
    return {
      retailer: 'Online Retailer',
      normalizedUrl: url,
    };
  }
}

