import type { ProductAvailability } from '@/types';
import * as cheerio from 'cheerio';
import { isSafeExternalUrl } from '@/lib/utils/ssrf';

export interface ExtractedProductInfo {
  title?: string;
  description?: string;
  price?: number;
  original_price?: number;
  discount?: number;
  retailer: string;
  image_url?: string;
  category?: string;
  rating?: number;
  review_count?: number;
  highlights?: string[];
  /** Only set when the page states it (schema.org availability or product:availability meta). */
  availability?: ProductAvailability;
}

/**
 * Map schema.org / Open Graph availability values to ours. Unknown values → undefined (never guessed).
 * e.g. "https://schema.org/InStock", "instock", "out of stock", "LimitedAvailability".
 */
export function normalizeAvailability(value: unknown): ProductAvailability | undefined {
  if (typeof value !== 'string') return undefined;
  const v = value.toLowerCase().replace(/^https?:\/\/schema\.org\//, '').replace(/[\s_-]+/g, '');
  if (['instock', 'onlineonly', 'instoreonly', 'available'].includes(v)) return 'in_stock';
  if (['outofstock', 'soldout', 'discontinued', 'oos', 'unavailable'].includes(v)) return 'out_of_stock';
  if (['limitedavailability', 'limited', 'lowstock'].includes(v)) return 'limited';
  return undefined;
}

export function detectRetailer(url: string): string {
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.toLowerCase();

    if (host.includes('amazon') || host.includes('amzn.to')) return 'Amazon India';
    if (host.includes('flipkart') || host.includes('fkrt.it')) return 'Flipkart';
    if (host.includes('myntra')) return 'Myntra';
    if (host.includes('nykaa')) return 'Nykaa';
    if (host.includes('tatacliq')) return 'Tata CLiQ';
    if (host.includes('ajio')) return 'Ajio';
    if (host.includes('croma')) return 'Croma';
    if (host.includes('meesho')) return 'Meesho';
    if (host.includes('reliancedigital')) return 'Reliance Digital';

    // Fallback to domain name capitalized
    const parts = host.replace(/^www\./, '').split('.');
    if (parts.length > 0 && parts[0]) {
      return parts[0].charAt(0).toUpperCase() + parts[0].slice(1);
    }
  } catch {
    // Ignore error
  }
  return 'Online Retailer';
}

/**
 * Compliantly extracts product metadata from the destination webpage.
 * Reads OpenGraph, JSON-LD, Twitter cards, and standard semantic HTML.
 * Never bypasses anti-bot/CAPTCHA gates.
 */
export async function extractMetadataFromUrl(destinationUrl: string): Promise<ExtractedProductInfo> {
  const retailer = detectRetailer(destinationUrl);
  const info: ExtractedProductInfo = {
    retailer,
    highlights: [],
  };

  const safeCheck = isSafeExternalUrl(destinationUrl);
  if (!safeCheck.isSafe) {
    throw new Error(`SSRF blocked: ${safeCheck.reason}`);
  }

  try {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const response = await fetch(destinationUrl, {
      signal: controller.signal,
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36 SimpleXploreBot/1.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,*/*;q=0.8',
        'Accept-Language': 'en-IN,en;q=0.9',
      },
    });

    clearTimeout(timeoutId);

    if (!response.ok) {
      return info;
    }

    const html = await response.text();
    const $ = cheerio.load(html);

    // 1. JSON-LD Extraction (Highest fidelity structured data)
    $('script[type="application/ld+json"]').each((_, elem) => {
      try {
        const rawJson = $(elem).html();
        if (!rawJson) return;
        const parsed = JSON.parse(rawJson);
        const ldData = Array.isArray(parsed) ? parsed[0] : parsed;

        if (ldData && (ldData['@type'] === 'Product' || ldData['@type'] === 'IndividualProduct')) {
          if (!info.title && ldData.name) info.title = String(ldData.name).trim();
          if (!info.description && ldData.description) info.description = String(ldData.description).trim();
          if (!info.image_url && ldData.image) {
            info.image_url = Array.isArray(ldData.image) ? ldData.image[0] : ldData.image;
          }

          if (ldData.offers) {
            const offer = Array.isArray(ldData.offers) ? ldData.offers[0] : ldData.offers;
            const availability = normalizeAvailability(offer?.availability);
            if (availability) info.availability = availability;
            if (offer && offer.price) {
              const numericPrice = parseFloat(String(offer.price).replace(/[^0-9.]/g, ''));
              if (!isNaN(numericPrice) && numericPrice > 0) {
                info.price = numericPrice;
              }
            }
          }

          if (ldData.aggregateRating) {
            const ratingValue = parseFloat(ldData.aggregateRating.ratingValue);
            if (!isNaN(ratingValue)) info.rating = ratingValue;
            const reviewCount = parseInt(ldData.aggregateRating.reviewCount || ldData.aggregateRating.ratingCount, 10);
            if (!isNaN(reviewCount)) info.review_count = reviewCount;
          }
        }
      } catch {
        // Continue to other tags if JSON parse fails
      }
    });

    // 2. OpenGraph & Meta Tags Fallbacks
    if (!info.title) {
      info.title = 
        $('meta[property="og:title"]').attr('content') ||
        $('meta[name="twitter:title"]').attr('content') ||
        $('title').text().trim() ||
        undefined;

      // Clean typical retailer suffixes from title
      if (info.title) {
        info.title = info.title
          .replace(/ : Buy .* online at .*$/i, '')
          .replace(/ \| Flipkart.*$/i, '')
          .replace(/ : Amazon\.in: .*$/i, '')
          .replace(/ \| Myntra.*$/i, '')
          .trim();
      }
    }

    if (!info.image_url) {
      info.image_url =
        $('meta[property="og:image"]').attr('content') ||
        $('meta[name="twitter:image"]').attr('content') ||
        undefined;
    }

    if (!info.description) {
      info.description =
        $('meta[property="og:description"]').attr('content') ||
        $('meta[name="twitter:description"]').attr('content') ||
        $('meta[name="description"]').attr('content') ||
        undefined;
    }

    if (!info.availability) {
      info.availability = normalizeAvailability(
        $('meta[property="product:availability"]').attr('content') ||
          $('meta[property="og:availability"]').attr('content') ||
          $('link[itemprop="availability"]').attr('href') ||
          $('meta[itemprop="availability"]').attr('content')
      );
    }

    // 3. Price Fallbacks from meta or common selectors
    if (!info.price) {
      const priceMeta = 
        $('meta[property="product:price:amount"]').attr('content') ||
        $('meta[property="og:price:amount"]').attr('content');

      if (priceMeta) {
        const num = parseFloat(priceMeta.replace(/[^0-9.]/g, ''));
        if (!isNaN(num) && num > 0) info.price = num;
      }
    }

  } catch (err) {
    console.warn(`Extraction error for ${destinationUrl}:`, err);
  }

  return info;
}

