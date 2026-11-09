import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { randomUUID } from 'crypto';
import { NextRequest } from 'next/server';
import { createFakeSupabase, FakeSupabase } from './helpers/fakeSupabase';

const state = vi.hoisted(() => ({ fake: null as unknown as { client: unknown } }));

vi.mock('@/lib/supabase/admin', () => ({
  createAdminClient: vi.fn(() => state.fake.client),
}));

// The webhook test must not hit the network; processing itself is covered in telegram.test.ts.
vi.mock('@/lib/telegram/service', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/telegram/service')>();
  return { ...actual, processTelegramPost: vi.fn(async () => []) };
});

import { db, initialSettings, aggregateClicks, trafficSourceOf } from '@/lib/db';
import { createAdminClient } from '@/lib/supabase/admin';
import { processTelegramPost } from '@/lib/telegram/service';
import { POST as webhookPOST } from '@/app/api/telegram/webhook/route';

const ENV_KEYS = ['NEXT_PUBLIC_SUPABASE_URL', 'SUPABASE_SERVICE_ROLE_KEY', 'NEXT_PUBLIC_SUPABASE_ANON_KEY', 'TELEGRAM_WEBHOOK_SECRET'] as const;
const savedEnv: Record<string, string | undefined> = {};

function enableSupabase() {
  process.env.NEXT_PUBLIC_SUPABASE_URL = 'https://abcdefgh.supabase.co';
  process.env.SUPABASE_SERVICE_ROLE_KEY = 'service-role-test-key';
}

const catElectronics = { id: randomUUID(), name: 'Electronics', slug: 'electronics', is_active: true, sort_order: 6 };

