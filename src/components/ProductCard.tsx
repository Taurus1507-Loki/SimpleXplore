'use client';

import React from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { motion, AnimatePresence } from 'framer-motion';
import { Star, Heart, ExternalLink, TrendingUp, ImageOff } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatters';
import { useWishlist } from './WishlistContext';

interface ProductCardProps {
  product: Product;
  priority?: boolean;
}


export default function ProductCard({ product, priority = false }: ProductCardProps) {
  const { isInWishlist, toggleWishlist } = useWishlist();
  const wishlisted = isInWishlist(product.id);
  const href = `/products/${product.slug}`;
  const hasPrice = product.current_price > 0;
  const hasDiscount = !!product.discount && product.discount > 0;
  const showOriginal = hasPrice && !!product.original_price && product.original_price > product.current_price;

  return (
    <motion.article
      whileHover={{ y: -2 }}
      transition={{ type: 'spring', stiffness: 400, damping: 30 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl border border-surface-border bg-white transition-[border-color,box-shadow] duration-300 hover:border-brand-200 hover:shadow-card-hover"
    >
      {/* Image */}
      <Link href={href} className="relative block aspect-square overflow-hidden bg-surface-muted/60" tabIndex={-1} aria-hidden="true">
        {product.image_url ? (
          <Image
            src={product.image_url}
            alt=""
            fill
            priority={priority}
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
            className="object-contain p-3 mix-blend-multiply transition-transform duration-500 ease-out-expo group-hover:scale-[1.03] sm:p-5"
          />
        ) : (
          <span className="flex h-full w-full flex-col items-center justify-center gap-1 text-copy-muted">
            <ImageOff className="h-6 w-6" aria-hidden="true" />
            <span className="text-[11px]">No image</span>
          </span>
        )}
      </Link>

      {/* Badges */}
      <div className="pointer-events-none absolute left-2.5 top-2.5 flex flex-col items-start gap-1 sm:left-3 sm:top-3">
        {hasDiscount && (
          <span className="tabular rounded-md bg-accent-400 px-2 py-0.5 text-[11px] font-bold text-ink">
            {product.discount}% off
          </span>
        )}
        {product.trending && (
          <span className="inline-flex items-center gap-1 rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-brand-800 shadow-soft-sm">
            <TrendingUp className="h-3 w-3" aria-hidden="true" /> Trending
          </span>
        )}
        {product.availability === 'out_of_stock' && (
          <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-red-700 shadow-soft-sm">Out of stock</span>
        )}
        {product.availability === 'limited' && (
          <span className="rounded-md bg-white/95 px-1.5 py-0.5 text-[10px] font-semibold text-accent-700 shadow-soft-sm">Limited stock</span>
        )}
        {product.featured && !product.trending && (
          <span className="rounded-md bg-ink px-1.5 py-0.5 text-[10px] font-semibold text-white">Featured</span>
        )}
      </div>

      {/* Wishlist */}
      <motion.button
        type="button"
        whileTap={{ scale: 0.85 }}
        onClick={(e) => {
          e.preventDefault();
          toggleWishlist(product);
        }}
        aria-pressed={wishlisted}
        aria-label={wishlisted ? `Remove ${product.title} from wishlist` : `Save ${product.title} to wishlist`}
        className={`absolute right-1.5 top-1.5 z-10 flex h-11 w-11 items-center justify-center rounded-full transition-colors sm:right-2 sm:top-2 ${
          wishlisted ? 'text-red-600' : 'text-copy-muted hover:text-red-600'
        }`}
      >
        <span className="flex h-8 w-8 items-center justify-center rounded-full bg-white/95 shadow-soft-sm">
          <AnimatePresence mode="wait" initial={false}>
            <motion.span
              key={wishlisted ? 'on' : 'off'}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.5, opacity: 0 }}
              transition={{ type: 'spring', stiffness: 600, damping: 20 }}
            >
              <Heart className={`h-4 w-4 ${wishlisted ? 'fill-current' : ''}`} aria-hidden="true" />
            </motion.span>
          </AnimatePresence>
        </span>
      </motion.button>

      {/* Body */}
      <div className="flex flex-1 flex-col gap-2 p-3 sm:p-4">
        <div className="flex items-center justify-between gap-2 text-[11px] text-copy-muted">
          <span className="truncate font-semibold uppercase tracking-wide text-copy-secondary">{product.retailer}</span>
          {product.category && <span className="hidden truncate sm:inline">{product.category.name}</span>}
        </div>

        <h3 className="line-clamp-2 text-[0.8125rem] font-semibold leading-snug text-ink sm:text-sm">
          <Link href={href} className="after:absolute after:inset-0 after:content-[''] focus-visible:outline-none group-focus-within:underline">
            {product.title}
          </Link>
        </h3>

        {product.rating ? (
          <div className="flex items-center gap-1 text-xs text-copy-secondary">
            <Star className="h-3.5 w-3.5 fill-accent-400 text-accent-400" aria-hidden="true" />
            <span className="tabular font-semibold text-copy-primary">{product.rating.toFixed(1)}</span>
            {product.review_count ? (
              <span className="tabular text-copy-muted">({product.review_count.toLocaleString('en-IN')})</span>
            ) : null}
            <span className="sr-only">out of 5 stars</span>
          </div>
        ) : null}

        <div className="mt-auto flex items-end justify-between gap-2 pt-2">
          <div className="min-w-0">
            {hasPrice ? (
              <p className="flex flex-wrap items-baseline gap-x-1.5">
                <span className="tabular font-display text-lg font-bold tracking-tight text-ink">
                  {formatPrice(product.current_price, product.currency)}
                </span>
                {showOriginal && (
                  <span className="tabular text-xs text-copy-muted line-through">
                    <span className="sr-only">Was </span>
                    {formatPrice(product.original_price!, product.currency)}
                  </span>
                )}
              </p>
            ) : (
              <p className="text-xs font-medium text-copy-secondary">Check price at {product.retailer}</p>
            )}
          </div>

          {/* Direct-to-retailer shortcut; sits above the stretched card link. */}
          <a
            href={`/r/${product.id}`}
            target="_blank"
            rel="nofollow sponsored noopener"
            aria-label={`Buy ${product.title} on ${product.retailer} (opens in new tab)`}
            className="relative z-10 inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-brand-600 text-white shadow-soft-sm transition-colors hover:bg-brand-700 active:scale-95 sm:w-auto sm:gap-1.5 sm:px-3"
          >
            <span className="hidden text-xs font-semibold sm:inline">Buy</span>
            <ExternalLink className="h-4 w-4 sm:h-3.5 sm:w-3.5" aria-hidden="true" />
          </a>
        </div>
      </div>
    </motion.article>
  );
}
