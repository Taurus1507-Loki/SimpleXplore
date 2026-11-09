import { describe, it, expect } from 'vitest';
import { db } from '../src/lib/db';
import { isSafeExternalUrl } from '../src/lib/utils/ssrf';

describe('Affiliate Redirect Gateway and Click Tracking', () => {
  it('tracks affiliate clicks with correct session and retailer context', async () => {
    const product = (await db.getProducts({ status: 'published', limit: 1 })).products[0];
    expect(product).toBeDefined();

    const click = await db.trackAffiliateClick({
      productId: product.id,
      referrer: 'https://google.com',
      campaign: 'telegram_flash_deal',
      sessionId: 'sess_test_123',
      userAgent: 'Mozilla/5.0 TestBrowser',
    });

    expect(click.product_id).toBe(product.id);
    expect(click.retailer).toBe(product.retailer);
    expect(click.campaign).toBe('telegram_flash_deal');
    expect(click.session_id).toBe('sess_test_123');
    expect(click.timestamp).toBeTruthy();
  });

  it('guarantees affiliate redirect destinations pass SSRF validation', () => {
    const safeAmazon = 'https://www.amazon.in/dp/B09XS7JWHH?tag=simplexplore-21';
    const safeFlipkart = 'https://www.flipkart.com/crocs-clogs/p/itm123?affid=simplexplore';
    const maliciousDestination = 'http://169.254.169.254/latest/meta-data/iam/security-credentials';
    const localHostDestination = 'http://localhost:8080/admin/dump';

    expect(isSafeExternalUrl(safeAmazon).isSafe).toBe(true);
    expect(isSafeExternalUrl(safeFlipkart).isSafe).toBe(true);
    expect(isSafeExternalUrl(maliciousDestination).isSafe).toBe(false);
    expect(isSafeExternalUrl(localHostDestination).isSafe).toBe(false);
  });
});

