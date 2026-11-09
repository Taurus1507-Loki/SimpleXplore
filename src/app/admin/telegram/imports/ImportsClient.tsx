'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { TelegramImport } from '@/types';
import { formatPrice, formatDate } from '@/lib/utils/formatters';
import { 
  CheckCircle2, 
  XCircle, 
  Clock, 
  AlertTriangle, 
  ExternalLink, 
  Eye, 
  CheckSquare, 
  Square, 
  ShieldCheck,
  AlertCircle,
  RotateCcw,
  PenLine,
  Loader2
} from 'lucide-react';

interface ImportsClientProps {
  initialImports: TelegramImport[];
  statusFilter: string;
}

export default function ImportsClient({ initialImports, statusFilter }: ImportsClientProps) {
  const router = useRouter();
  const [imports, setImports] = useState<TelegramImport[]>(initialImports);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [showConfirmModal, setShowConfirmModal] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);
  const [retrying, setRetrying] = useState<string | null>(null);

  /** Re-run extraction for a failed import. Success creates a DRAFT — nothing is published. */
  const handleRetry = async (id: string) => {
    setRetrying(id);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/telegram/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importId: id }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.import) setImports(prev => prev.map(i => (i.id === id ? { ...i, ...data.import } : i)));
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Retry worked — a new draft is ready for review.' });
      } else {
        setFeedback({ type: 'error', message: `Retry failed: ${data.error || 'unknown error'}. You can create the product manually instead.` });
      }
      router.refresh();
    } catch {
      setFeedback({ type: 'error', message: 'Network error while retrying.' });
    } finally {
      setRetrying(null);
    }
  };

  // Toggle single item selection
  const toggleSelect = (id: string) => {
    setSelectedIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  // Toggle select all visible pending items
  const toggleSelectAll = () => {
    const pendingIds = imports.filter(i => i.review_status === 'pending' && i.extraction_status !== 'failed').map(i => i.id);
    if (selectedIds.length === pendingIds.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(pendingIds);
    }
  };

  // Bulk Approval with confirmation
  const handleBulkApprove = async () => {
    if (selectedIds.length === 0) return;
    setLoading(true);
    setFeedback(null);
    setShowConfirmModal(false);

    try {
      const res = await fetch('/api/admin/telegram/bulk-approve', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importIds: selectedIds }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Successfully approved and published ${data.count} selected product draft(s) to SimpleXplore!`,
        });
        setSelectedIds([]);
        router.refresh();
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to bulk approve.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error performing bulk approval.' });
    } finally {
      setLoading(false);
    }
  };

  const pendingImports = imports.filter(i => i.review_status === 'pending');

  return (
    <div className="space-y-5">
      {feedback && (
        <div className={`p-4 rounded-2xl text-xs font-semibold flex items-center gap-2 ${
          feedback.type === 'success'
            ? 'bg-emerald-50 border border-emerald-200 text-emerald-900'
            : 'bg-rose-50 border border-rose-200 text-rose-900'
        }`}>
          {feedback.type === 'success' ? <CheckCircle2 className="w-4 h-4 text-emerald-600" /> : <AlertCircle className="w-4 h-4 text-rose-600" />}
          <span>{feedback.message}</span>
        </div>
      )}

      {/* Bulk Action Toolbar (Active only when drafts are available) */}
      {pendingImports.length > 0 && statusFilter === 'pending' && (
        <div className="bg-white p-4 rounded-2xl border border-surface-border shadow-soft-sm flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 text-xs">
          <div className="flex items-center gap-3">
            <button
              type="button"
              onClick={toggleSelectAll}
              className="flex items-center gap-1.5 font-semibold text-copy-primary hover:text-brand-600 transition-colors"
            >
              {selectedIds.length > 0 && selectedIds.length === pendingImports.length ? (
                <CheckSquare className="w-4 h-4 text-brand-600" />
              ) : (
                <Square className="w-4 h-4 text-copy-muted" />
              )}
              <span>Select All Pending ({pendingImports.length})</span>
            </button>

            {selectedIds.length > 0 && (
              <span className="text-brand-700 font-bold bg-brand-50 px-2.5 py-0.5 rounded-full border border-brand-200">
                {selectedIds.length} draft(s) selected
              </span>
            )}
          </div>

          {selectedIds.length > 0 && (
            <button
              type="button"
              onClick={() => setShowConfirmModal(true)}
              disabled={loading}
              className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 text-white font-bold px-4 py-2 rounded-xl shadow-soft-sm transition-all"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>Approve Selected ({selectedIds.length})</span>
            </button>
          )}
        </div>
      )}

      {/* Confirmation Modal */}
      {showConfirmModal && (
        <div className="fixed inset-0 z-50 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-surface-border space-y-4 animate-in zoom-in-95">
            <div className="w-12 h-12 rounded-2xl bg-brand-50 text-brand-600 flex items-center justify-center">
              <ShieldCheck className="w-6 h-6" />
            </div>

            <div className="space-y-2">
              <h3 className="text-lg font-bold text-copy-primary">
                Confirm Bulk Approval
              </h3>
              <p className="text-xs text-copy-secondary leading-relaxed">
                You are about to approve and publish <strong>{selectedIds.length}</strong> product draft(s). Once approved, these products will become immediately visible to shoppers on SimpleXplore.
              </p>
            </div>

            <div className="flex items-center justify-end gap-2 pt-2 border-t border-surface-border">
              <button
                type="button"
                onClick={() => setShowConfirmModal(false)}
                className="px-4 py-2.5 rounded-xl border border-surface-border text-xs font-semibold text-copy-secondary hover:bg-surface-bg transition-colors"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={handleBulkApprove}
                disabled={loading}
                className="px-5 py-2.5 rounded-xl bg-brand-500 hover:bg-brand-600 text-white text-xs font-bold shadow-soft-sm transition-all"
              >
                {loading ? 'Publishing...' : 'Yes, Approve & Publish'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Imports List */}
      <div className="space-y-4">
        {imports.length === 0 ? (
          <div className="bg-white rounded-3xl border border-surface-border p-12 text-center text-xs text-copy-secondary space-y-3">
            <Clock className="w-10 h-10 text-copy-muted mx-auto" />
            <h3 className="font-bold text-copy-primary text-base">No imports in this tab</h3>
            <p className="max-w-md mx-auto">
              All Telegram affiliate link drafts matching this status have been handled.
            </p>
          </div>
        ) : (
          imports.map((item) => {
            const isApproved = item.review_status === 'approved';
            const isRejected = item.review_status === 'rejected';
            const isFailed = item.extraction_status === 'failed';
            const isPending = item.review_status === 'pending';
            const isDuplicate = item.extracted_data?.is_duplicate;
            const isSelected = selectedIds.includes(item.id);

            return (
              <div
                key={item.id}
                className={`bg-white rounded-2xl sm:rounded-3xl border shadow-soft-sm p-5 sm:p-6 flex flex-col md:flex-row items-start md:items-center justify-between gap-6 transition-all ${
                  isSelected ? 'border-brand-500 bg-brand-50/20' : 'border-surface-border hover:border-brand-300'
                }`}
              >
                <div className="flex items-start gap-4 flex-1 min-w-0">
                  {/* Selection Checkbox for Pending drafts */}
                  {isPending && !isFailed && (
                    <button
                      type="button"
                      aria-label={isSelected ? 'Deselect' : 'Select for bulk approval'}
                      aria-pressed={isSelected}
                      onClick={() => toggleSelect(item.id)}
                      className="mt-1 text-copy-secondary hover:text-brand-600 transition-colors"
                    >
                      {isSelected ? (
                        <CheckSquare className="w-5 h-5 text-brand-600" />
                      ) : (
                        <Square className="w-5 h-5 text-copy-muted" />
                      )}
                    </button>
                  )}

                  {/* Thumbnail */}
                  <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#F8FAF8] border border-surface-border overflow-hidden flex-shrink-0 p-2">
                    {item.extracted_data.image_url ? (
                      <Image
                        src={item.extracted_data.image_url}
                        alt={item.extracted_data.title || 'Product'}
                        fill
                        sizes="96px"
                        className="object-contain"
                      />
                    ) : (
                      <span className="flex h-full w-full items-center justify-center text-center text-[10px] text-copy-muted">No image</span>
                    )}
                  </div>

                  <div className="space-y-1.5 flex-1 min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="px-2 py-0.5 rounded-md text-[11px] font-semibold bg-emerald-50 text-emerald-800 border border-emerald-200">
                        {item.extracted_data.retailer || 'Retailer'}
                      </span>

                      {item.extracted_data.discount ? (
                        <span className="px-2 py-0.5 rounded-md text-[11px] font-bold bg-brand-50 text-brand-700">
                          {item.extracted_data.discount}% OFF
                        </span>
                      ) : null}

                      {item.extracted_data.pending_update && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-sky-50 text-sky-800 border border-sky-200">
                          Update to a live product
                        </span>
                      )}

                      {!isFailed && (item.extracted_data.missing_fields?.length ?? 0) > 0 && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-50 text-amber-800 border border-amber-200">
                          Needs: {item.extracted_data.missing_fields!.join(', ')}
                        </span>
                      )}

                      {isDuplicate && (
                        <span className="px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-300 flex items-center gap-1">
                          <AlertTriangle className="w-3 h-3 text-amber-700" />
                          Potential Duplicate
                        </span>
                      )}

                      <span className={`px-2 py-0.5 rounded-full text-[10px] font-bold ${
                        isApproved
                          ? 'bg-emerald-100 text-emerald-800'
                          : isRejected
                          ? 'bg-zinc-100 text-zinc-700'
                          : isFailed
                          ? 'bg-rose-100 text-rose-800'
                          : 'bg-amber-100 text-amber-800'
                      }`}>
                        {isApproved ? 'PUBLISHED' : isRejected ? 'REJECTED' : isFailed ? 'FAILED' : 'DRAFT (Pending Review)'}
                      </span>
                    </div>

                    <h3 className="font-bold text-sm sm:text-base text-copy-primary truncate">
                      {item.extracted_data.title || 'Extracted Product Draft'}
                    </h3>

                    {isFailed && item.error_message && (
                      <p className="text-xs text-red-800 bg-red-50 border border-red-200 px-2 py-1 rounded-md line-clamp-2">
                        {item.error_message}
                      </p>
                    )}

                    {item.extracted_data.raw_message && (
                      <p className="text-xs text-copy-secondary line-clamp-1 italic bg-[#F8FAF8] px-2 py-1 rounded-md border border-surface-border/50">
                        &ldquo;{item.extracted_data.raw_message}&rdquo;
                      </p>
                    )}

                    <div className="flex items-center gap-4 text-xs text-copy-muted pt-1">
                      <span>Imported: {formatDate(item.created_at)}</span>
                      <span>•</span>
                      <a
                        href={item.original_url}
                        target="_blank"
                        rel="noreferrer"
                        className="text-brand-600 hover:underline flex items-center gap-1 truncate max-w-xs"
                      >
                        <span>Affiliate Link</span>
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                  </div>
                </div>

                <div className="flex md:flex-col items-center md:items-end justify-between w-full md:w-auto border-t md:border-t-0 pt-3 md:pt-0 border-surface-border">
                  <div className="text-left md:text-right mb-2">
                    <div className="text-xl font-black text-copy-primary font-display">
                      {formatPrice(item.extracted_data.price || 0, 'INR')}
                    </div>
                    {item.extracted_data.original_price && item.extracted_data.original_price > (item.extracted_data.price || 0) && (
                      <div className="text-xs text-copy-muted line-through">
                        {formatPrice(item.extracted_data.original_price, 'INR')}
                      </div>
                    )}
                  </div>

                  {isFailed && !item.product_id ? (
                    <div className="flex flex-wrap gap-2 md:justify-end">
                      <button
                        type="button"
                        onClick={() => handleRetry(item.id)}
                        disabled={retrying !== null}
                        className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 disabled:opacity-60 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-soft-sm transition-all"
                      >
                        {retrying === item.id ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <RotateCcw className="w-3.5 h-3.5" />}
                        <span>{retrying === item.id ? 'Retrying…' : 'Retry'}</span>
                      </button>
                      <Link
                        href={`/admin/products/new?fromImport=${encodeURIComponent(item.id)}`}
                        className="inline-flex items-center gap-1.5 bg-white border border-surface-border hover:border-brand-300 text-copy-primary font-semibold text-xs px-4 py-2.5 rounded-xl transition-all"
                      >
                        <PenLine className="w-3.5 h-3.5" />
                        <span>Create manually</span>
                      </Link>
                    </div>
                  ) : (
                    <Link
                      href={`/admin/telegram/imports/${item.id}`}
                      className="inline-flex items-center gap-1.5 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-semibold text-xs px-4 py-2.5 rounded-xl shadow-soft-sm transition-all"
                    >
                      <Eye className="w-3.5 h-3.5" />
                      <span>Review &amp; Approve</span>
                    </Link>
                  )}
                </div>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}

