'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import ImageUploadField from '@/components/admin/ImageUploadField';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { TelegramImport, Category, Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatters';
import { 
  CheckCircle2, 
  XCircle, 
  Sparkles, 
  ExternalLink, 
  AlertCircle,
  Eye,
  Trash2,
  Save,
  ArrowLeft
} from 'lucide-react';

interface ReviewClientProps {
  initialImport: TelegramImport;
  categories: Category[];
}

export default function ReviewClient({ initialImport, categories }: ReviewClientProps) {
  const router = useRouter();
  const [importItem, setImportItem] = useState(initialImport);
  const ext = importItem.extracted_data;
  // For an update to a live product, blanks fall back to the live values (never wiped by a partial edit).
  const live = ext.pending_update ? importItem.product : undefined;

  // Form states initialized with extracted data
  const [title, setTitle] = useState(ext.title || live?.title || '');
  const [price, setPrice] = useState<number>(ext.price || live?.current_price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(ext.original_price ?? live?.original_price ?? undefined);
  const [discount, setDiscount] = useState<number | undefined>(ext.discount ?? live?.discount ?? undefined);
  const [retailer, setRetailer] = useState(ext.retailer || live?.retailer || '');
  const [imageUrl, setImageUrl] = useState(ext.image_url || live?.image_url || '');
  const [categoryId, setCategoryId] = useState(live?.category_id || categories[0]?.id || '');
  const [description, setDescription] = useState(ext.description || live?.description || '');
  const [affiliateUrl, setAffiliateUrl] = useState(importItem.affiliate_url || importItem.original_url);
  const [isFeatured, setIsFeatured] = useState(live?.featured ?? false);
  const [isTrending, setIsTrending] = useState(live?.trending ?? false);

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  // Recalculate discount if original price and price are modified
  const handlePriceChange = (val: number) => {
    setPrice(val);
    if (originalPrice && originalPrice > val) {
      setDiscount(Math.round(((originalPrice - val) / originalPrice) * 100));
    }
  };

  const handleOriginalPriceChange = (val: number) => {
    setOriginalPrice(val);
    if (val > price && price > 0) {
      setDiscount(Math.round(((val - price) / val) * 100));
    }
  };

  // 1. Approve & Publish
  const handleApproveAndPublish = async () => {
    setLoading(true);
    setFeedback(null);

    try {
      const res = await fetch(`/api/admin/telegram/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importId: importItem.id,
          action: 'approve_and_publish',
          productData: {
            title,
            current_price: price,
            original_price: originalPrice,
            discount,
            retailer,
            image_url: imageUrl,
            category_id: categoryId,
            description,
            affiliate_url: affiliateUrl,
            featured: isFeatured,
            trending: isTrending,
          },
        }),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: 'Product successfully APPROVED and PUBLISHED to SimpleXplore! It is now live in the store.',
        });
        setImportItem(prev => ({ ...prev, review_status: 'approved' }));
        setTimeout(() => router.push('/admin/telegram/imports'), 2000);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to approve.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error publishing product.' });
    } finally {
      setLoading(false);
    }
  };

  // 2. Reject product
  const handleReject = async () => {
    if (!confirm('Are you sure you want to reject this imported draft?')) return;
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/telegram/review`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          importId: importItem.id,
          action: 'reject',
        }),
      });
      const data = await res.json();
      if (data.success) {
        setImportItem(prev => ({ ...prev, review_status: 'rejected' }));
        setFeedback({ type: 'success', message: 'Draft marked as rejected.' });
        setTimeout(() => router.push('/admin/telegram/imports'), 1500);
      }
    } finally {
      setLoading(false);
    }
  };

  const isApproved = importItem.review_status === 'approved';
  const isFailed = importItem.extraction_status === 'failed' && !importItem.product_id;
  const [retrying, setRetrying] = useState(false);

  /** Re-run extraction; on success reload so the form shows the newly extracted draft. */
  const handleRetry = async () => {
    setRetrying(true);
    setFeedback(null);
    try {
      const res = await fetch('/api/admin/telegram/retry', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ importId: importItem.id }),
      });
      const data = await res.json().catch(() => ({}));
      if (data.import) setImportItem((prev) => ({ ...prev, ...data.import }));
      if (res.ok && data.success) {
        setFeedback({ type: 'success', message: 'Retry worked — reloading with the extracted details…' });
        setTimeout(() => window.location.reload(), 900);
      } else {
        setFeedback({ type: 'error', message: `Retry failed: ${data.error || 'unknown error'}` });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error while retrying.' });
    } finally {
      setRetrying(false);
    }
  };

  return (
    <div className="space-y-8 max-w-7xl">
      {/* Top Bar with back link */}
      <div className="flex items-center justify-between">
        <Link
          href="/admin/telegram/imports"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Back to Pending Review Queue</span>
        </Link>

        <div className="flex items-center gap-2">
          <span className={`px-3 py-1 rounded-full text-xs font-bold ${
            isApproved
              ? 'bg-emerald-100 text-emerald-800'
              : 'bg-amber-100 text-amber-800'
          }`}>
            {isApproved ? 'Status: PUBLISHED' : 'Status: DRAFT (Pending Approval)'}
          </span>
        </div>
      </div>

      {isFailed && (
        <div className="rounded-2xl border border-red-200 bg-red-50 p-4 sm:p-5 space-y-3">
          <div className="flex items-start gap-2 text-sm text-red-900">
            <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-red-600" aria-hidden="true" />
            <div>
              <p className="font-semibold">We couldn&apos;t read this product automatically.</p>
              {importItem.error_message && <p className="mt-1 text-xs text-red-800">{importItem.error_message}</p>}
            </div>
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              type="button"
              onClick={handleRetry}
              disabled={retrying}
              className="inline-flex min-h-[40px] items-center gap-2 rounded-xl bg-brand-600 px-4 text-xs font-semibold text-white hover:bg-brand-700 disabled:opacity-60"
            >
              {retrying ? 'Retrying…' : 'Retry extraction'}
            </button>
            <Link
              href={`/admin/products/new?fromImport=${encodeURIComponent(importItem.id)}`}
              className="inline-flex min-h-[40px] items-center rounded-xl border border-red-200 bg-white px-4 text-xs font-semibold text-copy-primary hover:border-brand-300"
            >
              Create product manually
            </Link>
          </div>
          <p className="text-[11px] text-red-800/80">You can also fill in the form below and use Approve &amp; Publish.</p>
        </div>
      )}

      {importItem.extracted_data.pending_update && (
        <div className="rounded-2xl border border-sky-200 bg-sky-50 p-4 text-xs text-sky-900">
          <p className="font-semibold">This is an edit to a product that is already live.</p>
          <p className="mt-1">
            The live product has <strong>not</strong> been changed. The form below shows the new details from the edited
            Telegram post — Approve &amp; Publish applies them; Reject keeps the live product as it is.
          </p>
        </div>
      )}

      {!isFailed && (importItem.extracted_data.missing_fields?.length ?? 0) > 0 && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 p-4 text-xs text-amber-900">
          <p className="font-semibold">Fill in before publishing: {importItem.extracted_data.missing_fields!.join(', ')}</p>
          <p className="mt-1">We couldn&apos;t verify these from the retailer page, so they were left blank instead of guessed.</p>
        </div>
      )}

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

      {/* Main 2-column layout: Left = Telegram Source & Form, Right = Live Website Preview */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Left Form: 7 cols */}
        <div className="lg:col-span-7 space-y-6">
          {/* Telegram Source Message Box */}
          <div className="p-5 rounded-3xl bg-white border border-surface-border shadow-soft-sm space-y-3">
            <h3 className="text-xs uppercase tracking-wider font-bold text-copy-secondary">
              Original Telegram Post Source:
            </h3>
            {(ext.channel_name || ext.message_date) && (
              <p className="text-xs text-copy-secondary">
                {ext.channel_name && <>Channel: <strong className="text-copy-primary">{ext.channel_name}</strong></>}
                {ext.channel_name && ext.message_date && ' · '}
                {ext.message_date && <>Posted {new Date(ext.message_date).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}</>}
              </p>
            )}
            {ext.raw_message ? (
              <div className="p-3.5 rounded-2xl bg-[#F8FAF8] border border-surface-border text-xs text-copy-primary font-mono whitespace-pre-wrap">
                {ext.raw_message}
              </div>
            ) : null}
            <div className="text-xs text-copy-muted flex flex-wrap items-center gap-3">
              <span>Original Link:</span>
              <a
                href={importItem.original_url}
                target="_blank"
                rel="noreferrer"
                className="text-brand-600 font-medium hover:underline flex items-center gap-1 truncate max-w-sm"
              >
                <span>{importItem.original_url}</span>
                <ExternalLink className="w-3 h-3" />
              </a>
            </div>
          </div>

          {/* Extracted Product Edit Form */}
          <div className="p-6 sm:p-8 rounded-3xl bg-white border border-surface-border shadow-soft-sm space-y-5">
            <h2 className="text-lg font-bold font-display text-copy-primary">
              Review &amp; Edit Product Details
            </h2>

            <div className="space-y-4 text-xs sm:text-sm">
              <div>
                <label className="block font-semibold text-copy-primary mb-1">Product Title</label>
                <input
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-medium"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                <div>
                  <label className="block font-semibold text-copy-primary mb-1">Current Price (₹)</label>
                  <input
                    type="number"
                    value={price}
                    onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-bold"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-copy-primary mb-1">Original Price (₹)</label>
                  <input
                    type="number"
                    value={originalPrice || ''}
                    onChange={(e) => handleOriginalPriceChange(parseFloat(e.target.value) || 0)}
                    placeholder="MRP"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
                  />
                </div>

                <div>
                  <label className="block font-semibold text-copy-primary mb-1">Discount (%)</label>
                  <input
                    type="number"
                    value={discount || ''}
                    onChange={(e) => setDiscount(parseInt(e.target.value, 10) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block font-semibold text-copy-primary mb-1">Retailer</label>
                  <select
                    value={retailer}
                    onChange={(e) => setRetailer(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 bg-white"
                  >
                    <option value="Amazon India">Amazon India</option>
                    <option value="Flipkart">Flipkart</option>
                    <option value="Myntra">Myntra</option>
                    <option value="Nykaa">Nykaa</option>
                    <option value="Tata CLiQ">Tata CLiQ</option>
                    <option value="Ajio">Ajio</option>
                    <option value="Other">Other</option>
                  </select>
                </div>

                <div>
                  <label className="block font-semibold text-copy-primary mb-1">Category</label>
                  <select
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 bg-white"
                  >
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <ImageUploadField label="Product image" value={imageUrl} onChange={setImageUrl} required />


              <div>
                <label className="block font-semibold text-copy-primary mb-1">Affiliate Destination URL</label>
                <input
                  type="url"
                  value={affiliateUrl}
                  onChange={(e) => setAffiliateUrl(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>

              <div>
                <label className="block font-semibold text-copy-primary mb-1">Description</label>
                <textarea
                  rows={3}
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
                />
              </div>

              {/* Toggles */}
              <div className="flex items-center gap-6 pt-2">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isFeatured}
                    onChange={(e) => setIsFeatured(e.target.checked)}
                    className="w-4 h-4 rounded text-brand-600 focus:ring-brand-500"
                  />
                  <span className="font-semibold text-xs text-copy-primary">Mark as Featured</span>
                </label>

                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    checked={isTrending}
                    onChange={(e) => setIsTrending(e.target.checked)}
                    className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                  />
                  <span className="font-semibold text-xs text-copy-primary">Mark as Trending</span>
                </label>
              </div>
            </div>

            {/* Bottom Decision Actions */}
            <div className="pt-6 border-t border-surface-border flex flex-col sm:flex-row items-center gap-3">
              <button
                type="button"
                onClick={handleApproveAndPublish}
                disabled={loading}
                className="w-full sm:flex-1 inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold py-3.5 px-6 rounded-2xl shadow-md transition-all text-xs sm:text-sm"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>{loading ? 'Publishing...' : 'Approve & Publish to SimpleXplore'}</span>
              </button>

              <button
                type="button"
                onClick={handleReject}
                disabled={loading}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-4 py-3.5 rounded-2xl border border-surface-border hover:bg-rose-50 hover:text-rose-600 hover:border-rose-200 text-copy-secondary text-xs font-semibold transition-colors"
              >
                <XCircle className="w-4 h-4" />
                <span>Reject Draft</span>
              </button>
            </div>
          </div>
        </div>

        {/* Right: Live Interactive Card Preview (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="sticky top-20 space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="w-4 h-4 text-brand-600" />
              <h3 className="text-xs uppercase tracking-wider font-bold text-copy-primary">
                Live Public Product Preview
              </h3>
            </div>

            <p className="text-[11px] text-copy-secondary">
              This is the exact responsive Amazon-style card visitors will see once you approve:
            </p>

            {/* Card preview */}
            <div className="max-w-sm mx-auto bg-white rounded-2xl border border-surface-border shadow-soft-md overflow-hidden p-4 space-y-3">
              <div className="relative aspect-square w-full rounded-xl bg-[#F8FAF8] border border-surface-border overflow-hidden p-4 flex items-center justify-center">
                <Image
                  src={imageUrl || '/icon.svg'}
                  alt={title || 'Product preview'}
                  fill
                  sizes="300px"
                  className="object-contain"
                />
                {discount && discount > 0 ? (
                  <span className="absolute top-2 left-2 bg-brand-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm">
                    {discount}% OFF
                  </span>
                ) : null}
              </div>

              <div className="space-y-1">
                <div className="flex items-center justify-between text-[11px]">
                  <span className="bg-emerald-50 text-emerald-800 font-semibold px-2 py-0.5 rounded border border-emerald-200">
                    {retailer}
                  </span>
                  <span className="text-copy-muted">
                    {categories.find(c => c.id === categoryId)?.name || 'Department'}
                  </span>
                </div>

                <h4 className="font-bold text-xs text-copy-primary line-clamp-2 pt-1">
                  {title || 'Product Title preview'}
                </h4>
              </div>

              <div className="pt-2 border-t border-surface-border flex items-baseline gap-2">
                <span className="text-lg font-black text-copy-primary font-display">
                  {formatPrice(price, 'INR')}
                </span>
                {originalPrice && originalPrice > price && (
                  <span className="text-xs text-copy-muted line-through">
                    {formatPrice(originalPrice, 'INR')}
                  </span>
                )}
              </div>

              <div className="pt-1">
                <div className="w-full text-center text-xs font-bold py-2 bg-brand-500 text-white rounded-xl shadow-soft-sm flex items-center justify-center gap-1">
                  <span>Buy on {retailer}</span>
                  <ExternalLink className="w-3 h-3 opacity-90" />
                </div>
              </div>
            </div>

            <div className="p-4 rounded-2xl bg-[#EBF4EB] border border-brand-200/80 text-[11px] text-brand-900 leading-relaxed">
              <strong className="block font-bold mb-1">Safety Lock:</strong>
              This product is securely isolated as a draft in the database. It cannot be accessed through public search or catalogue APIs until you click &quot;Approve &amp; Publish&quot;.
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

