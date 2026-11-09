import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { randomUUID } from 'crypto';
import { createFakeSupabase, FakeSupabase } from './helpers/fakeSupabase';

const state = vi.hoisted(() => ({ fake: null as unknown as { client: unknown } }));
vi.mock('@/lib/supabase/admin', () => ({ createAdminClient: vi.fn(() => state.fake.client) }));

import { db } from '@/lib/db';
import { createRateLimiter } from '@/lib/rate-limit';
import { suggestMapping, mappingErrors, parseRow, failedRowsCsv } from '@/lib/bulk-import';
import type { Category } from '@/types';

let fake: FakeSupabase;
const saved: Record<string, string | undefined> = {};
const ENV = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY'] as const;

beforeEach(() => {
  fake = createFakeSupabase();
  state.fake = fake;
  for (const k of ENV) saved[k] = process.env[k];
  delete process.env.NEXT_PUBLIC_SUPABASE_URL; // demo mode unless a test enables Supabase
});
afterEach(() => {
  for (const k of ENV) {
    if (saved[k] === undefined) delete process.env[k];
    else process.env[k] = saved[k];
  }
});
function enableSupabase() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
}

describe('Extra product photos', () => {
  it('saves the gallery in Supabase and loads it with the product', async () => {
    enableSupabase();
    const product = await db.createProduct({
      title: 'Gallery test',
      retailer: 'Amazon India',
      current_price: 999,
      image_url: 'https://example.com/main.jpg',
      affiliate_url: 'https://www.amazon.in/dp/B0GALLERY1',
      images: [
        { id: '', product_id: '', image_url: 'https://example.com/main.jpg', sort_order: 0 },
        { id: '', product_id: '', image_url: 'https://example.com/side.jpg', sort_order: 1 },
      ],
    });
    expect(fake.tables.product_images).toHaveLength(2);
    expect(product.images?.map(i => i.image_url)).toEqual(['https://example.com/main.jpg', 'https://example.com/side.jpg']);

    // Editing replaces the gallery (no stale rows left behind).
    await db.updateProduct(product.id, { images: [{ id: '', product_id: '', image_url: 'https://example.com/back.jpg', sort_order: 0 }] });
    expect(fake.tables.product_images.map(r => r.image_url)).toEqual(['https://example.com/back.jpg']);
    expect((await db.getProductById(product.id))?.images).toHaveLength(1);
  });
});

describe('Duplicate product', () => {
  it('creates a draft copy that is not featured, with its own slug', async () => {
    const original = await db.createProduct({
      title: 'Original item', slug: 'original-item-dup-test', retailer: 'Flipkart', current_price: 500,
      image_url: 'https://example.com/o.jpg', affiliate_url: 'https://www.flipkart.com/x/p/itmdup',
      featured: true, trending: true, status: 'published',
    });
    const copy = await db.duplicateProduct(original.id);
    expect(copy).toMatchObject({ title: 'Original item (copy)', status: 'draft', featured: false, trending: false, current_price: 500 });
    expect(copy!.id).not.toBe(original.id);
    expect(copy!.slug).not.toBe(original.slug);
    expect((await db.getProductById(original.id))?.status).toBe('published');
  });
});

describe('Audit log', () => {
  it('records entries newest first and filters by type', async () => {
    await db.recordAudit({ admin_email: 'admin@example.com', action: 'category.create', entity_type: 'category', entity_id: 'c1', details: { name: 'Toys' } });
    await db.recordAudit({ admin_email: 'admin@example.com', action: 'product.delete', entity_type: 'product', entity_id: 'p1', details: {} });
    const all = await db.getAuditLogs({ limit: 10 });
    expect(all.entries[0].action).toBe('product.delete');
    const cats = await db.getAuditLogs({ entityType: 'category' });
    expect(cats.entries.every(e => e.entity_type === 'category')).toBe(true);
  });

  it('writes to admin_audit_logs in Supabase, keeping non-UUID ids in details', async () => {
    enableSupabase();
    const uuid = randomUUID();
    await db.recordAudit({ admin_email: 'admin@example.com', action: 'product.update', entity_type: 'product', entity_id: uuid, details: { fields: ['title'] } });
    await db.recordAudit({ admin_email: 'admin@example.com', action: 'settings.update', entity_type: 'settings', entity_id: 'settings-default', details: {} });
    expect(fake.tables.admin_audit_logs[0]).toMatchObject({ entity_id: uuid, admin_email: 'admin@example.com' });
    expect(fake.tables.admin_audit_logs[1]).toMatchObject({ entity_id: null, details: { ref: 'settings-default' } });
  });
});

