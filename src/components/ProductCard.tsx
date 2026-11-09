'use client';

import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatters';
import { Star, Heart, ExternalLink, Sparkles, TrendingUp } from 'lucide-react';
import { useWishlist } from './WishlistContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}

export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);

  const retailerColorClass: Record<string, string> = {
    'Amazon India': 'bg-amber-50 text-amber-800 border-amber-200/80',
    'Flipkart': 'bg-blue-50 text-blue-800 border-blue-200/80',
    'Myntra': 'bg-rose-50 text-rose-800 border-rose-200/80',
    'Nykaa': 'bg-pink-50 text-pink-800 border-pink-200/80',
    'Tata CLiQ': 'bg-purple-50 text-purple-800 border-purple-200/80',
    'Tata CLiQ Luxury': 'bg-zinc-100 text-zinc-900 border-zinc-300',
  };

  const badgeColor = retailerColorClass[product.retailer] || 'bg-emerald-50 text-emerald-800 border-emerald-200';

  return (
    <div className="group relative flex flex-col bg-white rounded-2xl border border-surface-border overflow-hidden hover:shadow-card-hover hover:border-brand-300/80 transition-all duration-300 ease-out">
      {/* Top Badges (Trending / Featured / Discount) */}
      <div className="absolute top-3 left-3 z-10 flex flex-wrap gap-1.5 pointer-events-none">
        {product.discount && product.discount > 0 ? (
          <span className="bg-brand-500 text-white text-[11px] font-bold px-2.5 py-0.5 rounded-full shadow-sm tracking-tight">
            {product.discount}% OFF
          </span>
        ) : null}

        {product.trending && (
          <span className="bg-amber-500 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <TrendingUp className="w-3 h-3" />
            Trending
          </span>
        )}

        {product.featured && (
          <span className="bg-purple-600 text-white text-[10px] font-bold px-2 py-0.5 rounded-full shadow-sm flex items-center gap-1">
            <Sparkles className="w-3 h-3" />
            Featured
          </span>
        )}
      </div>

      {/* Wishlist Button (Heart) */}
      <button
        type="button"
        onClick={(e) => {
          e.preventDefault();
          e.stopPropagation();
          toggleWishlist(product);
        }}
        className={`absolute top-3 right-3 z-10 w-8 h-8 rounded-full flex items-center justify-center transition-all duration-200 ${
          wishlisted
            ? 'bg-rose-50 text-rose-500 shadow-sm'
            : 'bg-white/90 backdrop-blur-sm text-copy-muted hover:text-rose-500 hover:bg-white shadow-soft-sm'
        }`}
        aria-label={wishlisted ? 'Remove from wishlist' : 'Save to wishlist'}
      >
        <Heart className={`w-4 h-4 transition-transform active:scale-125 ${wishlisted ? 'fill-rose-500' : ''}`} />
      </button>

      {/* Product Image */}
      <Link href={`/products/${product.slug}`} className="relative w-full pt-[90%] overflow-hidden bg-[#FBFDFB]">
        <Image
          src={product.image_url || 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=800'}
          alt={product.title}
          fill
          priority={priority}
          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw"
          className="object-contain p-4 group-hover:scale-105 transition-transform duration-300 ease-out"
        />
      </Link>

      {/* Content Area */}
      <div className="flex flex-col flex-1 p-4 justify-between">
        <div className="space-y-2">
          {/* Retailer & Category Tag */}
          <div className="flex items-center justify-between text-[11px] text-copy-secondary">
            <span className={`px-2 py-0.5 rounded-md font-medium border ${badgeColor}`}>
              {product.retailer}
            </span>
            {product.category && (
              <span className="text-copy-muted truncate max-w-[110px]">
                {product.category.name}
              </span>
            )}
          </div>

          {/* Product Title */}
          <Link href={`/products/${product.slug}`}>
            <h3 className="font-semibold text-sm text-copy-primary line-clamp-2 group-hover:text-brand-600 transition-colors leading-snug">
              {product.title}
            </h3>
          </Link>

          {/* Ratings & Reviews */}
          {product.rating ? (
            <div className="flex items-center gap-1.5 text-xs text-copy-secondary">
              <div className="flex items-center gap-1 bg-amber-50 text-amber-700 px-1.5 py-0.5 rounded font-semibold text-[11px]">
                <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                <span>{product.rating.toFixed(1)}</span>
              </div>
              {product.review_count ? (
                <span className="text-copy-muted text-[11px]">
                  ({product.review_count.toLocaleString('en-IN')})
                </span>
              ) : null}
            </div>
          ) : (
            <div className="h-5" /> // Alignment spacer
          )}
        </div>

        {/* Pricing & CTA */}
        <div className="pt-3 border-t border-surface-border/60 mt-3 space-y-2.5">
          <div className="flex items-baseline gap-2">
            <span className="text-lg font-bold text-copy-primary font-display">
              {formatPrice(product.current_price, product.currency)}
            </span>
            {product.original_price && product.original_price > product.current_price && (
              <span className="text-xs text-copy-muted line-through">
                {formatPrice(product.original_price, product.currency)}
              </span>
            )}
          </div>

          {/* Affiliate Direct CTA */}
          <div className="flex items-center gap-2">
            <Link
              href={`/products/${product.slug}`}
              className="flex-1 text-center text-xs font-semibold py-2 px-3 rounded-xl border border-surface-border text-copy-primary hover:bg-surface-bg hover:border-brand-400 transition-colors"
            >
              View Details
            </Link>
            <a
              href={`/r/${product.id}`}
              target="_blank"
              rel="nofollow sponsored noopener"
              className="flex-1 inline-flex items-center justify-center gap-1 text-center text-xs font-semibold py-2 px-3 rounded-xl bg-brand-500 hover:bg-brand-600 active:scale-[0.98] text-white shadow-soft-sm transition-all"
            >
              <span>Buy Now</span>
              <ExternalLink className="w-3 h-3 opacity-80" />
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}

