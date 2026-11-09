import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import { Send, ArrowRight } from 'lucide-react';
import ImportsClient from './ImportsClient';

interface TelegramImportsPageProps {
  searchParams: Promise<{
    status?: string;
  }>;
}

export const dynamic = 'force-dynamic';

export default async function TelegramImportsPage(props: TelegramImportsPageProps) {
  const searchParams = await props.searchParams;
  const statusFilter = searchParams.status || 'pending';
  const [allImports, postsReceived, queue] = await Promise.all([
    db.getTelegramImports(),
    db.getTelegramPostCount(),
    db.getTelegramQueueStats(),
  ]);
  // Every link found in a post gets its own import record, so records = links detected.
  const linksDetected = allImports.length;
  const importedOk = allImports.filter(i => i.extraction_status !== 'failed').length;

  // Summary counts
  const totalReceived = allImports.length;
  const pendingCount = allImports.filter(i => i.review_status === 'pending').length;
  const approvedCount = allImports.filter(i => i.review_status === 'approved').length;
  const rejectedCount = allImports.filter(i => i.review_status === 'rejected').length;
  const failedCount = allImports.filter(i => i.extraction_status === 'failed').length;
  const duplicateCount = allImports.filter(i => i.extracted_data?.is_duplicate).length;

  const filteredImports = allImports.filter(i => {
    if (statusFilter === 'all') return true;
    if (statusFilter === 'failed') return i.extraction_status === 'failed';
    if (statusFilter === 'duplicates') return !!i.extracted_data?.is_duplicate;
    return i.review_status === statusFilter;
  });

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
            <Send className="w-7 h-7 text-brand-600" />
            Telegram Imports &amp; Staging Review
          </h1>
          <p className="text-xs text-copy-secondary mt-1">
            Review scraped affiliate product drafts before publishing them to the public shopping grid
          </p>
        </div>

        <Link
          href="/admin/telegram"
          className="inline-flex items-center gap-1.5 bg-brand-50 hover:bg-brand-100 text-brand-700 text-xs font-semibold px-4 py-2 rounded-xl border border-brand-200 transition-colors"
        >
          <span>Webhook &amp; Test Simulator</span>
          <ArrowRight className="w-3.5 h-3.5" />
        </Link>
      </div>

      {/* Pipeline totals */}
      <dl className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        {[
          { label: 'Telegram posts received', value: postsReceived, note: queue.pending > 0 ? `${queue.pending} still processing` : 'All processed' },
          { label: 'Links detected', value: linksDetected, note: 'One draft per product link' },
          { label: 'Imported successfully', value: importedOk, note: `${linksDetected - importedOk} could not be read` },
        ].map(stat => (
          <div key={stat.label} className="rounded-2xl border border-surface-border bg-white p-4">
            <dt className="text-[11px] font-semibold uppercase tracking-wider text-copy-secondary">{stat.label}</dt>
            <dd className="mt-1 font-display text-2xl font-bold text-copy-primary tabular">{stat.value}</dd>
            <dd className="text-[11px] text-copy-muted">{stat.note}</dd>
          </div>
        ))}
      </dl>

      {/* Stats Quick Badges & Required Filters */}
      <div className="grid grid-cols-2 sm:grid-cols-6 gap-3">
        <Link
          href="/admin/telegram/imports?status=all"
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            statusFilter === 'all' ? 'bg-copy-primary text-white border-copy-primary' : 'bg-white text-copy-primary border-surface-border hover:bg-surface-bg'
          }`}
        >
          <div className="text-xl font-bold font-display">{totalReceived}</div>
          <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">All Imports</div>
        </Link>

        <Link
          href="/admin/telegram/imports?status=pending"
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            statusFilter === 'pending' ? 'bg-amber-500 text-white border-amber-500' : 'bg-white text-copy-primary border-surface-border hover:bg-surface-bg'
          }`}
        >
          <div className="text-xl font-bold font-display">{pendingCount}</div>
          <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">Pending Review</div>
        </Link>

        <Link
          href="/admin/telegram/imports?status=approved"
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            statusFilter === 'approved' ? 'bg-brand-500 text-white border-brand-500' : 'bg-white text-copy-primary border-surface-border hover:bg-surface-bg'
          }`}
        >
          <div className="text-xl font-bold font-display">{approvedCount}</div>
          <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">Published</div>
        </Link>

        <Link
          href="/admin/telegram/imports?status=duplicates"
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            statusFilter === 'duplicates' ? 'bg-orange-600 text-white border-orange-600' : 'bg-white text-copy-primary border-surface-border hover:bg-surface-bg'
          }`}
        >
          <div className="text-xl font-bold font-display">{duplicateCount}</div>
          <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">Duplicates</div>
        </Link>

        <Link
          href="/admin/telegram/imports?status=rejected"
          className={`p-3.5 rounded-2xl border text-center transition-all ${
            statusFilter === 'rejected' ? 'bg-zinc-700 text-white border-zinc-700' : 'bg-white text-copy-primary border-surface-border hover:bg-surface-bg'
          }`}
        >
          <div className="text-xl font-bold font-display">{rejectedCount}</div>
          <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">Rejected</div>
        </Link>

        <Link
          href="/admin/telegram/imports?status=failed"
          className={`p-3.5 rounded-2xl border text-center transition-all col-span-2 sm:col-span-1 ${
            statusFilter === 'failed' ? 'bg-rose-500 text-white border-rose-500' : 'bg-white text-copy-primary border-surface-border hover:bg-surface-bg'
          }`}
        >
          <div className="text-xl font-bold font-display">{failedCount}</div>
          <div className="text-[11px] opacity-80 uppercase tracking-wider font-semibold">Failed</div>
        </Link>
      </div>

      {/* Main Review Client with Checkbox selection and Bulk Actions */}
      <ImportsClient initialImports={filteredImports} statusFilter={statusFilter} />
    </div>
  );
}