describe('Customers', () => {
  it('lists demo shoppers (never the admin) with wishlist counts', async () => {
    process.env.ADMIN_EMAIL = 'admin@example.com';
    await db.recordDemoCustomer('Shopper.One@example.com', 'Shopper One');
    await db.recordDemoCustomer('admin@example.com');
    const { products } = await db.getProducts({ status: 'published', limit: 1 });
    await db.addToWishlist('demo:shopper.one@example.com', products[0].id);

    const { customers } = await db.getCustomers({ search: 'shopper' });
    expect(customers).toHaveLength(1);
    expect(customers[0]).toMatchObject({ email: 'shopper.one@example.com', full_name: 'Shopper One', wishlist_count: 1 });
    expect((await db.getCustomers()).customers.some(c => c.email === 'admin@example.com')).toBe(false);
  });

  it('reads customers from profiles in Supabase (admins excluded)', async () => {
    enableSupabase();
    const uid = randomUUID();
    fake.tables.profiles = [
      { id: uid, email: 'c@example.com', full_name: 'C', role: 'customer', created_at: '2026-11-01T00:00:00Z' },
      { id: randomUUID(), email: 'admin@example.com', role: 'admin', created_at: '2026-10-01T00:00:00Z' },
    ];
    fake.tables.wishlists = [{ id: randomUUID(), user_id: uid, product_id: randomUUID() }];
    const { customers, total } = await db.getCustomers();
    expect(total).toBe(1);
    expect(customers[0]).toMatchObject({ email: 'c@example.com', wishlist_count: 1 });
  });
});

describe('Rate limiter', () => {
  it('allows up to the limit per key and resets after the window', () => {
    const check = createRateLimiter({ limit: 3, windowMs: 1000 });
    const t = 1_000_000;
    expect([check('a', t), check('a', t), check('a', t)].every(r => r.allowed)).toBe(true);
    const blocked = check('a', t + 10);
    expect(blocked.allowed).toBe(false);
    expect(blocked.retryAfterSeconds).toBeGreaterThan(0);
    expect(check('b', t).allowed).toBe(true); // other keys unaffected
    expect(check('a', t + 1001).allowed).toBe(true); // new window
  });
});

describe('Bulk import mapping & validation', () => {
  const cats = [{ id: 'cat-footwear', name: 'Footwear', slug: 'footwear', is_active: true }] as Category[];

  it('guesses columns from common header names', () => {
    const m = suggestMapping(['Name', 'MRP', 'Sale Price', 'Buy Link', 'Store', 'Photo']);
    expect(m).toMatchObject({ title: 'Name', original_price: 'MRP', current_price: 'Sale Price', affiliate_url: 'Buy Link', retailer: 'Store', image_url: 'Photo' });
    expect(mappingErrors(m, ['Name', 'MRP', 'Sale Price', 'Buy Link', 'Store', 'Photo'])).toEqual([]);
    expect(mappingErrors({ title: 'Name' }, ['Name'])).toHaveLength(2); // price + URL missing
  });

  const mapping = { title: 'T', current_price: 'P', affiliate_url: 'U', image_url: 'I', retailer: 'R', category: 'C', rating: 'Rt', review_count: 'Rc', original_price: 'O' };

  it('never invents ratings, reviews or categories', () => {
    const res = parseRow({ T: 'Sneakers', P: '₹1,499', U: 'https://www.amazon.in/dp/B0SNEAK001', I: 'https://x.com/s.jpg', R: 'Amazon India', C: 'Gadgets' }, mapping, cats);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.row).toMatchObject({ current_price: 1499, rating: null, review_count: null, category_id: null });
    expect(res.warnings.join(' ')).toMatch(/Gadgets/);
  });

  it('matches categories by name and computes discount', () => {
    const res = parseRow({ T: 'Crocs', P: 1999, O: 2999, U: 'https://www.flipkart.com/c/p/itm1', I: 'https://x.com/c.jpg', R: 'Flipkart', C: 'footwear', Rt: '4.4', Rc: '1,250' }, mapping, cats);
    expect(res.ok && res.row).toMatchObject({ category_id: 'cat-footwear', discount: 33, rating: 4.4, review_count: 1250 });
  });

  it('rejects bad rows with a clear reason', () => {
    expect(parseRow({ T: '', P: 10, U: 'https://a.com' }, mapping, cats)).toMatchObject({ ok: false, reason: expect.stringMatching(/title/i) });
    expect(parseRow({ T: 'x', P: 'free', U: 'https://a.com' }, mapping, cats)).toMatchObject({ ok: false, reason: expect.stringMatching(/price/i) });
    expect(parseRow({ T: 'x', P: 10, U: 'http://169.254.169.254/latest' }, mapping, cats)).toMatchObject({ ok: false, reason: expect.stringMatching(/public/i) });
    expect(parseRow({ T: 'x', P: 10, U: 'https://a.com', Rt: '9' }, mapping, cats)).toMatchObject({ ok: false, reason: expect.stringMatching(/rating/i) });
  });

  it('builds a failed-rows CSV that is safe to open in Excel', () => {
    const csv = failedRowsCsv(['Title', 'Price'], [{ row: 3, reason: 'Missing price', data: { Title: '=HYPERLINK("evil")', Price: '' } }]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain(`"'=HYPERLINK(""evil"")"`);
    expect(csv).toContain('Missing price');
  });
});
