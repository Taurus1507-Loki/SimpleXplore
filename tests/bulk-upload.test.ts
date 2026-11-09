import { describe, it, expect } from 'vitest';
import { readSpreadsheet, writeXlsx, writeCsv, SpreadsheetError } from '../src/lib/spreadsheet';

const enc = (s: string) => new TextEncoder().encode(s).buffer as ArrayBuffer;

describe('Spreadsheet reading for bulk upload', () => {
  const sample = [
    { 'Product Title': 'Noise ColorFit Pulse', 'Current Price': 1499, 'Affiliate URL': 'https://www.amazon.in/dp/B091234567' },
    { 'Product Title': 'Missing price', 'Current Price': '', 'Affiliate URL': 'https://www.flipkart.com/item/123' },
  ];

  it('reads CSV with quoted values and a BOM', async () => {
    const csv = '﻿Product Title,Current Price,Affiliate URL\n"Shoes, running",1499,https://a.com/x\n\n,,\n';
    const { headers, rows } = await readSpreadsheet('deals.csv', enc(csv), 100);
    expect(headers).toEqual(['Product Title', 'Current Price', 'Affiliate URL']);
    expect(rows).toHaveLength(1);
    expect(rows[0]['Product Title']).toBe('Shoes, running');
  });

  it('round-trips an .xlsx file', async () => {
    const buf = await writeXlsx('Products', sample);
    const ab = buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
    const { headers, rows } = await readSpreadsheet('deals.xlsx', ab, 100);
    expect(headers).toEqual(['Product Title', 'Current Price', 'Affiliate URL']);
    expect(rows).toHaveLength(2);
    expect(rows[0]['Current Price']).toBe(1499);
    expect(rows[1]['Current Price']).toBe('');
  });

  it('cannot be used for prototype pollution via header names', async () => {
    const csv = '__proto__,constructor,Title\n{"polluted":true},x,ok\n';
    const { rows } = await readSpreadsheet('evil.csv', enc(csv), 100);
    expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    expect(Object.getPrototypeOf(rows[0])).toBeNull();
    expect(rows[0]['_constructor']).toBe('x');
  });

  it('enforces the row limit and rejects legacy/unsupported files', async () => {
    const many = 'T\n' + Array.from({ length: 6 }, (_, i) => `r${i}`).join('\n');
    await expect(readSpreadsheet('big.csv', enc(many), 5)).rejects.toBeInstanceOf(SpreadsheetError);
    await expect(readSpreadsheet('old.xls', enc('x'), 5)).rejects.toThrow(/xlsx/);
    await expect(readSpreadsheet('notes.txt', enc('x'), 5)).rejects.toThrow(/csv/i);
    await expect(readSpreadsheet('broken.xlsx', enc('not a zip'), 5)).rejects.toBeInstanceOf(SpreadsheetError);
  });

  it('writes a template CSV that is safe to open in Excel', () => {
    const csv = writeCsv([{ Title: '=cmd|calc', Price: 10 }]);
    expect(csv.startsWith('﻿')).toBe(true);
    expect(csv).toContain(`"'=cmd|calc"`);
  });
});
