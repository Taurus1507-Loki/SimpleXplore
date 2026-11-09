import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';
import { db } from '@/lib/db';
import { slugify } from '@/lib/utils/slugify';

export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  try {
    const formData = await req.formData();
    const file = formData.get('file') as File | null;
    const autoPublish = formData.get('autoPublish') === 'true';

    if (!file) {
      return NextResponse.json({ error: 'No file uploaded' }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const workbook = XLSX.read(buffer, { type: 'buffer' });
    const sheetName = workbook.SheetNames[0];
    const sheet = workbook.Sheets[sheetName];
    const rawRows = XLSX.utils.sheet_to_json<Record<string, unknown>>(sheet);

    if (rawRows.length === 0) {
      return NextResponse.json({ error: 'Uploaded file contains no rows' }, { status: 400 });
    }

    const categories = await db.getCategories();
    const successfulProducts = [];
    const failedRows: { row: number; reason: string; data: Record<string, unknown> }[] = [];

    for (let index = 0; index < rawRows.length; index++) {
      const row = rawRows[index];
      const rowNumber = index + 2; // Accounting for 1-based index + header row

      const title = String(row['Product Title'] || row['title'] || '').trim();
      const currentPriceRaw = row['Current Price'] || row['price'] || row['current_price'];
      const currentPrice = parseFloat(String(currentPriceRaw).replace(/[^0-9.]/g, ''));
      const affiliateUrl = String(row['Affiliate URL'] || row['affiliate_url'] || '').trim();

      // Mandatory fields validation
      if (!title) {
        failedRows.push({ row: rowNumber, reason: 'Missing Product Title', data: row });
        continue;
      }
      if (isNaN(currentPrice) || currentPrice <= 0) {
        failedRows.push({ row: rowNumber, reason: 'Invalid or missing Current Price', data: row });
        continue;
      }
      if (!affiliateUrl) {
        failedRows.push({ row: rowNumber, reason: 'Missing Affiliate URL', data: row });
        continue;
      }

      const originalPriceRaw = row['Original Price'] || row['original_price'];
      const originalPrice = originalPriceRaw ? parseFloat(String(originalPriceRaw).replace(/[^0-9.]/g, '')) : undefined;
      const discount = originalPrice && originalPrice > currentPrice ? Math.round(((originalPrice - currentPrice) / originalPrice) * 100) : 0;

      const categoryName = String(row['Category'] || row['category'] || '').trim();
      const matchedCategory = categories.find(c => c.name.toLowerCase() === categoryName.toLowerCase());

      const product = await db.createProduct({
        title,
        slug: slugify(title) + '-' + Math.random().toString(36).substr(2, 4),
        description: String(row['Description'] || row['description'] || '').trim() || null,
        category_id: matchedCategory ? matchedCategory.id : 'cat-electronics',
        retailer: String(row['Retailer'] || row['retailer'] || 'Online Retailer').trim(),
        current_price: currentPrice,
        original_price: originalPrice,
        currency: String(row['Currency'] || 'INR').toUpperCase(),
        discount,
        rating: parseFloat(String(row['Rating'] || '4.2')),
        review_count: parseInt(String(row['Review Count'] || '10'), 10),
        image_url: String(row['Image URL'] || row['image_url'] || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800').trim(),
        affiliate_url: affiliateUrl,
        featured: String(row['Featured']).toLowerCase() === 'true',
        trending: String(row['Trending']).toLowerCase() === 'true',
        status: autoPublish ? 'published' : 'draft', // DRAFT by default per requirements
        source_type: 'bulk_upload',
      });

      successfulProducts.push(product);
    }

    return NextResponse.json({
      success: true,
      totalRows: rawRows.length,
      importedCount: successfulProducts.length,
      failedCount: failedRows.length,
      failedRows,
      status: autoPublish ? 'published' : 'draft',
    });
  } catch (error: unknown) {
    const errMsg = error instanceof Error ? error.message : String(error);
    return NextResponse.json({ error: errMsg }, { status: 500 });
  }
}

