import { describe, it, expect } from 'vitest';
import { extractUrlsFromMessage, extractPriceHintsFromText, processTelegramPost } from '../src/lib/telegram/service';
import { isSafeExternalUrl } from '../src/lib/utils/ssrf';
import { db } from '../src/lib/db';

describe('Telegram Integration & SSRF Protection', () => {
  it('extracts multiple URLs correctly from a message', () => {
    const message = 'Check out deal 1: https://amzn.to/3xyz789 and deal 2: https://www.flipkart.com/shoes/p/itm123';
    const urls = extractUrlsFromMessage(message);
    expect(urls).toHaveLength(2);
    expect(urls[0]).toBe('https://amzn.to/3xyz789');
    expect(urls[1]).toBe('https://www.flipkart.com/shoes/p/itm123');
  });

  it('extracts price hints from Indian currency text', () => {
    const text1 = 'Massive price cut! Available for ₹1,499 only. 40% off!';
    const hints1 = extractPriceHintsFromText(text1);
    expect(hints1.price).toBe(1499);
    expect(hints1.discount).toBe(40);

    const text2 = 'Deal price Rs 4999 (MRP Rs 7999)';
    const hints2 = extractPriceHintsFromText(text2);
    expect(hints2.price).toBe(4999);
    expect(hints2.original_price).toBe(7999);
  });

  it('blocks private IPs, localhost and AWS metadata to prevent SSRF', () => {
    expect(isSafeExternalUrl('http://localhost:3000').isSafe).toBe(false);
    expect(isSafeExternalUrl('http://127.0.0.1/admin').isSafe).toBe(false);
    expect(isSafeExternalUrl('http://10.0.0.5/secret').isSafe).toBe(false);
    expect(isSafeExternalUrl('http://192.168.1.1/router').isSafe).toBe(false);
    expect(isSafeExternalUrl('http://169.254.169.254/latest/meta-data').isSafe).toBe(false);
    expect(isSafeExternalUrl('ftp://example.com').isSafe).toBe(false);

    // Legitimate public retailer URLs must be allowed
    expect(isSafeExternalUrl('https://www.amazon.in/dp/B09XS7JWHH').isSafe).toBe(true);
    expect(isSafeExternalUrl('https://amzn.to/3xyz789').isSafe).toBe(true);
  });

  it('CRITICAL RULE: Telegram-imported products must be created strictly as DRAFT', async () => {
    const post = {
      message_id: 9999,
      chat: { id: -1001928374, title: 'Deals Channel' },
      date: Date.now(),
      text: 'Super deal! https://www.amazon.in/dp/B0CKZDFQ3W at ₹999',
    };

    const imports = await processTelegramPost(post, 8888, false);
    expect(imports.length).toBeGreaterThan(0);

    const createdImport = imports[0];
    expect(createdImport.review_status).toBe('pending');

    // Retrieve the product created from this import
    const product = await db.getProductById(createdImport.product_id!);
    expect(product).toBeDefined();
    // MANDATORY REQUIREMENT: Must be draft, never published!
    expect(product?.status).toBe('draft');
  });

  it('Product is published ONLY after admin explicitly calls approveAndPublish', async () => {
    const post = {
      message_id: 10001,
      chat: { id: -1001928374, title: 'Deals Channel' },
      date: Date.now(),
      text: 'Earbuds at ₹1,999 https://www.flipkart.com/earbuds/p/itm123',
    };

    const imports = await processTelegramPost(post, 99999, false);
    const importItem = imports[0];

    // Verify it is draft initially
    let product = await db.getProductById(importItem.product_id!);
    expect(product?.status).toBe('draft');

    // Admin clicks Approve & Publish
    const result = await db.approveAndPublishTelegramImport(importItem.id, {
      title: 'Approved Realme Earbuds',
    });

    expect(result.success).toBe(true);
    expect(result.product?.status).toBe('published');

    // Check updated import review status
    const updatedImport = await db.getTelegramImportById(importItem.id);
    expect(updatedImport?.review_status).toBe('approved');
  });
});

