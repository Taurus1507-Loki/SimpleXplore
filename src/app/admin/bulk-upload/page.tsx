'use client';

import React, { useState, useRef } from 'react';
import Link from 'next/link';
import { 
  UploadCloud, 
  FileSpreadsheet, 
  Download, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  FileCheck
} from 'lucide-react';

export default function BulkUploadPage() {
  const [file, setFile] = useState<File | null>(null);
  const [autoPublish, setAutoPublish] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [result, setResult] = useState<any>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      setResult(null);
    }
  };

  const handleUpload = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!file) return;

    setUploading(true);
    setResult(null);

    const formData = new FormData();
    formData.append('file', file);
    formData.append('autoPublish', String(autoPublish));

    try {
      const res = await fetch('/api/admin/bulk-upload', {
        method: 'POST',
        body: formData,
      });

      const data = await res.json();
      setResult(data);
    } catch {
      setResult({ error: 'Network failure during upload.' });
    } finally {
      setUploading(false);
    }
  };

  return (
    <div className="space-y-8 max-w-5xl">
      {/* Header */}
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <UploadCloud className="w-7 h-7 text-brand-600" />
          Bulk Product Upload (CSV &amp; Excel)
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Import multiple affiliate product deals simultaneously with automated validation and draft staging
        </p>
      </div>

      {/* Download Templates Banner */}
      <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="space-y-1">
          <h3 className="font-bold text-sm text-copy-primary flex items-center gap-2">
            <FileSpreadsheet className="w-4 h-4 text-brand-600" />
            Official Spreadsheet Templates
          </h3>
          <p className="text-xs text-copy-secondary">
            Download our pre-formatted sample files with all required product and affiliate link columns.
          </p>
        </div>

        <div className="flex items-center gap-2">
          <a
            href="/api/admin/template?format=csv"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-brand-50 hover:bg-brand-100 text-brand-700 font-semibold text-xs border border-brand-200 transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download CSV Template</span>
          </a>
          <a
            href="/api/admin/template?format=xlsx"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-surface-bg hover:bg-surface-border text-copy-primary font-semibold text-xs border border-surface-border transition-colors"
          >
            <Download className="w-3.5 h-3.5" />
            <span>Download Excel (.xlsx)</span>
          </a>
        </div>
      </div>

      {/* Upload Zone */}
      <div className="bg-white p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-6">
        <form onSubmit={handleUpload} className="space-y-6">
          <div
            onClick={() => fileInputRef.current?.click()}
            className="border-2 border-dashed border-brand-300 hover:border-brand-500 rounded-3xl p-8 sm:p-12 text-center cursor-pointer bg-brand-50/30 hover:bg-brand-50/60 transition-all space-y-3"
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileChange}
              accept=".csv,.xlsx,.xls"
              className="hidden"
            />
            <div className="w-14 h-14 rounded-2xl bg-white shadow-soft-sm border border-brand-200 text-brand-600 mx-auto flex items-center justify-center">
              <UploadCloud className="w-7 h-7" />
            </div>
            <div>
              <p className="font-bold text-sm text-copy-primary">
                {file ? file.name : 'Click to select CSV or Excel spreadsheet'}
              </p>
              <p className="text-xs text-copy-secondary mt-1">
                Supports .csv, .xlsx, .xls up to 10MB
              </p>
            </div>
          </div>

          {/* Staging Rule Toggle */}
          <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border/80 flex items-center justify-between">
            <div className="space-y-0.5">
              <div className="font-semibold text-xs text-copy-primary">Draft Protection Status</div>
              <div className="text-[11px] text-copy-secondary">
                {autoPublish
                  ? 'Warning: Valid products will be immediately published to the live store.'
                  : 'Safe Mode (Recommended): Products are imported as drafts for your review.'}
              </div>
            </div>

            <label className="flex items-center gap-2 cursor-pointer">
              <input
                type="checkbox"
                checked={autoPublish}
                onChange={(e) => setAutoPublish(e.target.checked)}
                className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
              />
              <span className="font-semibold text-xs text-copy-primary">Auto-Publish</span>
            </label>
          </div>

          <div className="flex justify-end">
            <button
              type="submit"
              disabled={!file || uploading}
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 disabled:opacity-50 text-white font-bold text-xs px-6 py-3 rounded-xl shadow-soft-sm transition-all"
            >
              <FileCheck className="w-4 h-4" />
              <span>{uploading ? 'Processing File & Validating...' : 'Process Bulk Import'}</span>
            </button>
          </div>
        </form>

        {/* Results Feedback */}
        {result && (
          <div className="space-y-4 pt-4 border-t border-surface-border">
            {result.error ? (
              <div className="p-4 rounded-2xl bg-rose-50 border border-rose-200 text-rose-900 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 text-rose-600 flex-shrink-0" />
                <span>{result.error}</span>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="p-4 rounded-2xl bg-emerald-50 border border-emerald-200 text-emerald-900 text-xs space-y-1">
                  <div className="flex items-center gap-1.5 font-bold">
                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                    <span>Bulk Import Complete</span>
                  </div>
                  <p>
                    Successfully imported <strong>{result.importedCount}</strong> products as <strong>{result.status}</strong>. Total rows: {result.totalRows}.
                  </p>
                </div>

                {result.failedCount > 0 && (
                  <div className="space-y-2">
                    <h4 className="text-xs font-bold text-rose-700 uppercase tracking-wider">
                      Failed Rows ({result.failedCount}):
                    </h4>
                    <div className="border border-rose-200 rounded-xl overflow-hidden bg-rose-50/40 text-xs">
                      <table className="w-full text-left">
                        <thead className="bg-rose-100/60 text-rose-900 font-semibold">
                          <tr>
                            <th className="py-2 px-3">Row #</th>
                            <th className="py-2 px-3">Reason</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-rose-200/60">
                          {result.failedRows.map((f: any, idx: number) => (
                            <tr key={idx}>
                              <td className="py-2 px-3 font-mono font-bold">Row {f.row}</td>
                              <td className="py-2 px-3 text-rose-700">{f.reason}</td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                <div className="pt-2">
                  <Link
                    href="/admin/products"
                    className="inline-flex items-center gap-1 text-xs font-bold text-brand-600 hover:underline"
                  >
                    <span>View Imported Products in Catalog</span>
                    <ArrowRight className="w-3.5 h-3.5" />
                  </Link>
                </div>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}

