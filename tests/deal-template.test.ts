import { describe, it, expect } from 'vitest';
import { parseDealTemplate } from '../src/lib/telegram/deal-template';
import { guessCategorySlugFromTitle } from '../src/lib/telegram/category-guesser';
import { processTelegramPost } from '../src/lib/telegram/service';
import { detectRetailer } from '../src/lib/telegram/metadata-extractor';
import { lowestPriceState } from '../src/lib/utils/formatters';
import { parseRow, suggestMapping } from '../src/lib/bulk-import';
import { db } from '../src/lib/db';

const SAMPLE = `🔥 LOOT DEAL ALERT! 🔥

🛍️ Amazon Brand - Tavasya Women Floral Printed Short Kurti

💰 Price: ₹419
🎯 Best Price: ₹419

🛒 Grab it now: https://link.amazon/B08jYVqod

⚡ Hurry, deals can end anytime!`;

describe('Channel deal template', () => {
  it('parses name, price, best price and link from the exact channel post', () => {
    expect(parseDealTemplate(SAMPLE)).toEqual({
      title: 'Amazon Brand - Tavasya Women Floral Printed Short Kurti',
      price: 419,
      best_price: 419,
      url: 'https://link.amazon/B08jYVqod',
    });
  });

  it('keeps price and best price apart when they differ (with commas)', () => {
    const msg = SAMPLE.replace('Price: ₹419\n', 'Price: ₹1,299\n').replace('Best Price: ₹419', 'Best Price: ₹1,099');
    const deal = parseDealTemplate(msg)!;
    expect(deal.price).toBe(1299);
    expect(deal.best_price).toBe(1099);
  });

  it('returns null for posts that are not in the template', () => {
    expect(parseDealTemplate('Super deal! https://www.amazon.in/dp/B0CKZDFQ3W at ₹999')).toBeNull();
    expect(parseDealTemplate('')).toBeNull();
  });

  it('works without the variation selector on the bag emoji and without Best Price', () => {
    const deal = parseDealTemplate('🛍 Puma Shoes\n💰 Price: Rs. 1499\n🛒 Grab it now: https://fkrt.co/abc');
    expect(deal).toEqual({ title: 'Puma Shoes', price: 1499, url: 'https://fkrt.co/abc' });
  });

  it('detects the retailer from affiliate short links', () => {
    expect(detectRetailer('https://link.amazon/B08jYVqod')).toBe('Amazon India');
    expect(detectRetailer('https://amzn.in/d/abc')).toBe('Amazon India');
    expect(detectRetailer('https://fkrt.co/abc')).toBe('Flipkart');
    expect(detectRetailer('https://myntr.it/abc')).toBe('Myntra');
    expect(detectRetailer('https://ajiio.in/abc')).toBe('Ajio');
    expect(detectRetailer('https://www.ajio.com/p/123')).toBe('Ajio');
  });

  it('creates a DRAFT with the template values even when the product page cannot be read', async () => {
    const imports = await processTelegramPost(
      { message_id: 5150, chat: { id: -1009, title: 'Loot Deals' }, date: Math.floor(Date.now() / 1000), text: SAMPLE },
      515000
    );
    expect(imports).toHaveLength(1);
    const imp = imports[0];
    expect(imp.extraction_status).not.toBe('failed');
    expect(imp.original_url).toBe('https://link.amazon/B08jYVqod');
    expect(imp.extracted_data.title).toBe('Amazon Brand - Tavasya Women Floral Printed Short Kurti');
    expect(imp.extracted_data.price).toBe(419);
    expect(imp.extracted_data.best_price).toBe(419);
    expect(imp.extracted_data.retailer).toBe('Amazon India');
    // Best price is not the MRP: no strikethrough / discount invented from it.
    expect(imp.extracted_data.original_price).toBeUndefined();
    expect(imp.extracted_data.discount).toBe(0);
    // The emoji promo text is not used as the product description.
    expect(imp.extracted_data.description).toBe('');

    const product = await db.getProductById(imp.product_id!);
    expect(product?.status).toBe('draft');
    expect(product?.title).toBe('Amazon Brand - Tavasya Women Floral Printed Short Kurti');
    expect(product?.current_price).toBe(419);
    expect(product?.best_price).toBe(419);
    expect(product?.affiliate_url).toBe('https://link.amazon/B08jYVqod');
  });
});

describe('Lowest-price badge', () => {
  it('shows the badge only when today’s price is at or below the best price', () => {
    expect(lowestPriceState(419, 419)).toBe('lowest');
    expect(lowestPriceState(399, 419)).toBe('lowest');
    expect(lowestPriceState(499, 419)).toBe('above');
    expect(lowestPriceState(499, null)).toBeNull();
    expect(lowestPriceState(0, 419)).toBeNull();
  });
});

describe('Google Sheet bulk upload columns', () => {
  const headers = ['name', 'link', 'price', 'best price', 'pinterest status', 'board name', 'pin description'];

  it('maps the sheet columns automatically and ignores the Pinterest ones', () => {
    const m = suggestMapping(headers);
    expect(m.title).toBe('name');
    expect(m.affiliate_url).toBe('link');
    expect(m.current_price).toBe('price');
    expect(m.best_price).toBe('best price');
    expect(m.description).toBe('pin description');
    expect(Object.values(m)).not.toContain('pinterest status');
    expect(Object.values(m)).not.toContain('board name');
  });

  it('reads best price from a sheet row', () => {
    const raw = {
      name: 'Tavasya Kurti',
      link: 'https://link.amazon/B08jYVqod',
      price: '₹419',
      'best price': '₹399',
      'pinterest status': 'posted',
      'board name': 'Kurtis',
      'pin description': 'Floral printed short kurti',
    };
    const res = parseRow(raw, suggestMapping(headers), []);
    expect(res.ok).toBe(true);
    if (!res.ok) return;
    expect(res.row.current_price).toBe(419);
    expect(res.row.best_price).toBe(399);
    expect(res.row.original_price).toBeNull();
    expect(res.row.description).toBe('Floral printed short kurti');
  });
});

describe('Title-based category guessing', () => {
  it('detects womens-fashion, mens-fashion, fashion fallback, and home-decor', () => {
    expect(guessCategorySlugFromTitle('Amazon Brand - Tavasya Women Floral Printed Short Kurti')).toBe('womens-fashion');
    expect(guessCategorySlugFromTitle("Allen Solly Men's Regular Fit Polo T-Shirt")).toBe('mens-fashion');
    expect(guessCategorySlugFromTitle('Oversized Cotton Hoodie Sweatshirt')).toBe('fashion');
    expect(guessCategorySlugFromTitle('Macrame Wall Hanging Home Decor')).toBe('home-decor');
    expect(guessCategorySlugFromTitle('Random Unclassified Gizmo XYZ')).toBeUndefined();
  });
});
