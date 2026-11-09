import { describe, it, expect } from 'vitest';
import { validateSettingsInput } from '@/lib/settings-validation';
import { normalizeAvailability } from '@/lib/telegram/metadata-extractor';
import { parseRow } from '@/lib/bulk-import';
import { productJsonLd, organizationJsonLd } from '@/lib/seo';
import { db } from '@/lib/db';
import type { Product } from '@/types';

describe('Website settings validation', () => {
  it('accepts a full valid update and normalises values', () => {
    const { update, errors } = validateSettingsInput({
      site_name: '  ShopNest ',
      tagline: 'Find it fast',
      logo_url: '/uploads/branding/2026-11/logo.png',
      primary_color: '#2563eb',
      default_currency: 'usd',
      contact_email: 'hello@shopnest.in',
      affiliate_disclosure: 'We may earn a commission.',
      social_links: { telegram: 'https://t.me/shopnest', instagram: '' },
      homepage_config: { show_hero: true, show_deals: false },
      evil_field: 'ignored',
    });
    expect(errors).toEqual([]);
    expect(update).toMatchObject({
      site_name: 'ShopNest',
      primary_color: '#2563EB',
      default_currency: 'USD',
      social_links: { telegram: 'https://t.me/shopnest' },
      homepage_config: { show_hero: true, show_categories: true, show_trending: true, show_deals: false },
    });
    expect(update).not.toHaveProperty('evil_field');
  });

  it('rejects bad values with readable messages', () => {
    const { update, errors } = validateSettingsInput({
      site_name: '',
      primary_color: 'green',
      contact_email: 'not-an-email',
      logo_url: 'javascript:alert(1)',
      social_links: { twitter: 'http://insecure.example' },
    });
    expect(update).toBeUndefined();
    expect(errors.join(' ')).toMatch(/Brand name/);
    expect(errors.join(' ')).toMatch(/colour/);
    expect(errors.join(' ')).toMatch(/email/i);
    expect(errors.join(' ')).toMatch(/Logo/);
    expect(errors.join(' ')).toMatch(/https/);
  });

  it('saved settings are what the storefront reads', async () => {
    const { update } = validateSettingsInput({ site_name: 'ShopNest', tagline: 'Find it fast', logo_url: '' });
    await db.updateSettings(update!);
    const s = await db.getSettings();
    expect(s).toMatchObject({ site_name: 'ShopNest', tagline: 'Find it fast', logo_url: null });
    expect(organizationJsonLd({ name: s.site_name, tagline: s.tagline })).toMatchObject({ name: 'ShopNest', slogan: 'Find it fast' });
  });
});

describe('Product availability', () => {
  it('maps retailer values and never guesses unknown ones', () => {
    expect(normalizeAvailability('https://schema.org/InStock')).toBe('in_stock');
    expect(normalizeAvailability('http://schema.org/OutOfStock')).toBe('out_of_stock');
    expect(normalizeAvailability('instock')).toBe('in_stock');
    expect(normalizeAvailability('out of stock')).toBe('out_of_stock');
    expect(normalizeAvailability('LimitedAvailability')).toBe('limited');
    expect(normalizeAvailability('PreOrder')).toBeUndefined();
    expect(normalizeAvailability(undefined)).toBeUndefined();
  });

  it('adds availability to structured data only when known', () => {
    const base = {
      id: 'p', title: 'T', slug: 't', retailer: 'Amazon India', current_price: 10, currency: 'INR',
      image_url: 'https://x/y.jpg', affiliate_url: 'https://a', featured: false, trending: false,
      status: 'published', source_type: 'manual', created_at: '2026-11-01',
    } as Product;
    expect((productJsonLd(base).offers as Record<string, unknown>).availability).toBeUndefined();
    expect((productJsonLd({ ...base, availability: 'out_of_stock' }).offers as Record<string, unknown>).availability).toBe(
      'https://schema.org/OutOfStock'
    );
  });

  it('reads an optional availability column in bulk uploads', () => {
    const mapping = { title: 'T', current_price: 'P', affiliate_url: 'U', availability: 'S' };
    const row = (S: string) => parseRow({ T: 'x', P: 10, U: 'https://www.amazon.in/dp/B0AVAIL001', S }, mapping, []);
    expect(row('In Stock')).toMatchObject({ ok: true, row: { availability: 'in_stock' } });
    expect(row('sold out')).toMatchObject({ ok: true, row: { availability: 'out_of_stock' } });
    expect(row('')).toMatchObject({ ok: true, row: { availability: null } });
    expect(row('maybe')).toMatchObject({ ok: true, row: { availability: null } });
  });
});
