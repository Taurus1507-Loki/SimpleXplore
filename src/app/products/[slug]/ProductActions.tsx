'use client';

import React, { useState } from 'react';
import { Product } from '@/types';
import { useWishlist } from '@/components/WishlistContext';
import { Heart, Share2, ExternalLink, Check } from 'lucide-react';

interface ProductActionsProps {
  product: Product;
}

export default function ProductActions({ product }: ProductActionsProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const [copied, setCopied] = useState(false);

  const handleShare = async () => {
    if (typeof navigator !== 'undefined' && navigator.share) {
      try {
        await navigator.share({
          title: product.title,
          text: `Check out this deal on SimpleXplore: ${product.title}`,
          url: window.location.href,
        });
        return;
      } catch {
        // Fallback to clipboard
      }
    }

    if (typeof navigator !== 'undefined' && navigator.clipboard) {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    }
  };

  return (
    <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
      {/* Primary Affiliate Redirect CTA */}
      <a
        href={`/r/${product.id}`}
        target="_blank"
        rel="nofollow sponsored noopener"
        className="flex-1 inline-flex min-h-[52px] items-center justify-center gap-2 bg-brand-600 hover:bg-brand-700 active:scale-[0.98] text-white font-semibold text-base py-3.5 px-6 rounded-2xl shadow-soft-md transition-all"
      >
        <span>Buy on {product.retailer}</span>
        <span className="sr-only">(opens in new tab)</span>
        <ExternalLink className="w-4 h-4 opacity-90" />
      </a>

      {/* Wishlist Button */}
      <button
        type="button"
        onClick={() => toggleWishlist(product)}
        aria-pressed={wishlisted}
        className={`inline-flex items-center justify-center gap-2 py-3.5 px-5 rounded-2xl border text-xs font-semibold transition-all ${
          wishlisted
            ? 'bg-red-50 border-red-200 text-red-700'
            : 'bg-white border-surface-border text-copy-primary hover:bg-surface-bg hover:border-brand-300'
        }`}
      >
        <Heart className={`w-4 h-4 ${wishlisted ? 'fill-red-600 text-red-600' : 'text-copy-secondary'}`} />
        <span>{wishlisted ? 'Saved in Wishlist' : 'Add to Wishlist'}</span>
      </button>

      {/* Share Button */}
      <button
        type="button"
        onClick={handleShare}
        className="inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-2xl border border-surface-border bg-white text-copy-secondary hover:bg-surface-bg hover:text-copy-primary text-xs font-medium transition-all"
        aria-label="Share this product"
      >
        {copied ? (
          <>
            <Check className="w-4 h-4 text-brand-600" />
            <span className="text-brand-600">Copied!</span>
          </>
        ) : (
          <>
            <Share2 className="w-4 h-4" />
            <span className="hidden sm:inline">Share</span>
          </>
        )}
      </button>
    </div>
  );
}

