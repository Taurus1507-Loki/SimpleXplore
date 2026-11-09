/**
 * Spreadsheet reading/writing for bulk upload (replaces the unmaintained `xlsx`
 * package, which has unfixed prototype-pollution and ReDoS advisories).
 * - CSV: papaparse
 * - XLSX: exceljs (legacy .xls is not supported — save as .xlsx or .csv)
 */
import ExcelJS from 'exceljs';
import Papa from 'papaparse';

export interface SheetData {
  headers: string[];
  rows: Record<string, unknown>[];
}

export class SpreadsheetError extends Error {}

const safeKey = (h: string) => (h === '__proto__' || h === 'constructor' || h === 'prototype' ? `_${h}` : h);

/** Plain value from an ExcelJS cell (formulas → result, rich text/hyperlinks → text, dates → ISO date). */
function cellValue(value: ExcelJS.CellValue): unknown {
  if (value === null || value === undefined) return '';
  if (value instanceof Date) return value.toISOString().slice(0, 10);
  if (typeof value !== 'object') return value;
  const v = value as unknown as Record<string, unknown>;
  if ('result' in v) return cellValue(v.result as ExcelJS.CellValue);
  if (Array.isArray(v.richText)) return (v.richText as Array<{ text: string }>).map((t) => t.text).join('');
  if (typeof v.text === 'string' && v.text) return v.text;
  if (typeof v.hyperlink === 'string') return v.hyperlink;
  if ('error' in v) return '';
  return '';
}

function toRecords(headers: string[], matrix: unknown[][]): Record<string, unknown>[] {
  const records: Record<string, unknown>[] = [];
  for (const cells of matrix) {
    if (cells.every((c) => c === '' || c === null || c === undefined)) continue;
    // Null-prototype objects: header names from the file can never touch Object.prototype.
    const rec: Record<string, unknown> = Object.create(null);
    headers.forEach((h, i) => {
      if (h) rec[h] = cells[i] ?? '';
    });
    records.push(rec);
  }
  return records;
}

export async function readSpreadsheet(fileName: string, data: ArrayBuffer, maxRows: number): Promise<SheetData> {
  const lower = fileName.toLowerCase();

  if (lower.endsWith('.csv')) {
    const text = new TextDecoder('utf-8').decode(data).replace(/^﻿/, '');
    const parsed = Papa.parse<string[]>(text, { skipEmptyLines: 'greedy' });
    const [headerRow = [], ...body] = parsed.data;
    if (body.length > maxRows) throw new SpreadsheetError(`The file has ${body.length} rows. Split it into files of ${maxRows} rows or fewer.`);
    const headers = headerRow.map((h) => safeKey(String(h ?? '').trim()));
    return { headers: headers.filter(Boolean), rows: toRecords(headers, body) };
  }

  if (lower.endsWith('.xlsx')) {
    const workbook = new ExcelJS.Workbook();
    try {
      await workbook.xlsx.load(data);
    } catch {
      throw new SpreadsheetError('This Excel file could not be read. Re-save it as .xlsx and try again.');
    }
    const sheet = workbook.worksheets[0];
    if (!sheet) return { headers: [], rows: [] };
    if (sheet.actualRowCount - 1 > maxRows) {
      throw new SpreadsheetError(`The file has ${sheet.actualRowCount - 1} rows. Split it into files of ${maxRows} rows or fewer.`);
    }
    const width = sheet.columnCount;
    const matrix: unknown[][] = [];
    sheet.eachRow({ includeEmpty: false }, (row) => {
      const cells: unknown[] = [];
      for (let c = 1; c <= width; c++) cells.push(cellValue(row.getCell(c).value));
      matrix.push(cells);
    });
    const [headerRow = [], ...body] = matrix;
    const headers = headerRow.map((h) => safeKey(String(h ?? '').trim()));
    return { headers: headers.filter(Boolean), rows: toRecords(headers, body) };
  }

  if (lower.endsWith('.xls')) {
    throw new SpreadsheetError('Old .xls files aren’t supported. In Excel choose “Save As” → .xlsx (or CSV) and upload that.');
  }
  throw new SpreadsheetError('Upload a .csv or .xlsx file.');
}

/** Build an .xlsx file from rows (used for the downloadable template). */
export async function writeXlsx(sheetName: string, rows: Record<string, unknown>[]): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  const sheet = workbook.addWorksheet(sheetName);
  const headers = Object.keys(rows[0] ?? {});
  sheet.columns = headers.map((h) => ({ header: h, key: h, width: Math.max(14, Math.min(60, h.length + 6)) }));
  rows.forEach((r) => sheet.addRow(r));
  sheet.getRow(1).font = { bold: true };
  return Buffer.from(await workbook.xlsx.writeBuffer());
}

/** Build CSV text from rows. */
export function writeCsv(rows: Record<string, unknown>[]): string {
  return '﻿' + Papa.unparse(rows, { escapeFormulae: true });
}
