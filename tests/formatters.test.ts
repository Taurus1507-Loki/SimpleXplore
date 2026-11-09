import { describe, it, expect } from 'vitest';
import { formatPrice, calculateDiscountPercentage } from '../src/lib/utils/formatters';
import { slugify } from '../src/lib/utils/slugify';

describe('Formatters and Utilities', () => {
  it('formats Indian Rupee prices with proper currency symbol', () => {
    const formatted = formatPrice(1499, 'INR');
    expect(formatted).toContain('₹');
    expect(formatted).toContain('1,499');
  });

  it('formats other international currencies accurately', () => {
    const formattedUsd = formatPrice(99.99, 'USD');
    expect(formattedUsd).toContain('$');

    const formattedEur = formatPrice(89.5, 'EUR');
    expect(formattedEur).toContain('€');
  });

  it('calculates correct discount percentage', () => {
    expect(calculateDiscountPercentage(500, 1000)).toBe(50);
    expect(calculateDiscountPercentage(799, 999)).toBe(20);
    expect(calculateDiscountPercentage(1000, 1000)).toBe(0);
    expect(calculateDiscountPercentage(1200, 1000)).toBe(0);
  });

  it('creates clean SEO-friendly slugs', () => {
    expect(slugify('Sony WH-1000XM5 ANC Headphones')).toBe('sony-wh-1000xm5-anc-headphones');
    expect(slugify("Men's Pure Cotton Casual Shirt & Pants!")).toBe('mens-pure-cotton-casual-shirt-and-pants');
  });
});

