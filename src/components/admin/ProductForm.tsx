'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Category } from '@/types';
import { formatPrice } from '@/lib/utils/formatters';
import { Save, Globe, Eye, CheckCircle2, AlertCircle } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product;
  categories: Category[];
}

export default function ProductForm({ initialProduct, categories }: ProductFormProps) {
  const router = useRouter();

  const [title, setTitle] = useState(initialProduct?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [currentPrice, setCurrentPrice] = useState<number>(initialProduct?.current_price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(initialProduct?.original_price || undefined);
  const [currency, setCurrency] = useState(initialProduct?.currency || 'INR');
  const [discount, setDiscount] = useState<number | undefined>(initialProduct?.discount || undefined);
  const [retailer, setRetailer] = useState(initialProduct?.retailer || 'Amazon India');
  const [categoryId, setCategoryId] = useState(initialProduct?.category_id || categories[0]?.id || 'cat-electronics');
  const [imageUrl, setImageUrl] = useState(initialProduct?.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800');
  const [affiliateUrl, setAffiliateUrl] = useState(initialProduct?.affiliate_url || '');
  const [description, setDescription] = useState(initialProduct?.description || '');
  const [highlightsText, setHighlightsText] = useState((initialProduct?.highlights || []).join('\n'));
  const [rating, setRating] = useState<number>(initialProduct?.rating || 4.5);
  const [reviewCount, setReviewCount] = useState<number>(initialProduct?.review_count || 100);
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [trending, setTrending] = useState(initialProduct?.trending || false);
  const [status, setStatus] = useState<'draft' | 'published'>(initialProduct?.status === 'published' ? 'published' : 'draft');
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seo_description || '');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handlePriceChange = (val: number) => {
    setCurrentPrice(val);
    if (originalPrice && originalPrice > val) {
      setDiscount(Math.round(((originalPrice - val) / originalPrice) * 100));
    }
  };

  const handleOriginalPriceChange = (val: number) => {
    setOriginalPrice(val);
    if (val > currentPrice && currentPrice > 0) {
      setDiscount(Math.round(((val - currentPrice) / val) * 100));
    }
  };

  const handleSubmit = async (submitStatus: 'draft' | 'published') => {
    if (!title.trim() || currentPrice <= 0 || !affiliateUrl.trim()) {
      setFeedback({ type: 'error', message: 'Title, Current Price, and Affiliate URL are required.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const highlights = highlightsText
      .split('\n')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    const payload = {
      id: initialProduct?.id,
      title: title.trim(),
      slug: slug.trim() || undefined,
      current_price: currentPrice,
      original_price: originalPrice,
      currency,
      discount,
      retailer,
      category_id: categoryId,
      image_url: imageUrl.trim(),
      affiliate_url: affiliateUrl.trim(),
      description: description.trim() || null,
      highlights,
      rating,
      review_count: reviewCount,
      featured,
      trending,
      status: submitStatus,
      seo_title: seoTitle.trim() || null,
      seo_description: seoDescription.trim() || null,
    };

    try {
      const url = '/api/admin/products';
      const method = initialProduct ? 'PATCH' : 'POST';
      const res = await fetch(url, {
        method,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload),
      });

      const data = await res.json();
      if (data.success) {
        setFeedback({
          type: 'success',
          message: `Product successfully ${submitStatus === 'published' ? 'published to store!' : 'saved as draft.'}`,
        });
        setTimeout(() => router.push('/admin/products'), 1500);
      } else {
        setFeedback({ type: 'error', message: data.error || 'Failed to save product.' });
      }
    } catch {
      setFeedback({ type: 'error', message: 'Network error saving product.' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
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

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Form fields (8 cols) */}
        <div className="lg:col-span-8 space-y-6">
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-5 text-xs sm:text-sm">
            <h2 className="text-base font-bold font-display text-copy-primary">
              Basic Product Information
            </h2>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Product Title *</label>
              <input
                type="text"
                required
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="e.g. Sony WH-1000XM5 Wireless Headphones"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-medium"
              />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-copy-primary mb-1">Custom Slug (optional)</label>
                <input
                  type="text"
                  value={slug}
                  onChange={(e) => setSlug(e.target.value)}
                  placeholder="auto-generated-from-title"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
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

            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div>
                <label className="block font-semibold text-copy-primary mb-1">Current Price *</label>
                <input
                  type="number"
                  required
                  value={currentPrice || ''}
                  onChange={(e) => handlePriceChange(parseFloat(e.target.value) || 0)}
                  placeholder="₹ 1499"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-bold"
                />
              </div>

              <div>
                <label className="block font-semibold text-copy-primary mb-1">Original Price (MRP)</label>
                <input
                  type="number"
                  value={originalPrice || ''}
                  onChange={(e) => handleOriginalPriceChange(parseFloat(e.target.value) || 0)}
                  placeholder="₹ 2499"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
                />
              </div>

              <div>
                <label className="block font-semibold text-copy-primary mb-1">Currency Code</label>
                <select
                  value={currency}
                  onChange={(e) => setCurrency(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 bg-white font-semibold"
                >
                  <option value="INR">INR (₹ Indian Rupee)</option>
                  <option value="USD">USD ($ US Dollar)</option>
                  <option value="GBP">GBP (£ British Pound)</option>
                  <option value="EUR">EUR (€ Euro)</option>
                </select>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-semibold text-copy-primary mb-1">Retailer Platform</label>
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
                  <option value="Tata CLiQ Luxury">Tata CLiQ Luxury</option>
                  <option value="Ajio">Ajio</option>
                  <option value="Other">Other</option>
                </select>
              </div>

              <div>
                <label className="block font-semibold text-copy-primary mb-1">Affiliate Destination URL *</label>
                <input
                  type="url"
                  required
                  value={affiliateUrl}
                  onChange={(e) => setAffiliateUrl(e.target.value)}
                  placeholder="https://www.amazon.in/dp/...?tag=yourtag"
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
                />
              </div>
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Product Image URL</label>
              <input
                type="url"
                value={imageUrl}
                onChange={(e) => setImageUrl(e.target.value)}
                placeholder="https://..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono text-xs"
              />
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Product Description</label>
              <textarea
                rows={3}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                placeholder="Write summary description..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">
                Product Key Highlights (one per line)
              </label>
              <textarea
                rows={3}
                value={highlightsText}
                onChange={(e) => setHighlightsText(e.target.value)}
                placeholder="Up to 30-hour battery life&#10;Industry-leading ANC&#10;Multipoint connection"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>

          {/* SEO Metadata Box */}
          <div className="bg-white p-6 sm:p-8 rounded-3xl border border-surface-border shadow-soft-sm space-y-4 text-xs sm:text-sm">
            <h3 className="text-base font-bold font-display text-copy-primary">
              Search Engine Optimization (SEO)
            </h3>
            <div>
              <label className="block font-semibold text-copy-primary mb-1">Custom SEO Title</label>
              <input
                type="text"
                value={seoTitle}
                onChange={(e) => setSeoTitle(e.target.value)}
                placeholder="e.g. Best Sony WH-1000XM5 Deal in India - SimpleXplore"
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
              />
            </div>

            <div>
              <label className="block font-semibold text-copy-primary mb-1">Custom Meta Description</label>
              <textarea
                rows={2}
                value={seoDescription}
                onChange={(e) => setSeoDescription(e.target.value)}
                placeholder="Short Google snippet..."
                className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500"
              />
            </div>
          </div>
        </div>

        {/* Right sidebar options (4 cols) */}
        <div className="lg:col-span-4 space-y-6">
          <div className="bg-white p-6 rounded-3xl border border-surface-border shadow-soft-sm space-y-4">
            <h3 className="text-sm font-bold uppercase tracking-wider text-copy-secondary">
              Publishing Options
            </h3>

            <div className="space-y-3 pt-2">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={featured}
                  onChange={(e) => setFeatured(e.target.checked)}
                  className="w-4 h-4 rounded text-purple-600 focus:ring-purple-500"
                />
                <span className="font-semibold text-xs text-copy-primary">Featured Product</span>
              </label>

              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={trending}
                  onChange={(e) => setTrending(e.target.checked)}
                  className="w-4 h-4 rounded text-amber-600 focus:ring-amber-500"
                />
                <span className="font-semibold text-xs text-copy-primary">Trending Deal</span>
              </label>
            </div>

            <div className="pt-4 border-t border-surface-border space-y-2">
              <button
                type="button"
                onClick={() => handleSubmit('published')}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-brand-500 hover:bg-brand-600 active:scale-95 text-white font-bold py-3 px-4 rounded-xl text-xs shadow-soft-sm transition-all"
              >
                <Globe className="w-4 h-4" />
                <span>Publish to Public Website</span>
              </button>

              <button
                type="button"
                onClick={() => handleSubmit('draft')}
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 bg-white hover:bg-surface-bg border border-surface-border text-copy-primary font-semibold py-3 px-4 rounded-xl text-xs transition-colors"
              >
                <Save className="w-4 h-4 text-copy-secondary" />
                <span>Save as Unpublished Draft</span>
              </button>
            </div>
          </div>

          {/* Image preview */}
          {imageUrl && (
            <div className="bg-white p-4 rounded-3xl border border-surface-border shadow-soft-sm space-y-2">
              <span className="text-[11px] font-bold text-copy-secondary uppercase">Image Preview</span>
              <div className="relative aspect-square w-full rounded-2xl bg-[#F8FAF8] border border-surface-border overflow-hidden p-4 flex items-center justify-center">
                <Image
                  src={imageUrl}
                  alt="Preview"
                  fill
                  sizes="240px"
                  className="object-contain p-2"
                />
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

