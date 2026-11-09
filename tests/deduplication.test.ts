import { describe, it, expect } from 'vitest';
import { extractProductIdentity } from '../src/lib/telegram/deduplication';
import { processTelegramPost } from '../src/lib/telegram/service';
import { db } from '../src/lib/db';

describe('Retailer Product ID Extraction and Deduplication', () => {
  it('extracts Amazon ASIN accurately and normalizes URL', () => {
    const rawAmazonUrl = 'https://www.amazon.in/Sony-WH-1000XM5-Wireless-Cancelling-Headphones/dp/B09XS7JWHH?tag=mydeal-21&ref=dp_deal_1';
    const identity = extractProductIdentity(rawAmazonUrl);

    expect(identity.retailer).toBe('Amazon India');
    expect(identity.productId).toBe('B09XS7JWHH');
    expect(identity.normalizedUrl).toBe('https://www.amazon.in/dp/B09XS7JWHH');
  });

  it('extracts Flipkart item identifier and normalizes URL', () => {
    const rawFlipkartUrl = 'https://www.flipkart.com/apple-ipad-10th-gen-64-gb/p/itm5a666e138a0c2?pid=MOBG123456&affid=dealsite';
    const identity = extractProductIdentity(rawFlipkartUrl);

    expect(identity.retailer).toBe('Flipkart');
    expect(identity.productId).toBe('MOBG123456');
    expect(identity.normalizedUrl).toContain('pid=MOBG123456');
  });

  it('extracts Myntra style identifier', () => {
    const rawMyntraUrl = 'https://www.myntra.com/shoes/nike/nike-air-max/231241/buy?utm_source=telegram';
    const identity = extractProductIdentity(rawMyntraUrl);

    expect(identity.retailer).toBe('Myntra');
    expect(identity.productId).toBe('231241');
    expect(identity.normalizedUrl).toBe('https://www.myntra.com/231241');
  });

  it('detects duplicate Telegram imports for existing products without altering published data', async () => {
    // Sony XM5 already exists in our seed catalog as a published product
    const post = {
      message_id: 88881,
      chat: { id: -100123456, title: 'Deals Channel' },
      date: Date.now(),
      text: 'Sony XM5 headphones on sale! https://www.amazon.in/dp/B09XS7JWHH at ₹24,990',
    };

    const imports = await processTelegramPost(post, 7771, false);
    expect(imports.length).toBeGreaterThan(0);

    const duplicateImport = imports[0];
    expect(duplicateImport.extracted_data.is_duplicate).toBe(true);
    expect(duplicateImport.extracted_data.duplicate_of_id).toBe('prod-sony-wh1000xm5');
    expect(duplicateImport.extracted_data.duplicate_of_status).toBe('published');

    // Verify existing published product was NOT overwritten silently
    const originalPublished = await db.getProductById('prod-sony-wh1000xm5');
    expect(originalPublished?.status).toBe('published');
    expect(originalPublished?.current_price).toBe(26990); // Original price preserved!
  });
});

