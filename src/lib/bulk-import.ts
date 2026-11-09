/**
 * Bulk CSV/XLSX import: column mapping, row parsing and validation.
 * Pure functions (no I/O) so they can be unit-tested and shared by the API route.
 */
import type { Category } from '@/types';
import { isSafeExternalUrl } from '@/lib/utils/ssrf';

export type BulkField =
  | 'title' | 'description' | 'category' | 'retailer' | 'image_url' | 'current_price'
  | 'original_price' | 'currency' | 'affiliate_url' | 'rating' | 'review_count' | 'featured' | 'trending';

export interface BulkFieldDef {
  key: BulkField;
  label: string;
  required: boolean;
  /** Header names we recognise automatically (compared case/space/punctuation-insensitively). */
  aliases: string[];
}

export const BULK_FIELDS: BulkFieldDef[] = [
  { key: 'title', label: 'Product title', required: true, aliases: ['product title', 'title', 'name', 'product name', 'product'] },
  { key: 'current_price', label: 'Current price', required: true, aliases: ['current price', 'price', 'sale price', 'deal price', 'offer price', 'selling price'] },
  { key: 'affiliate_url', label: 'Affiliate URL', required: true, aliases: ['affiliate url', 'affiliate link', 'url', 'link', 'product url', 'buy link'] },
  { key: 'image_url', label: 'Image URL', required: false, aliases: ['image url', 'image', 'image link', 'photo', 'picture', 'thumbnail'] },
  { key: 'retailer', label: 'Retailer', required: false, aliases: ['retailer', 'store', 'shop', 'merchant', 'seller', 'marketplace'] },
  { key: 'category', label: 'Category', required: false, aliases: ['category', 'department', 'section'] },
  { key: 'original_price', label: 'Original price (MRP)', required: false, aliases: ['original price', 'mrp', 'list price', 'regular price', 'was price'] },
  { key: 'currency', label: 'Currency', required: false, aliases: ['currency', 'currency code'] },
  { key: 'description', label: 'Description', required: false, aliases: ['description', 'details', 'about', 'summary'] },
  { key: 'rating', label: 'Rating (0–5)', required: false, aliases: ['rating', 'stars', 'star rating'] },
  { key: 'review_count', label: 'Review count', required: false, aliases: ['review count', 'reviews', 'ratings count', 'number of reviews'] },
  { key: 'featured', label: 'Featured (yes/no)', required: false, aliases: ['featured'] },
  { key: 'trending', label: 'Trending (yes/no)', required: false, aliases: ['trending'] },
];

export type ColumnMapping = Partial<Record<BulkField, string>>;

export const MAX_BULK_ROWS = 2000;
export const MAX_BULK_FILE_BYTES = 10 * 1024 * 1024;

const norm = (s: string) => s.toLowerCase().replace(/[^a-z0-9]+/g, ' ').trim();

/** Guess which spreadsheet column holds each field. Each column is used at most once. */
export function suggestMapping(headers: string[]): ColumnMapping {
  const mapping: ColumnMapping = {};
  const used = new Set<string>();
  const normalized = headers.map((h) => ({ raw: h, n: norm(h) }));
  for (const field of BULK_FIELDS) {
    const exact = normalized.find((h) => !used.has(h.raw) && field.aliases.some((a) => h.n === a));
    const loose = exact ?? normalized.find((h) => !used.has(h.raw) && field.aliases.some((a) => a.length > 3 && h.n.includes(a)));
    if (loose) {
      mapping[field.key] = loose.raw;
      used.add(loose.raw);
    }
  }
  return mapping;
}

/** Mapping problems that block the import (missing required fields, column used twice). */
export function mappingErrors(mapping: ColumnMapping, headers: string[]): string[] {
  const errors: string[] = [];
  for (const f of BULK_FIELDS) {
    if (f.required && !mapping[f.key]) errors.push(`Choose a column for “${f.label}”.`);
  }
  const seen = new Map<string, BulkField>();
  for (const [field, col] of Object.entries(mapping) as [BulkField, string][]) {
    if (!col) continue;
    if (!headers.includes(col)) errors.push(`Column “${col}” is not in the file.`);
    const prev = seen.get(col);
    if (prev) errors.push(`Column “${col}” is used for both ${prev} and ${field}.`);
    seen.set(col, field);
  }
  return errors;
}

const text = (v: unknown) => (v === undefined || v === null ? '' : String(v).trim());
const money = (v: unknown): number | undefined => {
  const s = text(v).replace(/[^0-9.]/g, '');
  if (!s) return undefined;
  const n = parseFloat(s);
  return Number.isFinite(n) ? n : NaN;
};
const yes = (v: unknown) => ['true', 'yes', 'y', '1'].includes(text(v).toLowerCase());

