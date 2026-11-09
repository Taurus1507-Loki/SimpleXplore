import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { requireAdminApi } from '@/lib/auth';
import { audit } from '@/lib/audit';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils/slugify';
import { extractProductIdentity } from '@/lib/telegram/deduplication';
import {
  MAX_BULK_FILE_BYTES,
  MAX_BULK_ROWS,
  mappingErrors,
  parseRow,
  suggestMapping,
  type ColumnMapping,
} from '@/lib/bulk-import';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

interface FailedRow {
  row: number;
  reason: string;
  data: Record<string, unknown>;
}

async function readSheet(file: File): Promise<{ headers: string[]; rows: Record<string, unknown>[] }> {
  const buffer = Buffer.from(await file.arrayBuffer());
  const workbook = XLSX.read(buffer, { type: 'buffer', cellFormula: false, cellHTML: false });
  const sheet = workbook.Sheets[workbook.SheetNames[0]];
  if (!sheet) return { headers: [], rows: [] };
  const headerRow = (XLSX.utils.sheet_to_json<unknown[]>(sheet, { header: 1, blankrows: false })[0] ?? []) as unknown[];
  const headers = headerRow.map((h) => String(h ?? '').trim()).filter(Boolean);
  const rows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet, { defval: '' });
  return { headers, rows };
}

/**
 * Two steps, same endpoint:
 *  - mode=preview  → column headers, a few sample rows and a suggested column mapping
 *  - mode=import   → validate every row with the chosen mapping and create products
 * Products are drafts unless the admin explicitly ticked "publish"; rows missing an
 * image or retailer always stay drafts. Nothing is invented for blank cells.
 */
export async function POST(req: NextRequest) {
  const denied = await requireAdminApi();
  if (denied) return denied;

  try {
    const formData = await req.formData();
    const file = formData.get('file');
    const mode = formData.get('mode') === 'import' ? 'import' : 'preview';
    if (!(file instanceof File)) return NextResponse.json({ error: 'No file uploaded.' }, { status: 400 });
    if (file.size > MAX_BULK_FILE_BYTES) return NextResponse.json({ error: 'File is larger than 10 MB.' }, { status: 413 });
    if (!/\.(csv|xlsx|xls)$/i.test(file.name)) return NextResponse.json({ error: 'Upload a .csv, .xlsx or .xls file.' }, { status: 415 });

    const { headers, rows } = await readSheet(file);
    if (headers.length === 0 || rows.length === 0) {
      return NextResponse.json({ error: 'The file has no header row or no data rows.' }, { status: 400 });
    }
    if (rows.length > MAX_BULK_ROWS) {
      return NextResponse.json({ error: `The file has ${rows.length} rows. Split it into files of ${MAX_BULK_ROWS} rows or fewer.` }, { status: 400 });
    }

    if (mode === 'preview') {
      return NextResponse.json({ headers, rowCount: rows.length, sampleRows: rows.slice(0, 5), suggestedMapping: suggestMapping(headers) });
    }

    // --- import ---
    let mapping: ColumnMapping;
    try {
      mapping = JSON.parse(String(formData.get('mapping') ?? '{}'));
    } catch {
      return NextResponse.json({ error: 'Invalid column mapping.' }, { status: 400 });
    }
    const problems = mappingErrors(mapping, headers);
    if (problems.length) return NextResponse.json({ error: problems.join(' ') }, { status: 400 });
    const autoPublish = formData.get('autoPublish') === 'true';

    const categories = await db.getCategories();
    // Duplicate detection: same retailer product id or same normalised URL as an existing product or an earlier row.
    const { products: existing } = await db.getProducts({ status: 'all' });
    const known = new Map<string, string>();
    const keysOf = (url: string) => {
      const id = extractProductIdentity(url);
      return [id.productId ? `id:${id.productId}` : null, `url:${id.normalizedUrl}`].filter(Boolean) as string[];
    };
    for (const p of existing) for (const k of keysOf(p.affiliate_url)) known.set(k, `existing product “${p.title}”`);

    const created: string[] = [];
    const failedRows: FailedRow[] = [];
    const warnings: Array<{ row: number; message: string }> = [];
    let publishedCount = 0;

    for (let i = 0; i < rows.length; i++) {
      const rowNumber = i + 2; // header is row 1
      const raw = rows[i];
      const parsed = parseRow(raw, mapping, categories);
      if (!parsed.ok) {
        failedRows.push({ row: rowNumber, reason: parsed.reason, data: raw });
        continue;
      }
      const r = parsed.row;
      const dupKey = keysOf(r.affiliate_url).find((k) => known.has(k));
      if (dupKey) {
        failedRows.push({ row: rowNumber, reason: `Duplicate of ${known.get(dupKey)}`, data: raw });
        continue;
      }

      const canPublish = autoPublish && !!r.image_url && !!r.retailer;
      try {
        const product = await db.createProduct({
          title: r.title,
          slug: `${slugify(r.title) || 'product'}-${Math.random().toString(36).slice(2, 6)}`,
          description: r.description,
          category_id: r.category_id,
          retailer: r.retailer,
          current_price: r.current_price,
          original_price: r.original_price,
          currency: r.currency,
          discount: r.discount,
          rating: r.rating,
          review_count: r.review_count,
          image_url: r.image_url,
          affiliate_url: r.affiliate_url,
          featured: r.featured,
          trending: r.trending,
          status: canPublish ? 'published' : 'draft',
          source_type: 'bulk_upload',
        });
        created.push(product.id);
        if (canPublish) publishedCount++;
        for (const k of keysOf(r.affiliate_url)) known.set(k, `row ${rowNumber} in this file`);
        for (const w of parsed.warnings) warnings.push({ row: rowNumber, message: w });
      } catch (err) {
        failedRows.push({ row: rowNumber, reason: err instanceof Error ? err.message : String(err), data: raw });
      }
    }

    await audit('product.bulk_import', 'product', null, {
      file: file.name,
      count: created.length,
      published: publishedCount,
      failed: failedRows.length,
    });

    return NextResponse.json({
      success: true,
      totalRows: rows.length,
      importedCount: created.length,
      publishedCount,
      draftCount: created.length - publishedCount,
      failedCount: failedRows.length,
      failedRows,
      warnings,
      headers,
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: `Could not read the file: ${errMsg}` }, { status: 500 });
  }
}
