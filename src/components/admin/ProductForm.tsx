'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { Product, Category, ProductAvailability } from '@/types';
import { formatPrice } from '@/lib/utils/formatters';
import { Save, Globe, Eye, CheckCircle2, AlertCircle, UploadCloud, Plus, Trash2, Star, Image as ImageIcon } from 'lucide-react';

interface ProductFormProps {
  initialProduct?: Product;
  categories: Category[];
  /** Pre-fill a NEW product (e.g. from a failed Telegram import). */
  prefill?: Partial<Product>;
  /** When set, the created product is linked back to this Telegram import. */
  sourceImportId?: string;
}

export default function ProductForm({ initialProduct, categories, prefill, sourceImportId }: ProductFormProps) {
  const router = useRouter();
  const seed: Partial<Product> | undefined = initialProduct ?? prefill;

  const [title, setTitle] = useState(seed?.title || '');
  const [slug, setSlug] = useState(initialProduct?.slug || '');
  const [currentPrice, setCurrentPrice] = useState<number>(seed?.current_price || 0);
  const [originalPrice, setOriginalPrice] = useState<number | undefined>(seed?.original_price || undefined);
  const [currency, setCurrency] = useState(seed?.currency || 'INR');
  const [discount, setDiscount] = useState<number | undefined>(seed?.discount || undefined);
  const [retailer, setRetailer] = useState(seed?.retailer || 'Amazon India');
  const [availability, setAvailability] = useState<ProductAvailability | ''>(seed?.availability ?? '');
  const [categoryId, setCategoryId] = useState(seed?.category_id || categories[0]?.id || '');
  const [imageUrl, setImageUrl] = useState(seed?.image_url || '');
  const [additionalImages, setAdditionalImages] = useState<string[]>(
    (initialProduct?.images || [])
      .map(img => img.image_url)
      .filter(url => url && url !== initialProduct?.image_url)
  );
  const [urlInput, setUrlInput] = useState('');
  const [affiliateUrl, setAffiliateUrl] = useState(seed?.affiliate_url || '');
  const [description, setDescription] = useState(seed?.description || '');
  const [highlightsText, setHighlightsText] = useState((seed?.highlights || []).join('\n'));
  const [rating, setRating] = useState<number>(seed?.rating ?? 0);
  const [reviewCount, setReviewCount] = useState<number>(seed?.review_count ?? 0);
  const [featured, setFeatured] = useState(initialProduct?.featured || false);
  const [trending, setTrending] = useState(initialProduct?.trending || false);
  const [status, setStatus] = useState<'draft' | 'published'>(initialProduct?.status === 'published' ? 'published' : 'draft');
  const [seoTitle, setSeoTitle] = useState(initialProduct?.seo_title || '');
  const [seoDescription, setSeoDescription] = useState(initialProduct?.seo_description || '');

  const [loading, setLoading] = useState(false);
  const [feedback, setFeedback] = useState<{ type: 'success' | 'error'; message: string } | null>(null);

  const handleAddUrl = () => {
    if (!urlInput.trim()) return;
    const cleanUrl = urlInput.trim();
    if (!imageUrl) {
      setImageUrl(cleanUrl);
    } else if (!additionalImages.includes(cleanUrl) && cleanUrl !== imageUrl) {
      setAdditionalImages(prev => [...prev, cleanUrl]);
    }
    setUrlInput('');
  };

  const handleRemoveAdditionalImage = (index: number) => {
    setAdditionalImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleSetPrimary = (index: number) => {
    const selected = additionalImages[index];
    const oldPrimary = imageUrl;
    setImageUrl(selected);
    setAdditionalImages(prev => {
      const next = [...prev];
      if (oldPrimary) {
        next[index] = oldPrimary;
      } else {
        next.splice(index, 1);
      }
      return next;
    });
  };

  const [uploading, setUploading] = useState(0);
  const [uploadError, setUploadError] = useState<string | null>(null);

  /** Uploads to /api/admin/upload (Supabase Storage in live mode) and stores the returned URL. */
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files ?? []);
    e.target.value = '';
    if (files.length === 0) return;
    setUploadError(null);
    setUploading((n) => n + files.length);

    for (const file of files) {
      try {
        if (file.size > 5 * 1024 * 1024) throw new Error(`${file.name} is larger than 5 MB.`);
        const form = new FormData();
        form.append('file', file);
        form.append('folder', 'products');
        const res = await fetch('/api/admin/upload', { method: 'POST', body: form });
        const data = await res.json().catch(() => ({}));
        if (!res.ok || !data.url) throw new Error(data.error || `Could not upload ${file.name}.`);
        const url: string = data.url;
        setImageUrl((curr) => {
          if (!curr) return url;
          setAdditionalImages((prev) => (prev.includes(url) ? prev : [...prev, url]));
          return curr;
        });
      } catch (err) {
        setUploadError(err instanceof Error ? err.message : 'Upload failed.');
      } finally {
        setUploading((n) => n - 1);
      }
    }
  };

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
    if (!title.trim() || currentPrice <= 0 || !affiliateUrl.trim() || !imageUrl.trim()) {
      setFeedback({ type: 'error', message: 'Title, current price, affiliate URL and a product image are required.' });
      return;
    }
    if (uploading > 0) {
      setFeedback({ type: 'error', message: 'Please wait for image uploads to finish.' });
      return;
    }

    setLoading(true);
    setFeedback(null);

    const highlights = highlightsText
      .split('\n')
      .map(h => h.trim())
      .filter(h => h.length > 0);

    const allImagesFormatted = [
      ...(imageUrl.trim() ? [{ id: `img-primary-${Date.now()}`, product_id: initialProduct?.id || '', image_url: imageUrl.trim(), sort_order: 0 }] : []),
      ...additionalImages.map((img, idx) => ({
        id: `img-add-${Date.now()}-${idx}`,
        product_id: initialProduct?.id || '',
        image_url: img.trim(),
        sort_order: idx + 1,
      })),
    ];

    const payload = {
      id: initialProduct?.id,
      title: title.trim(),
      slug: slug.trim() || undefined,
      current_price: currentPrice,
      original_price: originalPrice,
      currency,
      discount,
      retailer,
      availability: availability || null,
      category_id: categoryId,
      image_url: imageUrl.trim(),
      images: allImagesFormatted,
      affiliate_url: affiliateUrl.trim(),
      description: description.trim() || null,
      highlights,
      // 0 means "unknown" — never shown on the storefront or in structured data.
      rating: rating > 0 ? rating : null,
      review_count: reviewCount > 0 ? reviewCount : null,
      source_import_id: sourceImportId,
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
                <label htmlFor="pf-availability" className="block font-semibold text-copy-primary mb-1">Availability</label>
                <select
                  id="pf-availability"
                  value={availability}
                  onChange={(e) => setAvailability(e.target.value as ProductAvailability | '')}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 bg-white"
                >
                  <option value="">Unknown (not shown)</option>
                  <option value="in_stock">In stock</option>
                  <option value="limited">Limited stock</option>
                  <option value="out_of_stock">Out of stock</option>
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

            {/* Multi-Image Upload & Management */}
            <div className="space-y-3 pt-1">
              <div className="flex items-center justify-between">
                <div>
                  <label className="block font-semibold text-copy-primary">
                    Product Showcase Images
                  </label>
                  <p className="text-[11px] text-copy-secondary">
                    Add multiple photos from your device or online URLs. The primary photo is displayed on store cards.
                  </p>
                </div>
                <span className="text-xs font-bold text-brand-700 bg-brand-50 px-2.5 py-1 rounded-full border border-brand-200">
                  {1 + additionalImages.length} Image{1 + additionalImages.length === 1 ? '' : 's'}
                </span>
              </div>

              {/* Upload & Add URL controls */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 p-3.5 bg-surface-bg rounded-2xl border border-surface-border">
                {/* File Upload Button */}
                <div>
                  <label className="block text-[11px] font-bold text-copy-primary uppercase mb-1">
                    Upload from Computer
                  </label>
                  <label className="flex items-center justify-center gap-2 px-3 py-2 bg-white hover:bg-brand-50 border border-dashed border-brand-300 hover:border-brand-500 rounded-xl cursor-pointer text-xs font-semibold text-brand-700 transition-colors shadow-soft-sm">
                    <UploadCloud className="w-4 h-4 text-brand-600" />
                    <span>{uploading > 0 ? `Uploading ${uploading}…` : 'Choose Multiple Images'}</span>
                    <input
                      type="file"
                      multiple
                      accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                      onChange={handleFileUpload}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Direct Image URL input */}
                <div>
                  <label className="block text-[11px] font-bold text-copy-primary uppercase mb-1">
                    Or Add Image URL
                  </label>
                  <div className="flex gap-2">
                    <input
                      type="url"
                      value={urlInput}
                      onChange={(e) => setUrlInput(e.target.value)}
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          handleAddUrl();
                        }
                      }}
                      placeholder="https://images.unsplash.com/..."
                      className="flex-1 px-3 py-1.5 text-xs rounded-xl border border-surface-border focus:outline-none focus:border-brand-500 font-mono bg-white"
                    />
                    <button
                      type="button"
                      onClick={handleAddUrl}
                      className="px-3 py-1.5 bg-brand-500 hover:bg-brand-600 text-white rounded-xl text-xs font-semibold flex items-center gap-1 shadow-sm transition-all"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      <span>Add</span>
                    </button>
                  </div>
                </div>
              </div>

              {uploadError && (
                <p role="alert" className="text-xs font-medium text-red-700">
                  {uploadError}
                </p>
              )}

              {/* Visual Gallery Preview Grid */}
              <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 pt-2">
                {/* Primary Image Card */}
                {imageUrl && (
                  <div className="relative group rounded-2xl border-2 border-brand-500 bg-white p-2 flex flex-col items-center justify-between shadow-soft-sm">
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F3F5F3]">
                      <Image
                        src={imageUrl}
                        alt="Primary product photo"
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="w-full mt-2 flex items-center justify-between text-[10px]">
                      <span className="bg-brand-500 text-white font-bold px-2 py-0.5 rounded-full flex items-center gap-1">
                        <Star className="w-2.5 h-2.5 fill-white" /> Primary
                      </span>
                    </div>
                  </div>
                )}

                {/* Additional Images Cards */}
                {additionalImages.map((img, idx) => (
                  <div
                    key={idx}
                    className="relative group rounded-2xl border border-surface-border hover:border-brand-300 bg-white p-2 flex flex-col items-center justify-between transition-all"
                  >
                    <div className="relative w-full aspect-square rounded-xl overflow-hidden bg-[#F3F5F3]">
                      <Image
                        src={img}
                        alt={`Product image ${idx + 2}`}
                        fill
                        className="object-contain p-1"
                      />
                    </div>
                    <div className="w-full mt-2 flex items-center justify-between text-[10px]">
                      <button
                        type="button"
                        onClick={() => handleSetPrimary(idx)}
                        className="text-brand-700 hover:underline font-semibold"
                        title="Set as main display image"
                      >
                        Set Primary
                      </button>
                      <button
                        type="button"
                        onClick={() => handleRemoveAdditionalImage(idx)}
                        className="text-rose-600 hover:text-rose-800 p-1"
                        title="Remove image"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
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