export interface ParsedRow {
  title: string;
  description: string | null;
  categoryName: string;
  category_id: string | null;
  retailer: string;
  image_url: string;
  current_price: number;
  original_price: number | null;
  discount: number | null;
  currency: string;
  affiliate_url: string;
  rating: number | null;
  review_count: number | null;
  featured: boolean;
  trending: boolean;
}

export type RowResult =
  | { ok: true; row: ParsedRow; warnings: string[] }
  | { ok: false; reason: string };

/** Turn one spreadsheet row into product fields. Nothing is invented: blanks stay blank. */
export function parseRow(raw: Record<string, unknown>, mapping: ColumnMapping, categories: Category[]): RowResult {
  const get = (f: BulkField) => (mapping[f] ? raw[mapping[f]!] : undefined);
  const warnings: string[] = [];

  const title = text(get('title'));
  if (!title) return { ok: false, reason: 'Missing product title' };
  if (title.length > 250) return { ok: false, reason: 'Title is longer than 250 characters' };

  const current = money(get('current_price'));
  if (current === undefined || Number.isNaN(current) || current <= 0) return { ok: false, reason: 'Missing or invalid current price' };

  const affiliate = text(get('affiliate_url'));
  if (!affiliate) return { ok: false, reason: 'Missing affiliate URL' };
  if (!/^https?:\/\//i.test(affiliate) || !isSafeExternalUrl(affiliate).isSafe) {
    return { ok: false, reason: 'Affiliate URL must be a public http(s) link' };
  }

  const original = money(get('original_price'));
  if (Number.isNaN(original)) return { ok: false, reason: 'Original price is not a number' };
  let originalPrice: number | null = original ?? null;
  if (originalPrice !== null && originalPrice < current) {
    warnings.push('Original price was lower than current price and was ignored');
    originalPrice = null;
  }

  const image = text(get('image_url'));
  if (image && !/^https:\/\//i.test(image)) return { ok: false, reason: 'Image URL must start with https://' };
  if (!image) warnings.push('No image — saved as a draft until you add one');

  const ratingText = text(get('rating'));
  let rating: number | null = null;
  if (ratingText) {
    const r = parseFloat(ratingText);
    if (!Number.isFinite(r) || r < 0 || r > 5) return { ok: false, reason: 'Rating must be between 0 and 5' };
    rating = r;
  }
  const reviewsText = text(get('review_count')).replace(/[,\s]/g, '');
  let reviews: number | null = null;
  if (reviewsText) {
    const n = Number(reviewsText);
    if (!Number.isInteger(n) || n < 0) return { ok: false, reason: 'Review count must be a whole number' };
    reviews = n;
  }

  const currency = (text(get('currency')) || 'INR').toUpperCase();
  if (!/^[A-Z]{3}$/.test(currency)) return { ok: false, reason: 'Currency must be a 3-letter code like INR' };

  const categoryName = text(get('category'));
  const cat = categoryName
    ? categories.find((c) => norm(c.name) === norm(categoryName) || c.slug === norm(categoryName).replace(/ /g, '-'))
    : undefined;
  if (categoryName && !cat) warnings.push(`Category “${categoryName}” not found — left uncategorised`);

  const retailer = text(get('retailer'));
  if (!retailer) warnings.push('No retailer — saved as a draft until you add one');

  return {
    ok: true,
    warnings,
    row: {
      title,
      description: text(get('description')) || null,
      categoryName,
      category_id: cat?.id ?? null,
      retailer,
      image_url: image,
      current_price: current,
      original_price: originalPrice,
      discount: originalPrice ? Math.round(((originalPrice - current) / originalPrice) * 100) : null,
      currency,
      affiliate_url: affiliate,
      rating,
      review_count: reviews,
      featured: yes(get('featured')),
      trending: yes(get('trending')),
    },
  };
}

/** CSV for "download failed rows": original columns plus an Error column (Excel-safe). */
export function failedRowsCsv(headers: string[], rows: Array<{ row: number; reason: string; data: Record<string, unknown> }>): string {
  const cell = (v: unknown) => {
    let s = v === undefined || v === null ? '' : String(v);
    if (/^[=+\-@\t\r]/.test(s)) s = `'${s}`; // stop spreadsheet formula injection
    return /[",\n\r]/.test(s) ? `"${s.replace(/"/g, '""')}"` : s;
  };
  const cols = [...headers, 'Row', 'Error'];
  const lines = rows.map((r) => [...headers.map((h) => cell(r.data[h])), cell(r.row), cell(r.reason)].join(','));
  return '﻿' + [cols.map(cell).join(','), ...lines].join('\r\n');
}
