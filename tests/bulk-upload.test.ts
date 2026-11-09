import { describe, it, expect } from 'vitest';
import * as XLSX from 'xlsx';

describe('Bulk Upload Spreadsheet Validation', () => {
  it('parses valid spreadsheet rows and checks mandatory fields', () => {
    const sampleRows = [
      {
        'Product Title': 'Noise ColorFit Pulse Smart Watch',
        'Current Price': 1499,
        'Original Price': 3999,
        'Retailer': 'Amazon India',
        'Affiliate URL': 'https://www.amazon.in/dp/B091234567?tag=simplexplore-21',
        'Category': 'Electronics',
      },
      {
        'Product Title': 'Invalid Product Missing Price',
        'Current Price': '',
        'Retailer': 'Flipkart',
        'Affiliate URL': 'https://www.flipkart.com/item/123',
      },
    ];

    const worksheet = XLSX.utils.json_to_sheet(sampleRows);
    const parsed = XLSX.utils.sheet_to_json<any>(worksheet);

    expect(parsed).toHaveLength(2);

    // Row 1 should be valid
    expect(parsed[0]['Product Title']).toBeTruthy();
    expect(parseFloat(parsed[0]['Current Price'])).toBeGreaterThan(0);
    expect(parsed[0]['Affiliate URL']).toBeTruthy();

    // Row 2 should fail validation
    const row2Price = parseFloat(parsed[1]['Current Price']);
    expect(isNaN(row2Price) || row2Price <= 0).toBe(true);
  });
});

