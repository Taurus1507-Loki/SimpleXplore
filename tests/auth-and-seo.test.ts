import { describe, it, expect, beforeAll } from 'vitest';
import { createAdminSessionToken, verifyAdminSessionToken, safeEqual } from '../src/lib/admin-session';
import { serializeJsonLd, productJsonLd } from '../src/lib/seo';
import { db } from '../src/lib/db';
import type { Product } from '../src/types';

beforeAll(() => {
  process.env.ADMIN_SESSION_SECRET = 'test-secret-that-is-definitely-longer-than-32-chars';
});

describe('Admin session tokens', () => {
  it('round-trips a valid signed token', async () => {
    const token = await createAdminSessionToken('Admin@Example.com');
    expect(await verifyAdminSessionToken(token)).toEqual({ email: 'admin@example.com' });
  });

  it('rejects a forged or tampered token', async () => {
    const token = await createAdminSessionToken('admin@example.com');
    const [body, sig] = token.split('.');
    const forgedBody = Buffer.from(JSON.stringify({ sub: 'attacker@evil.com', exp: 9999999999 }))
      .toString('base64url');
    expect(await verifyAdminSessionToken(`${forgedBody}.${sig}`)).toBeNull();
    expect(await verifyAdminSessionToken(`${body}.${sig.slice(0, -2)}xx`)).toBeNull();
    expect(await verifyAdminSessionToken('true')).toBeNull(); // the old sx_admin_demo value
    expect(await verifyAdminSessionToken(undefined)).toBeNull();
  });

  it('rejects an expired token', async () => {
    const token = await createAdminSessionToken('admin@example.com', Date.now() - 9 * 60 * 60 * 1000);
    expect(await verifyAdminSessionToken(token)).toBeNull();
  });

  it('rejects all tokens when no secret is configured', async () => {
    const token = await createAdminSessionToken('admin@example.com');
    const saved = process.env.ADMIN_SESSION_SECRET;
    process.env.ADMIN_SESSION_SECRET = '';
    try {
      expect(await verifyAdminSessionToken(token)).toBeNull();
    } finally {
      process.env.ADMIN_SESSION_SECRET = saved;
    }
  });

  it('compares secrets in constant time semantics', () => {
    expect(safeEqual('abc', 'abc')).toBe(true);
    expect(safeEqual('abc', 'abd')).toBe(false);
    expect(safeEqual('abc', 'abcd')).toBe(false);
  });
});

describe('Public visibility of drafts', () => {
  it('never returns draft products from the public slug lookup', async () => {
    const { products } = await db.getProducts({ status: 'draft' });
    expect(products.length).toBeGreaterThan(0);
    for (const draft of products) {
      expect(await db.getPublishedProductBySlug(draft.slug)).toBeNull();
    }
  });

  it('does not invent ratings or review counts for Telegram drafts', async () => {
    const { products } = await db.getProducts({ status: 'draft' });
    const telegramDrafts = products.filter((p) => p.source_type === 'telegram');
    for (const p of telegramDrafts) {
      expect(p.rating === 4.2 && p.review_count === 100).toBe(false);
    }
  });
});

describe('Structured data', () => {
  it('escapes markup in untrusted product text', () => {
    const out = serializeJsonLd({ name: '</script><script>alert(1)</script>' });
    expect(out).not.toContain('</script>');
    expect(out).toContain('\\u003c/script\\u003e');
  });

  it('omits aggregateRating unless both rating and review count are known', () => {
    const base = {
      id: 'p1', title: 'Test', slug: 'test', retailer: 'Amazon India', current_price: 999, currency: 'INR',
      image_url: 'https://example.com/a.jpg', affiliate_url: 'https://example.com', featured: false,
      trending: false, status: 'published', source_type: 'manual', created_at: new Date().toISOString(),
    } as Product;
    expect(productJsonLd({ ...base, rating: 4.5, review_count: null })).not.toHaveProperty('aggregateRating');
    expect(productJsonLd({ ...base, rating: 4.5, review_count: 20 })).toHaveProperty('aggregateRating');
    expect(productJsonLd({ ...base, current_price: 0 })).not.toHaveProperty('offers');
  });
});
