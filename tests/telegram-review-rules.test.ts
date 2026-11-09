import { describe, it, expect, vi, beforeEach } from 'vitest';

// Offline: control what "the retailer page" returns.
const page = vi.hoisted(() => ({ meta: {} as Record<string, unknown> }));
vi.mock('@/lib/telegram/url-unshortener', () => ({ resolveSafeUrl: vi.fn(async (u: string) => u) }));
vi.mock('@/lib/telegram/metadata-extractor', async importOriginal => {
  const actual = await importOriginal<typeof import('@/lib/telegram/metadata-extractor')>();
  return { ...actual, extractMetadataFromUrl: vi.fn(async () => page.meta) };
});

import { db } from '@/lib/db';
import { processTelegramPost } from '@/lib/telegram/service';
import { processTelegramQueue } from '@/lib/telegram/queue';

const post = (id: number, text: string) => ({ message_id: id, chat: { id: -100555, title: 'Deals' }, date: 1, text });

beforeEach(() => {
  page.meta = {};
});

describe('Nothing invented during extraction', () => {
  it('leaves image and category blank and flags them instead of using a stock photo', async () => {
    page.meta = { title: 'Noise ColorFit Pro 5', price: 3499 }; // no image, no category on the page
    const [imp] = await processTelegramPost(post(1, 'Watch deal https://www.amazon.in/dp/B0NOIMG001'), 910001);

    expect(imp.extracted_data.image_url).toBeUndefined();
    expect(imp.extracted_data.category).toBeUndefined();
    expect(imp.extracted_data.highlights).toEqual([]);
    expect(imp.extracted_data.missing_fields).toEqual(expect.arrayContaining(['image', 'category']));
    expect(imp.extracted_data.missing_fields).not.toContain('price');

    const draft = await db.getProductById(imp.product_id!);
    expect(draft?.image_url).toBe('');
    expect(draft?.status).toBe('draft');
  });

  it('refuses to publish until the admin supplies the missing image', async () => {
    page.meta = { title: 'Mi Power Bank 20000mAh', price: 1799 };
    const [imp] = await processTelegramPost(post(2, 'https://www.amazon.in/dp/B0NOIMG002'), 910002);

    const blocked = await db.approveAndPublishTelegramImport(imp.id);
    expect(blocked).toMatchObject({ success: false, error: expect.stringMatching(/image/i) });

    const ok = await db.approveAndPublishTelegramImport(imp.id, { image_url: 'https://m.media-amazon.com/images/I/pb.jpg' });
    expect(ok.success).toBe(true);
    expect(ok.product?.status).toBe('published');
  });

  it('flags a missing price rather than publishing at ₹0', async () => {
    page.meta = { title: 'Mystery gadget', image_url: 'https://example.com/g.jpg' };
    const [imp] = await processTelegramPost(post(3, 'No price here https://www.amazon.in/dp/B0NOPRICE3'), 910003);
    expect(imp.extracted_data.missing_fields).toContain('price');
    const res = await db.approveAndPublishTelegramImport(imp.id);
    expect(res).toMatchObject({ success: false, error: expect.stringMatching(/price/i) });
  });
});

describe('Edited Telegram posts for products that are already live', () => {
  it('does not touch the live product; creates a pending update for review instead', async () => {
    const live = await db.createProduct({
      title: 'boAt Airdopes 141',
      slug: 'boat-airdopes-141-live-test',
      retailer: 'Amazon India',
      current_price: 1099,
      image_url: 'https://m.media-amazon.com/images/I/live.jpg',
      affiliate_url: 'https://www.amazon.in/dp/B0LIVE0141',
      featured: true,
      status: 'published',
    });

    page.meta = { title: 'boAt Airdopes 141 (new colour)', price: 999 };
    const [imp] = await processTelegramPost(post(4, 'Price drop! https://www.amazon.in/dp/B0LIVE0141'), 910004, true);

    // Public product unchanged.
    const after = await db.getProductById(live.id);
    expect(after).toMatchObject({ title: 'boAt Airdopes 141', current_price: 1099, status: 'published', featured: true });

    // A reviewable update linked to it.
    expect(imp.product_id).toBe(live.id);
    expect(imp.review_status).toBe('pending');
    expect(imp.extracted_data.pending_update).toBe(true);
    expect(imp.extracted_data.price).toBe(999);

    // Rejecting keeps the live product as it was.
    await db.rejectTelegramImport(imp.id);
    expect((await db.getProductById(live.id))?.current_price).toBe(1099);
  });

  it('applies the update only when the admin approves it', async () => {
    const live = await db.createProduct({
      title: 'Crocs Classic Clog',
      slug: 'crocs-classic-live-test',
      retailer: 'Amazon India',
      current_price: 2999,
      image_url: 'https://m.media-amazon.com/images/I/crocs.jpg',
      affiliate_url: 'https://www.amazon.in/dp/B0LIVECROC',
      status: 'published',
    });
    page.meta = { title: 'Crocs Classic Clog', price: 2499 };
    const [imp] = await processTelegramPost(post(5, 'https://www.amazon.in/dp/B0LIVECROC'), 910005, true);

    const res = await db.approveAndPublishTelegramImport(imp.id, { current_price: 2499 });
    expect(res.success).toBe(true);
    expect((await db.getProductById(live.id))?.current_price).toBe(2499);
  });
});

describe('Background queue (demo mode)', () => {
  it('processes a queued post once, after the webhook has replied', async () => {
    page.meta = { title: 'Queued product', price: 499, image_url: 'https://example.com/q.jpg' };
    const before = (await db.getTelegramImports()).length;

    const claim = await db.claimTelegramUpdate({
      update_id: 920001,
      channel_id: '-100555',
      message_id: 6,
      payload: post(6, 'https://www.amazon.in/dp/B0QUEUED01'),
      is_edited: false,
    });
    expect(claim.claimed).toBe(true);
    expect((await db.getTelegramImports()).length).toBe(before); // nothing extracted yet

    const run = await processTelegramQueue();
    expect(run).toMatchObject({ processed: 1, failed: 0 });
    expect((await db.getTelegramImports()).length).toBe(before + 1);

    await processTelegramQueue();
    expect((await db.getTelegramImports()).length).toBe(before + 1); // not processed twice
    expect((await db.claimTelegramUpdate({ update_id: 920001, channel_id: '-100555', message_id: 6 })).claimed).toBe(false);
  });
});
