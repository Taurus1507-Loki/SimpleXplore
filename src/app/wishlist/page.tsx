'use client';

import React from 'react';
import Link from 'next/link';
import { Heart, Cloud, Smartphone } from 'lucide-react';
import { useWishlist } from '@/components/WishlistContext';
import ProductCard from '@/components/ProductCard';

export default function WishlistPage() {
  const { wishlistProducts, syncedToAccount, loading } = useWishlist();
  const count = wishlistProducts.length;

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <header className="flex flex-col gap-4 border-b border-surface-border pb-6 sm:flex-row sm:items-end sm:justify-between">
        <div>
          <p className="mb-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">Saved for later</p>
          <h1 className="font-display text-3xl font-bold tracking-tight text-ink sm:text-[2.75rem] sm:leading-[1.08]">
            My wishlist
          </h1>
          <p className="mt-2 text-sm text-copy-secondary">
            {loading ? 'Loading…' : `${count} saved ${count === 1 ? 'product' : 'products'}`}
          </p>
        </div>

        {!loading && (
          <p
            className={`inline-flex items-center gap-2 self-start rounded-xl px-3 py-2 text-xs font-medium sm:self-auto ${
              syncedToAccount ? 'bg-brand-50 text-brand-800' : 'bg-surface-muted text-copy-secondary'
            }`}
          >
            {syncedToAccount ? (
              <>
                <Cloud className="h-4 w-4" aria-hidden="true" /> Saved to your account — available on any device
              </>
            ) : (
              <>
                <Smartphone className="h-4 w-4" aria-hidden="true" /> Saved on this device only.{' '}
                <Link href="/login" className="font-semibold text-brand-700 underline underline-offset-4">
                  Sign in
                </Link>{' '}
                to keep it everywhere.
              </>
            )}
          </p>
        )}
      </header>

      {!loading && count === 0 ? (
        <div className="mx-auto max-w-lg rounded-3xl border border-surface-border bg-white px-8 py-16 text-center">
          <Heart className="mx-auto h-8 w-8 text-brand-600" aria-hidden="true" />
          <h2 className="mt-4 font-display text-xl font-semibold text-ink">Your wishlist is empty</h2>
          <p className="mt-2 text-sm text-copy-secondary">Tap the heart on any product to save it here.</p>
          <Link
            href="/products"
            className="mt-6 inline-flex min-h-[44px] items-center rounded-xl bg-brand-600 px-6 text-sm font-semibold text-white hover:bg-brand-700"
          >
            Browse products
          </Link>
        </div>
      ) : (
        <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
          {wishlistProducts.map((p) => (
            <li key={p.id}>
              <ProductCard product={p} />
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
