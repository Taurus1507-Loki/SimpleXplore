import { db } from '@/lib/db';
import { isSafeExternalUrl } from '@/lib/utils/ssrf';
import { resolveSafeUrl } from './url-unshortener';
import { extractMetadataFromUrl, detectRetailer } from './metadata-extractor';
import { extractProductIdentity } from './deduplication';
import { TelegramImport, Product } from '@/types';

// Regex to detect all URLs inside Telegram message text or caption
const URL_REGEX = /(https?:\/\/[^\s<>"{}|\\^`\[\]]+)/gi;

export interface TelegramChannelPost {
  message_id: number;
  chat: {
    id: number | string;
    title?: string;
    username?: string;
  };
  date: number;
  text?: string;
  caption?: string;
  edit_date?: number;
}

export interface TelegramWebhookUpdate {
  update_id: number;
  channel_post?: TelegramChannelPost;
  edited_channel_post?: TelegramChannelPost;
}

/**
 * Extracts all URLs from raw Telegram message text or caption
 */
export function extractUrlsFromMessage(text?: string | null): string[] {
  if (!text) return [];
  const matches = text.match(URL_REGEX);
  if (!matches) return [];
  // Deduplicate URLs in the same message
  return Array.from(new Set(matches.map(u => u.trim())));
}

/**
 * Extracts pricing hints from Telegram message text (e.g., "Rs 1499", "₹2,499", "at 499")
 */
export function extractPriceHintsFromText(text: string): { price?: number; original_price?: number; discount?: number } {
  const result: { price?: number; original_price?: number; discount?: number } = {};

  // Find discount percentage like "50% off", "40% discount"
  const discountMatch = text.match(/(\d{1,2})%\s*(?:off|discount)/i);
  if (discountMatch) {
    result.discount = parseInt(discountMatch[1], 10);
  }

  // Find prices with Rupee symbol or Rs/INR
  const priceMatches = text.match(/(?:₹|rs\.?|inr)\s*([\d,]+)/gi);
  if (priceMatches && priceMatches.length > 0) {
    const nums = priceMatches
      .map(p => parseInt(p.replace(/[^0-9]/g, ''), 10))
      .filter(n => !isNaN(n) && n > 0);

    if (nums.length === 1) {
      result.price = nums[0];
    } else if (nums.length >= 2) {
      // Typically smaller is current deal price, larger is MRP
      const sorted = [...nums].sort((a, b) => a - b);
      result.price = sorted[0];
      result.original_price = sorted[sorted.length - 1];
      if (!result.discount && result.original_price && result.price) {
        result.discount = Math.round(((result.original_price - result.price) / result.original_price) * 100);
      }
    }
  }

  return result;
}

/** Everything we could learn about one product link (nothing invented beyond the existing fallbacks). */
interface ExtractedListing {
  resolvedUrl: string;
  title: string;
  currentPrice: number;
  originalPrice?: number;
  discount: number;
  extractedPayload: TelegramImport['extracted_data'];
  duplicateProduct?: Product;
  extractionStatus: 'success' | 'partial';
}

/** Steps 2–3: resolve the link safely, read page metadata, merge with price hints and detect duplicates. */
async function extractListing(
  rawUrl: string,
  messageText: string,
  channelName: string,
  priceHints: { price?: number; original_price?: number; discount?: number }
): Promise<ExtractedListing> {
  // 2. Resolve shortened affiliate link safely
  const resolvedUrl = await resolveSafeUrl(rawUrl);
  const retailer = detectRetailer(resolvedUrl);

  // 3. Extract metadata from target product page
  const metadata = await extractMetadataFromUrl(resolvedUrl);

  // Consolidate extracted data with text hints (hints take precedence if metadata scraper misses)
  const currentPrice = metadata.price || priceHints.price || 0;
  const originalPrice = metadata.original_price || priceHints.original_price;
  const discount =
    metadata.discount ||
    priceHints.discount ||
    (originalPrice && currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0);

  // Clean fallback title if target page doesn't have OpenGraph
  let title = metadata.title;
  if (!title) {
    const firstLine = messageText.split('\n')[0].replace(URL_REGEX, '').replace(/[🔥⚡💥deal!]/gi, '').trim();
    title = firstLine.length > 5 ? firstLine : `${retailer} Special Product Deal`;
  }

  // Check for existing duplicates via normalized URL or Retailer Product ID (ASIN, etc.)
  const identity = extractProductIdentity(resolvedUrl);
  const allExisting = await db.getProducts({ status: 'all' });
  const duplicateProduct = allExisting.products.find(p => {
    const pId = extractProductIdentity(p.affiliate_url);
    if (identity.productId && pId.productId && identity.productId === pId.productId) return true;
    return identity.normalizedUrl === pId.normalizedUrl;
  });

  const extractedPayload = {
    title,
    description: metadata.description || messageText.trim(),
    price: currentPrice,
    original_price: originalPrice,
    discount,
    retailer: metadata.retailer || retailer,
    image_url: metadata.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
    category: metadata.category || 'Electronics',
    rating: metadata.rating,
    review_count: metadata.review_count,
    highlights: metadata.highlights && metadata.highlights.length > 0 ? metadata.highlights : ['Discovered via Telegram Channel: ' + channelName],
    raw_message: messageText,
    is_duplicate: !!duplicateProduct,
    duplicate_of_id: duplicateProduct?.id,
    duplicate_of_title: duplicateProduct?.title,
    duplicate_of_status: duplicateProduct?.status,
  };

  return {
    resolvedUrl,
    title,
    currentPrice,
    originalPrice,
    discount,
    extractedPayload,
    duplicateProduct,
    extractionStatus: metadata.title ? 'success' : 'partial',
  };
}

/** Step 4. CRITICAL RULE: every Telegram-imported product is saved as a DRAFT until the admin approves it. */
async function createDraftProduct(listing: ExtractedListing, rawUrl: string): Promise<Product> {
  const { title, currentPrice, originalPrice, discount, extractedPayload } = listing;
  return db.createProduct({
    title,
    slug: title.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/(^-|-$)/g, '') + '-' + Math.random().toString(36).substr(2, 4),
    description: extractedPayload.description,
    highlights: extractedPayload.highlights,
    retailer: extractedPayload.retailer,
    current_price: currentPrice,
    original_price: originalPrice,
    currency: 'INR',
    discount,
    rating: extractedPayload.rating ?? null, // never invent ratings
    review_count: extractedPayload.review_count ?? null,
    image_url: extractedPayload.image_url,
    affiliate_url: rawUrl, // Preserve original affiliate link posted in Telegram
    featured: false,
    trending: false,
    status: 'draft', // MANDATORY DRAFT STATUS
    source_type: 'telegram',
  });
}

export type RetryResult =
  | { ok: true; import: TelegramImport }
  | { ok: false; error: string; import?: TelegramImport | null };

/**
 * Admin "Retry" for a failed import: runs extraction again for the same link.
 * On success the import gets a new DRAFT product (never published) and is no longer marked failed.
 */
export async function retryTelegramImport(importId: string): Promise<RetryResult> {
  const item = await db.getTelegramImportById(importId);
  if (!item) return { ok: false, error: 'Import not found.' };
  if (item.extraction_status !== 'failed') return { ok: false, error: 'Only failed imports can be retried.' };
  if (item.product_id) return { ok: false, error: 'A product already exists for this import.' };

  const rawUrl = item.original_url;
  const safety = isSafeExternalUrl(rawUrl);
  if (!safety.isSafe) return { ok: false, error: `This link can't be fetched safely (${safety.reason}).` };

  const messageText = item.extracted_data?.raw_message || '';
  try {
    const listing = await extractListing(rawUrl, messageText, 'Telegram', extractPriceHintsFromText(messageText));
    const draftProduct = await createDraftProduct(listing, rawUrl);
    const updated = await db.updateTelegramImport(importId, {
      product_id: draftProduct.id,
      affiliate_url: listing.resolvedUrl,
      extracted_data: listing.extractedPayload,
      extraction_status: listing.extractionStatus,
      error_message: null,
    });
    return updated ? { ok: true, import: updated } : { ok: false, error: 'Import disappeared during retry.' };
  } catch (err) {
    const message = err instanceof Error ? err.message : String(err);
    const updated = await db.updateTelegramImport(importId, {
      error_message: `Retry failed (${new Date().toLocaleString('en-IN')}): ${message}`,
    });
    return { ok: false, error: message, import: updated };
  }
}

/**
 * Core processor for incoming Telegram channel posts
 */
export async function processTelegramPost(
  post: TelegramChannelPost,
  updateId: number,
  isEdited = false
): Promise<TelegramImport[]> {
  const messageText = post.text || post.caption || '';
  const detectedUrls = extractUrlsFromMessage(messageText);
  const results: TelegramImport[] = [];

  if (detectedUrls.length === 0) {
    return results;
  }

  const channelId = String(post.chat.id);
  const channelName = post.chat.title || post.chat.username || channelId;
  const priceHints = extractPriceHintsFromText(messageText);

  for (const rawUrl of detectedUrls) {
    // 1. SSRF Safety Check
    const safety = isSafeExternalUrl(rawUrl);
    if (!safety.isSafe) {
      console.warn(`Skipping unsafe URL: ${rawUrl} - ${safety.reason}`);
      continue;
    }

    try {
      const listing = await extractListing(rawUrl, messageText, channelName, priceHints);
      const { resolvedUrl, title, currentPrice, originalPrice, discount, extractedPayload, duplicateProduct } = listing;

      // If this is an edit of an existing unapproved draft, update in-place instead of creating new
      if (isEdited && duplicateProduct && duplicateProduct.status === 'draft') {
        await db.updateProduct(duplicateProduct.id, {
          title,
          current_price: currentPrice,
          original_price: originalPrice,
          discount,
          description: extractedPayload.description,
        });

        const importRecord = await db.createTelegramImport({
          telegram_update_id: `upd-${updateId}`,
          product_id: duplicateProduct.id,
          original_url: rawUrl,
          affiliate_url: resolvedUrl,
          extracted_data: extractedPayload,
          extraction_status: listing.extractionStatus,
          review_status: 'pending',
        });

        results.push(importRecord);
        continue;
      }

      // 4. CRITICAL RULE: Save Product as a DRAFT.
      // Every Telegram-imported product must remain unpublished until admin approves it.
      const draftProduct: Product = await createDraftProduct(listing, rawUrl);

      // 5. Create Telegram Import entry
      const importRecord = await db.createTelegramImport({
        telegram_update_id: `upd-${updateId}`,
        product_id: draftProduct.id,
        original_url: rawUrl,
        affiliate_url: resolvedUrl,
        extracted_data: extractedPayload,
        extraction_status: listing.extractionStatus,
        review_status: 'pending',
      });

      results.push(importRecord);
    } catch (err: unknown) {
      const errMsg = err instanceof Error ? err.message : String(err);
      console.error(`Telegram extraction failure for ${rawUrl}:`, errMsg);

      // Save as failed import so admin can review and retry
      const failedImport = await db.createTelegramImport({
        telegram_update_id: `upd-${updateId}`,
        original_url: rawUrl,
        affiliate_url: rawUrl,
        extracted_data: {
          raw_message: messageText,
          retailer: detectRetailer(rawUrl),
        },
        extraction_status: 'failed',
        error_message: errMsg,
        review_status: 'pending',
      });

      results.push(failedImport);
    }
  }

  return results;
}

