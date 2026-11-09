'use client';

import React from 'react';
import Link from 'next/link';
import { useWishlist } from '@/components/WishlistContext';
import ProductCard from '@/components/ProductCard';
import { Heart, ArrowRight } from 'lucide-react';

export default function WishlistPage() {
  const { wishlistProducts } = useWishlist();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="flex items-center gap-3 border-b border-surface-border pb-4">
        <div className="w-10 h-10 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center">
          <Heart className="w-5 h-5 fill-rose-500" />
        </div>
        <div>
          <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary">
            My Saved Wishlist
          </h1>
          <p className="text-xs text-copy-secondary">
            {wishlistProducts.length} saved product{wishlistProducts.length === 1 ? '' : 's'} to monitor for price drops
          </p>
        </div>
      </div>

      {wishlistProducts.length === 0 ? (
        <div className="py-20 text-center bg-white rounded-3xl border border-surface-border p-8 max-w-lg mx-auto space-y-4">
          <div className="w-16 h-16 rounded-full bg-rose-50 text-rose-500 mx-auto flex items-center justify-center">
            <Heart className="w-8 h-8" />
          </div>
          <h3 className="text-lg font-bold text-copy-primary">Your wishlist is currently empty</h3>
          <p className="text-xs text-copy-secondary">
            Explore our curated selection of verified affiliate deals and tap the heart icon on any product to save it here.
          </p>
          <div className="pt-2">
            <Link
              href="/products"
              className="inline-flex items-center gap-2 bg-brand-500 hover:bg-brand-600 text-white text-xs font-semibold px-6 py-3 rounded-full transition-all shadow-sm"
            >
              <span>Explore Top Deals</span>
              <ArrowRight className="w-4 h-4" />
            </Link>
          </div>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
          {wishlistProducts.map(p => (
            <ProductCard key={p.id} product={p} />
          ))}
        </div>
      )}
    </div>
  );
}

