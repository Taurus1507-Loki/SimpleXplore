'use client';

import React, { useMemo, useRef, useState } from 'react';
import Link from 'next/link';
import { UploadCloud, FileSpreadsheet, Download, CheckCircle2, AlertCircle, ArrowRight, ArrowLeft, Columns3, Loader2 } from 'lucide-react';
import { BULK_FIELDS, failedRowsCsv, mappingErrors, type ColumnMapping, type BulkField } from '@/lib/bulk-import';

interface Preview {
  headers: string[];
  rowCount: number;
  sampleRows: Record<string, unknown>[];
  suggestedMapping: ColumnMapping;
}

interface ImportResult {
  totalRows: number;
  importedCount: number;
  publishedCount: number;
  draftCount: number;
  failedCount: number;
  failedRows: Array<{ row: number; reason: string; data: Record<string, unknown> }>;
  warnings: Array<{ row: number; message: string }>;
  headers: string[];
}

type Step = 'choose' | 'map' | 'done';

const STEPS: Array<{ key: Step; label: string }> = [
  { key: 'choose', label: 'Choose file' },
  { key: 'map', label: 'Match columns' },
  { key: 'done', label: 'Results' },
];

export default function BulkUploadPage() {
  const [step, setStep] = useState<Step>('choose');
  const [file, setFile] = useState<File | null>(null);
  const [preview, setPreview] = useState<Preview | null>(null);
  const [mapping, setMapping] = useState<ColumnMapping>({});
  const [autoPublish, setAutoPublish] = useState(false);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [result, setResult] = useState<ImportResult | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const problems = useMemo(() => (preview ? mappingErrors(mapping, preview.headers) : []), [mapping, preview]);

  async function send(mode: 'preview' | 'import', f: File) {
    const form = new FormData();
    form.append('file', f);
    form.append('mode', mode);
    if (mode === 'import') {
      form.append('mapping', JSON.stringify(mapping));
      form.append('autoPublish', String(autoPublish));
    }
    const res = await fetch('/api/admin/bulk-upload', { method: 'POST', body: form });
    const data = await res.json().catch(() => ({}));
    if (!res.ok) throw new Error(data.error || 'Upload failed.');
    return data;
  }

  async function chooseFile(f: File) {
    setFile(f);
    setError(null);
    setBusy(true);
    try {
      const data = (await send('preview', f)) as Preview;
      setPreview(data);
      setMapping(data.suggestedMapping);
      setStep('map');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Could not read the file.');
    } finally {
      setBusy(false);
    }
  }

  async function runImport() {
    if (!file || problems.length) return;
    setBusy(true);
    setError(null);
    try {
      setResult((await send('import', file)) as ImportResult);
      setStep('done');
    } catch (e) {
      setError(e instanceof Error ? e.message : 'Import failed.');
    } finally {
      setBusy(false);
    }
  }

  function downloadFailed() {
    if (!result) return;
    const blob = new Blob([failedRowsCsv(result.headers, result.failedRows)], { type: 'text/csv;charset=utf-8' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${(file?.name ?? 'import').replace(/\.[^.]+$/, '')}-failed-rows.csv`;
    a.click();
    URL.revokeObjectURL(url);
  }

  function reset() {
    setStep('choose');
    setFile(null);
    setPreview(null);
    setMapping({});
    setResult(null);
    setError(null);
  }

  const mappedValue = (row: Record<string, unknown>, f: BulkField) => {
    const col = mapping[f];
    const v = col ? row[col] : '';
    return v === undefined || v === null || v === '' ? '—' : String(v);
  };

  return (
    <div className="space-y-6 max-w-5xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <UploadCloud className="w-7 h-7 text-brand-600" />
          Bulk Upload (CSV &amp; Excel)
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Import many products at once. Products are saved as drafts unless you choose to publish them.
        </p>
      </div>

      {/* Step indicator */}
      <ol className="flex items-center gap-2 text-xs">
        {STEPS.map((s, i) => {
          const active = s.key === step;
          const done = STEPS.findIndex((x) => x.key === step) > i;
          return (
            <li key={s.key} className="flex items-center gap-2">
              <span
                aria-current={active ? 'step' : undefined}
                className={`flex items-center gap-1.5 rounded-full px-3 py-1 font-semibold ${
                  active ? 'bg-brand-600 text-white' : done ? 'bg-brand-50 text-brand-800' : 'bg-surface-muted text-copy-muted'
                }`}
              >
                <span className="tabular">{i + 1}</span> {s.label}
              </span>
              {i < STEPS.length - 1 && <span className="h-px w-6 bg-surface-border" aria-hidden="true" />}
            </li>
          );
        })}
      </ol>

      {error && (
        <div role="alert" className="flex items-center gap-2 rounded-2xl border border-red-200 bg-red-50 p-4 text-xs text-red-900">
          <AlertCircle className="h-4 w-4 shrink-0 text-red-600" /> {error}
        </div>
      )}

      {step === 'choose' && (
        <>
          <div className="flex flex-col items-start justify-between gap-4 rounded-3xl border border-surface-border bg-white p-6 shadow-soft-sm sm:flex-row sm:items-center">
            <div className="space-y-1">
              <h2 className="flex items-center gap-2 text-sm font-bold text-copy-primary">
                <FileSpreadsheet className="h-4 w-4 text-brand-600" /> Templates
              </h2>
              <p className="text-xs text-copy-secondary">
                Optional — any spreadsheet works; you’ll match its columns in the next step.
              </p>
            </div>
            <div className="flex items-center gap-2">
              <a href="/api/admin/template?format=csv" className="inline-flex items-center gap-1.5 rounded-xl border border-brand-200 bg-brand-50 px-3.5 py-2 text-xs font-semibold text-brand-700 hover:bg-brand-100">
                <Download className="h-3.5 w-3.5" /> CSV template
              </a>
              <a href="/api/admin/template?format=xlsx" className="inline-flex items-center gap-1.5 rounded-xl border border-surface-border bg-surface-bg px-3.5 py-2 text-xs font-semibold text-copy-primary hover:bg-surface-border">
                <Download className="h-3.5 w-3.5" /> Excel template
              </a>
            </div>
          </div>

          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            onDragOver={(e) => e.preventDefault()}
            onDrop={(e) => {
              e.preventDefault();
              const f = e.dataTransfer.files?.[0];
              if (f) chooseFile(f);
            }}
            disabled={busy}
            className="block w-full space-y-3 rounded-3xl border-2 border-dashed border-brand-300 bg-white p-10 text-center transition-colors hover:border-brand-500 hover:bg-brand-50/40 disabled:opacity-70 sm:p-14"
          >
            <input
              ref={fileInputRef}
              type="file"
              accept=".csv,.xlsx"
              className="sr-only"
              tabIndex={-1}
              onChange={(e) => {
                const f = e.target.files?.[0];
                e.target.value = '';
                if (f) chooseFile(f);
              }}
            />
            <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl border border-brand-200 bg-white text-brand-600 shadow-soft-sm">
              {busy ? <Loader2 className="h-7 w-7 animate-spin" /> : <UploadCloud className="h-7 w-7" />}
            </span>
            <span className="block text-sm font-bold text-copy-primary">{busy ? `Reading ${file?.name}…` : 'Click or drop a CSV / Excel file'}</span>
            <span className="block text-xs text-copy-secondary">.csv or .xlsx · up to 10 MB · up to 2,000 rows</span>
          </button>
        </>
      )}

      {step === 'map' && preview && (
        <div className="space-y-5 rounded-3xl border border-surface-border bg-white p-6 shadow-soft-sm">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <h2 className="flex items-center gap-2 text-sm font-bold text-copy-primary">
              <Columns3 className="h-4 w-4 text-brand-600" /> Match your columns
            </h2>
            <p className="text-xs text-copy-secondary">
              {file?.name} · {preview.rowCount} rows · {preview.headers.length} columns
            </p>
          </div>
          <p className="text-xs text-copy-secondary">
            We guessed where possible. Pick the column for each field; leave optional ones as “Not in file”.
          </p>

          <div className="grid gap-3 sm:grid-cols-2">
            {BULK_FIELDS.map((f) => (
              <div key={f.key} className="flex items-center justify-between gap-3 rounded-xl border border-surface-border px-3 py-2">
                <label htmlFor={`map-${f.key}`} className="text-xs font-semibold text-copy-primary">
                  {f.label}
                  {f.required && <span className="text-red-600"> *</span>}
                </label>
                <select
                  id={`map-${f.key}`}
                  value={mapping[f.key] ?? ''}
                  onChange={(e) => setMapping((m) => ({ ...m, [f.key]: e.target.value || undefined }))}
                  className="max-w-[55%] rounded-lg border border-surface-border bg-white px-2 py-1.5 text-xs focus:border-brand-500 focus:outline-none"
                >
                  <option value="">{f.required ? 'Choose a column…' : 'Not in file'}</option>
                  {preview.headers.map((h) => (
                    <option key={h} value={h}>
                      {h}
                    </option>
                  ))}
                </select>
              </div>
            ))}
          </div>

          {/* Mapped preview */}
          <div>
            <h3 className="mb-2 text-xs font-bold uppercase tracking-wider text-copy-secondary">Preview (first {preview.sampleRows.length} rows)</h3>
            <div className="overflow-x-auto rounded-xl border border-surface-border">
              <table className="w-full min-w-[640px] text-left text-xs">
                <thead className="bg-surface-bg text-copy-secondary">
                  <tr>
                    {(['title', 'current_price', 'retailer', 'category', 'image_url', 'affiliate_url'] as BulkField[]).map((f) => (
                      <th key={f} className="px-3 py-2 font-semibold">{BULK_FIELDS.find((x) => x.key === f)?.label}</th>
                    ))}
                  </tr>
                </thead>
                <tbody className="divide-y divide-surface-border/60">
                  {preview.sampleRows.map((row, i) => (
                    <tr key={i}>
                      {(['title', 'current_price', 'retailer', 'category', 'image_url', 'affiliate_url'] as BulkField[]).map((f) => (
                        <td key={f} className="max-w-[12rem] truncate px-3 py-2 text-copy-primary">{mappedValue(row, f)}</td>
                      ))}
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

          <label className="flex cursor-pointer items-start gap-3 rounded-2xl border border-surface-border bg-surface-bg p-4">
            <input type="checkbox" checked={autoPublish} onChange={(e) => setAutoPublish(e.target.checked)} className="mt-0.5 h-4 w-4" />
            <span className="text-xs">
              <span className="block font-semibold text-copy-primary">Publish valid products immediately</span>
              <span className="text-copy-secondary">
                {autoPublish
                  ? 'Rows with an image and retailer go live straight away; others are saved as drafts.'
                  : 'Recommended off: everything is saved as a draft for you to review first.'}
              </span>
            </span>
          </label>

          {problems.length > 0 && (
            <ul className="space-y-1 rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              {problems.map((p) => <li key={p}>• {p}</li>)}
            </ul>
          )}

          <div className="flex justify-between gap-2">
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-copy-secondary hover:bg-surface-muted">
              <ArrowLeft className="h-3.5 w-3.5" /> Choose another file
            </button>
            <button
              type="button"
              onClick={runImport}
              disabled={busy || problems.length > 0}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-600 px-6 py-2.5 text-xs font-bold text-white shadow-soft-sm hover:bg-brand-700 disabled:opacity-50"
            >
              {busy ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
              {busy ? 'Importing…' : `Import ${preview.rowCount} rows`}
            </button>
          </div>
        </div>
      )}

      {step === 'done' && result && (
        <div className="space-y-5 rounded-3xl border border-surface-border bg-white p-6 shadow-soft-sm">
          <dl className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            {[
              { label: 'Rows in file', value: result.totalRows },
              { label: 'Imported', value: result.importedCount },
              { label: 'Published', value: result.publishedCount },
              { label: 'Failed', value: result.failedCount },
            ].map((s) => (
              <div key={s.label} className="rounded-2xl border border-surface-border p-4">
                <dt className="text-[11px] font-semibold uppercase tracking-wider text-copy-secondary">{s.label}</dt>
                <dd className={`mt-1 font-display text-2xl font-bold tabular ${s.label === 'Failed' && s.value > 0 ? 'text-red-700' : 'text-copy-primary'}`}>{s.value}</dd>
              </div>
            ))}
          </dl>

          {result.failedCount > 0 && (
            <div className="space-y-2">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-xs font-bold uppercase tracking-wider text-red-700">Failed rows ({result.failedCount})</h3>
                <button type="button" onClick={downloadFailed} className="inline-flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-800 hover:bg-red-100">
                  <Download className="h-3.5 w-3.5" /> Download failed rows (CSV)
                </button>
              </div>
              <p className="text-[11px] text-copy-muted">Fix them in the downloaded file (it has an Error column) and upload it again.</p>
              <div className="max-h-72 overflow-auto rounded-xl border border-red-200 text-xs">
                <table className="w-full text-left">
                  <thead className="sticky top-0 bg-red-50 text-red-900">
                    <tr><th className="px-3 py-2">Row</th><th className="px-3 py-2">Reason</th></tr>
                  </thead>
                  <tbody className="divide-y divide-red-100">
                    {result.failedRows.map((f) => (
                      <tr key={f.row}><td className="px-3 py-2 font-mono font-bold">{f.row}</td><td className="px-3 py-2 text-red-800">{f.reason}</td></tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {result.warnings.length > 0 && (
            <details className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-xs text-amber-900">
              <summary className="cursor-pointer font-semibold">{result.warnings.length} note(s) on imported rows</summary>
              <ul className="mt-2 space-y-1">
                {result.warnings.slice(0, 200).map((w, i) => <li key={i}>Row {w.row}: {w.message}</li>)}
              </ul>
            </details>
          )}

          <div className="flex flex-wrap justify-between gap-2">
            <button type="button" onClick={reset} className="inline-flex items-center gap-1.5 rounded-xl px-4 py-2.5 text-xs font-semibold text-copy-secondary hover:bg-surface-muted">
              <UploadCloud className="h-3.5 w-3.5" /> Upload another file
            </button>
            <Link href="/admin/products" className="inline-flex items-center gap-1 rounded-xl bg-brand-600 px-4 py-2.5 text-xs font-bold text-white hover:bg-brand-700">
              View products <ArrowRight className="h-3.5 w-3.5" />
            </Link>
          </div>
        </div>
      )}
    </div>
  );
}
