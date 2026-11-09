import { NextRequest, NextResponse } from 'next/server';
import * as XLSX from 'xlsx';

export async function GET(req: NextRequest) {
  const format = req.nextUrl.searchParams.get('format') || 'csv';

  const sampleData = [
    {
      'Product Title': 'Sample Wireless Noise Cancelling Headphones',
      'Description': 'Premium headphones with 30-hour battery life and Bluetooth 5.2.',
      'Category': 'Electronics',
      'Retailer': 'Amazon India',
      'Current Price': 2999,
      'Original Price': 4999,
      'Currency': 'INR',
      'Affiliate URL': 'https://www.amazon.in/dp/EXAMPLE?tag=simplexplore-21',
      'Image URL': 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800',
      'Rating': 4.5,
      'Review Count': 120,
      'Featured': 'true',
      'Trending': 'false',
    },
    {
      'Product Title': 'Classic Men Casual Cotton Shirt',
      'Description': '100% pure breathable cotton slim fit shirt for casual and office wear.',
      'Category': 'Fashion',
      'Retailer': 'Myntra',
      'Current Price': 1299,
      'Original Price': 2499,
      'Currency': 'INR',
      'Affiliate URL': 'https://www.myntra.com/shirt/example?utm_source=simplexplore',
      'Image URL': 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=800',
      'Rating': 4.3,
      'Review Count': 85,
      'Featured': 'false',
      'Trending': 'true',
    },
  ];

  const worksheet = XLSX.utils.json_to_sheet(sampleData);
  const workbook = XLSX.utils.book_new();
  XLSX.utils.book_append_sheet(workbook, worksheet, 'Products');

  if (format === 'xlsx') {
    const buffer = XLSX.write(workbook, { type: 'buffer', bookType: 'xlsx' });
    return new NextResponse(buffer, {
      headers: {
        'Content-Disposition': 'attachment; filename="simplexplore_products_template.xlsx"',
        'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      },
    });
  }

  // Default CSV format
  const csvOutput = XLSX.utils.sheet_to_csv(worksheet);
  return new NextResponse(csvOutput, {
    headers: {
      'Content-Disposition': 'attachment; filename="simplexplore_products_template.csv"',
      'Content-Type': 'text/csv; charset=utf-8',
    },
  });
}