function productRow(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    title: 'Boat Airdopes 141',
    slug: `boat-airdopes-${Math.random().toString(36).slice(2, 7)}`,
    retailer: 'Amazon India',
    current_price: 1099,
    original_price: 4490,
    currency: 'INR',
    discount: 76,
    rating: null,
    review_count: null,
    image_url: 'https://m.media-amazon.com/images/I/boat.jpg',
    affiliate_url: 'https://amzn.to/abc123',
    featured: false,
    trending: false,
    status: 'draft',
    source_type: 'telegram',
    category_id: catElectronics.id,
    created_at: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

function importRow(overrides: Record<string, unknown> = {}) {
  return {
    id: randomUUID(),
    telegram_update_id: null,
    product_id: null,
    original_url: 'https://amzn.to/abc123',
    affiliate_url: 'https://www.amazon.in/dp/B0ABC?tag=sx-21',
    extracted_data: { title: 'Boat Airdopes 141', price: 1099, retailer: 'Amazon India', image_url: 'https://m.media-amazon.com/images/I/boat.jpg', category: 'electronics' },
    extraction_status: 'success',
    error_message: null,
    review_status: 'pending',
    created_at: '2026-11-01T10:00:00.000Z',
    ...overrides,
  };
}

let fake: FakeSupabase;

beforeEach(() => {
  for (const k of ENV_KEYS) savedEnv[k] = process.env[k];
  for (const k of ENV_KEYS) delete process.env[k];
  fake = createFakeSupabase({ categories: [catElectronics] });
  state.fake = fake;
  vi.mocked(createAdminClient).mockClear();
  vi.mocked(processTelegramPost).mockClear();
});

afterEach(() => {
  for (const k of ENV_KEYS) {
    if (savedEnv[k] === undefined) delete process.env[k];
    else process.env[k] = savedEnv[k];
  }
});

describe('Supabase mode: products', () => {
  beforeEach(enableSupabase);

  it('getProductById reads the product (with category) from Supabase', async () => {
    const row = productRow();
    fake.tables.products = [row];
    const product = await db.getProductById(row.id);
    expect(product?.title).toBe('Boat Airdopes 141');
    expect(product?.category?.slug).toBe('electronics');
  });

  it('getProductById returns null for unknown or non-UUID ids, never demo data', async () => {
    expect(await db.getProductById(randomUUID())).toBeNull();
    expect(await db.getProductById('prod-boat-airdopes')).toBeNull();
  });

  it('createProduct lets Postgres assign the UUID and drops non-column fields', async () => {
    const product = await db.createProduct({ title: 'Test', slug: 'test', retailer: 'Flipkart', current_price: 10, image_url: 'x', affiliate_url: 'y', category_id: 'cat-electronics', images: [] });
    expect(product.id).toMatch(/^[0-9a-f-]{36}$/);
    const stored = fake.tables.products[0];
    expect(stored).not.toHaveProperty('images');
    expect(stored.category_id).toBeNull(); // demo category ids are not valid foreign keys
    expect(stored.status).toBe('draft');
  });
});

describe('Supabase mode: Telegram imports', () => {
  beforeEach(enableSupabase);

  it('createTelegramImport persists as pending even if another status is requested', async () => {
    const created = await db.createTelegramImport({
      original_url: 'https://amzn.to/x',
      affiliate_url: 'https://www.amazon.in/dp/X',
      extracted_data: { title: 'X' },
      extraction_status: 'success',
      review_status: 'approved',
    });
    expect(created.review_status).toBe('pending');
    expect(fake.tables.telegram_imports).toHaveLength(1);
    expect(fake.tables.telegram_imports[0].review_status).toBe('pending');
  });

  it('createTelegramImport links the telegram_updates row via its numeric update_id', async () => {
    const updateRowId = randomUUID();
    fake.tables.telegram_updates = [{ id: updateRowId, update_id: 4242, channel_id: '-100', message_id: 1 }];
    const linked = await db.createTelegramImport({ telegram_update_id: 'upd-4242', original_url: 'a', affiliate_url: 'a' });
    const unknown = await db.createTelegramImport({ telegram_update_id: 'upd-999', original_url: 'b', affiliate_url: 'b' });
    expect(linked.telegram_update_id).toBe(updateRowId);
    expect(unknown.telegram_update_id).toBeNull();
  });

  it('createTelegramImport throws when the database rejects the insert', async () => {
    fake.failTables.add('telegram_imports');
    await expect(db.createTelegramImport({ original_url: 'a', affiliate_url: 'a' })).rejects.toThrow(/Failed to save Telegram import/);
  });

  it('getTelegramImports filters, sorts newest first and embeds the product', async () => {
    const draft = productRow();
    fake.tables.products = [draft];
    fake.tables.telegram_imports = [
      importRow({ product_id: draft.id, created_at: '2026-11-01T00:00:00.000Z' }),
      importRow({ created_at: '2026-11-03T00:00:00.000Z' }),
      importRow({ review_status: 'rejected', created_at: '2026-11-02T00:00:00.000Z' }),
    ];
    const pending = await db.getTelegramImports({ review_status: 'pending' });
    expect(pending.map(i => i.created_at)).toEqual(['2026-11-03T00:00:00.000Z', '2026-11-01T00:00:00.000Z']);
    expect(pending[1].product?.id).toBe(draft.id);
    expect(pending[0].product).toBeUndefined();
    expect(await db.getTelegramImports()).toHaveLength(3);
  });

  it('getTelegramImportById returns the stored import or null', async () => {
    const row = importRow();
    fake.tables.telegram_imports = [row];
    expect((await db.getTelegramImportById(row.id))?.original_url).toBe(row.original_url);
    expect(await db.getTelegramImportById(randomUUID())).toBeNull();
    expect(await db.getTelegramImportById('tg-imp-1')).toBeNull();
  });

  it('approve publishes the linked draft with admin edits and marks the import approved', async () => {
    const draft = productRow();
    const imp = importRow({ product_id: draft.id });
    fake.tables.products = [draft];
    fake.tables.telegram_imports = [imp];

    const result = await db.approveAndPublishTelegramImport(imp.id, { title: 'Boat Airdopes 141 (Black)', id: 'hacked' } as never);

    expect(result.success).toBe(true);
    expect(result.product?.status).toBe('published');
    expect(fake.tables.products[0]).toMatchObject({ id: draft.id, status: 'published', title: 'Boat Airdopes 141 (Black)' });
    expect(fake.tables.telegram_imports[0].review_status).toBe('approved');
  });

  it('approve without a draft creates the product from real extracted data and matches the category', async () => {
    const imp = importRow();
    fake.tables.telegram_imports = [imp];

    const result = await db.approveAndPublishTelegramImport(imp.id);

    expect(result.success).toBe(true);
    const created = fake.tables.products[0];
    expect(created).toMatchObject({
      status: 'published',
      source_type: 'telegram',
      current_price: 1099,
      affiliate_url: imp.original_url,
      category_id: catElectronics.id,
      rating: null,
      review_count: null,
    });
    expect(fake.tables.telegram_imports[0]).toMatchObject({ review_status: 'approved', product_id: created.id });
  });

  it('approve refuses to publish when the price is unknown, leaving the import pending', async () => {
    const imp = importRow({ extraction_status: 'failed', extracted_data: { title: 'Mystery deal', retailer: 'Amazon India', image_url: 'x' } });
    fake.tables.telegram_imports = [imp];

    const result = await db.approveAndPublishTelegramImport(imp.id);

    expect(result.success).toBe(false);
    expect(result.error).toMatch(/price/i);
    expect(fake.tables.products ?? []).toHaveLength(0);
    expect(fake.tables.telegram_imports[0].review_status).toBe('pending');
  });

  it('approve reports unknown imports', async () => {
    expect((await db.approveAndPublishTelegramImport(randomUUID())).success).toBe(false);
    expect((await db.approveAndPublishTelegramImport('tg-imp-1')).success).toBe(false);
  });

  it('reject marks the import rejected and leaves its draft unpublished', async () => {
    const draft = productRow();
    const imp = importRow({ product_id: draft.id });
    fake.tables.products = [draft];
    fake.tables.telegram_imports = [imp];

    expect(await db.rejectTelegramImport(imp.id)).toBe(true);
    expect(fake.tables.telegram_imports[0].review_status).toBe('rejected');
    expect(fake.tables.products[0].status).toBe('draft');
    expect(await db.rejectTelegramImport(randomUUID())).toBe(false);
  });
});

describe('Supabase mode: Telegram webhook idempotency', () => {
  beforeEach(() => {
    enableSupabase();
    process.env.TELEGRAM_WEBHOOK_SECRET = 'webhook-secret';
  });

  const send = (body: unknown) =>
    webhookPOST(new NextRequest('http://localhost/api/telegram/webhook', {
      method: 'POST',
      headers: { 'content-type': 'application/json', 'x-telegram-bot-api-secret-token': 'webhook-secret' },
      body: JSON.stringify(body),
    }));

  const update = {
    update_id: 777001,
    channel_post: { message_id: 55, chat: { id: -100123, title: 'Deals' }, date: 1, text: 'Deal ₹999 https://amzn.to/abc' },
  };

  it('records the update in telegram_updates and processes it exactly once', async () => {
    const first = await (await send(update)).json();
    const second = await (await send(update)).json();

    expect(first.status).toBe('processed_channel_post');
    expect(second.message).toBe('Update already processed');
    expect(processTelegramPost).toHaveBeenCalledTimes(1);
    expect(fake.tables.telegram_updates).toHaveLength(1);
    expect(fake.tables.telegram_updates[0]).toMatchObject({
      update_id: 777001,
      channel_id: '-100123',
      message_id: 55,
      original_urls: ['https://amzn.to/abc'],
      processing_status: 'processed',
    });
  });

  it('survives a "restart": a row already in telegram_updates blocks reprocessing', async () => {
    fake.tables.telegram_updates = [{ id: randomUUID(), update_id: 777001, channel_id: '-100123', message_id: 55, processing_status: 'processed' }];
    const res = await (await send(update)).json();
    expect(res.message).toBe('Update already processed');
    expect(processTelegramPost).not.toHaveBeenCalled();
  });

  it('marks the update failed when processing throws', async () => {
    vi.mocked(processTelegramPost).mockRejectedValueOnce(new Error('boom'));
    const res = await (await send({ ...update, update_id: 777002 })).json();
    expect(res.ok).toBe(false);
    expect(fake.tables.telegram_updates[0].processing_status).toBe('failed');
  });

  it('does not record unsupported update types', async () => {
    const res = await (await send({ update_id: 777003, message: { text: 'hi' } })).json();
    expect(res.status).toBe('ignored_unsupported_update_type');
    expect(fake.tables.telegram_updates ?? []).toHaveLength(0);
  });
});

describe('Supabase mode: analytics', () => {
  beforeEach(enableSupabase);

  it('returns real counts from products, telegram_imports and affiliate_clicks', async () => {
    const p1 = productRow({ title: 'Boat Airdopes', status: 'published' });
    const p2 = productRow({ title: 'Crocs Clogs', status: 'published', retailer: 'Flipkart' });
    const p3 = productRow({ title: 'Draft item', status: 'draft' });
    fake.tables.products = [p1, p2, p3];
    fake.tables.telegram_imports = [importRow(), importRow({ review_status: 'approved' })];
    fake.tables.affiliate_clicks = [
      { id: randomUUID(), product_id: p1.id, retailer: 'Amazon India', referrer: 'https://www.google.com/search?q=x', campaign: 'direct', timestamp: '2026-11-01T08:00:00.000Z' },
      { id: randomUUID(), product_id: p1.id, retailer: 'Amazon India', referrer: null, campaign: 'tg', timestamp: '2026-11-01T22:00:00.000Z' },
      { id: randomUUID(), product_id: p2.id, retailer: 'Flipkart', referrer: 'https://t.me/simplexplore', campaign: 'tg', timestamp: '2026-11-02T09:00:00.000Z' },
    ];

    const a = await db.getAnalytics();

    expect(a).toMatchObject({
      totalProducts: 3,
      publishedProducts: 2,
      pendingDrafts: 1,
      totalTelegramImports: 2,
      pendingReviewImports: 1,
      totalClicks: 3,
      clicksByRetailer: { 'Amazon India': 2, Flipkart: 1 },
      trafficSources: { 'google.com': 1, direct: 1, 't.me': 1 },
      clicksByCampaign: { direct: 1, tg: 2 },
      clicksByDate: [{ date: '2026-11-01', clicks: 2 }, { date: '2026-11-02', clicks: 1 }],
    });
    expect(a.clicksByProduct).toEqual([
      { productId: p1.id, title: 'Boat Airdopes', retailer: 'Amazon India', clicks: 2 },
      { productId: p2.id, title: 'Crocs Clogs', retailer: 'Flipkart', clicks: 1 },
    ]);
  });

  it('pages through more clicks than one PostgREST page', async () => {
    const p = productRow({ status: 'published' });
    fake.tables.products = [p];
    fake.tables.affiliate_clicks = Array.from({ length: 2345 }, (_, i) => ({
      id: randomUUID(), product_id: p.id, retailer: 'Amazon India', referrer: null, campaign: null,
      timestamp: new Date(Date.UTC(2026, 10, 1, 0, 0, i)).toISOString(),
    }));
    const a = await db.getAnalytics();
    expect(a.totalClicks).toBe(2345);
    expect(a.clicksByProduct[0].clicks).toBe(2345);
  });

  it('propagates database errors instead of reporting zero traffic', async () => {
    fake.failTables.add('affiliate_clicks');
    await expect(db.getAnalytics()).rejects.toThrow(/affiliate clicks/);
  });

  it('trackAffiliateClick stores the click without a client-generated id', async () => {
    const p = productRow({ status: 'published' });
    fake.tables.products = [p];
    const click = await db.trackAffiliateClick({ productId: p.id, referrer: 'https://google.com', campaign: 'direct' });
    expect(fake.tables.affiliate_clicks).toHaveLength(1);
    expect(fake.tables.affiliate_clicks[0]).toMatchObject({ product_id: p.id, retailer: 'Amazon India', referrer: 'https://google.com' });
    expect(click.id).toBe(fake.tables.affiliate_clicks[0].id);
  });
});

describe('Supabase mode: website settings', () => {
  beforeEach(enableSupabase);

  const settingsRow = () => ({ ...initialSettings, id: randomUUID(), site_name: 'SimpleXplore India', social_links: null, updated_at: '2026-11-01T00:00:00.000Z' });

  it('getSettings reads the website_settings row', async () => {
    fake.tables.website_settings = [settingsRow()];
    const s = await db.getSettings();
    expect(s.site_name).toBe('SimpleXplore India');
    expect(s.social_links).toEqual({}); // NULL JSONB is not replaced with made-up links
  });

  it('getSettings falls back to schema defaults when the table is empty or unreachable', async () => {
    expect((await db.getSettings()).site_name).toBe(initialSettings.site_name);
    fake.failTables.add('website_settings');
    expect((await db.getSettings()).site_name).toBe(initialSettings.site_name);
  });

  it('updateSettings updates the existing row with whitelisted fields only', async () => {
    const row = settingsRow();
    fake.tables.website_settings = [row];
    const saved = await db.updateSettings({ tagline: 'Deals that matter', id: 'evil', bogus: 1 } as never);
    expect(saved.tagline).toBe('Deals that matter');
    expect(fake.tables.website_settings).toHaveLength(1);
    expect(fake.tables.website_settings[0].id).toBe(row.id);
    expect(fake.tables.website_settings[0]).not.toHaveProperty('bogus');
    expect((await db.getSettings()).tagline).toBe('Deals that matter');
  });

  it('updateSettings inserts a row when none exists', async () => {
    const saved = await db.updateSettings({ site_name: 'New Name' });
    expect(saved.site_name).toBe('New Name');
    expect(fake.tables.website_settings).toHaveLength(1);
  });

  it('updateSettings throws when the database rejects the write', async () => {
    fake.failTables.add('website_settings');
    await expect(db.updateSettings({ site_name: 'x' })).rejects.toThrow();
  });
});

describe('Demo mode (Supabase not configured)', () => {
  it('never touches Supabase and keeps the in-memory behaviour', async () => {
    const settings = await db.getSettings();
    expect(settings.site_name).toBe(initialSettings.site_name);

    const seeded = await db.getTelegramImportById('tg-imp-1');
    expect(seeded?.review_status).toBe('pending');
    expect(seeded?.product?.status).toBe('draft');

    const analytics = await db.getAnalytics();
    expect(analytics.pendingReviewImports).toBeGreaterThan(0);
    expect(analytics.clicksByProduct).toEqual(expect.any(Array));

    const claim1 = await db.claimTelegramUpdate({ update_id: 123456789, channel_id: '-1', message_id: 1 });
    const claim2 = await db.claimTelegramUpdate({ update_id: 123456789, channel_id: '-1', message_id: 1 });
    expect(claim1.claimed).toBe(true);
    expect(claim2.claimed).toBe(false);

    expect(createAdminClient).not.toHaveBeenCalled();
  });
});

describe('analytics helpers', () => {
  it('classifies traffic sources from the referrer', () => {
    expect(trafficSourceOf(null)).toBe('direct');
    expect(trafficSourceOf('https://www.instagram.com/p/1')).toBe('instagram.com');
    expect(trafficSourceOf('not a url')).toBe('unknown');
  });

  it('aggregates an empty click list to zeros', () => {
    expect(aggregateClicks([])).toEqual({
      totalClicks: 0, clicksByRetailer: {}, clicksByProduct: [], clicksByDate: [], trafficSources: {}, clicksByCampaign: {},
    });
  });
});
