import React from 'react';
import { db } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import { Flame } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function TrendingPage() {
  const { products } = await db.getProducts({
    status: 'published',
    isTrending: true,
    sort: 'newest',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-rose-500/10 via-brand-50 to-amber-50/50 p-6 sm:p-8 rounded-3xl border border-rose-200/60">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-rose-600 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            <Flame className="w-3.5 h-3.5" />
            <span>Trending Products</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-copy-primary">
            Popular & Viral Shopping Finds
          </h1>
          <p className="text-sm text-copy-secondary">
            The most clicked, saved, and highly rated products currently trending in India.
          </p>
        </div>
      </div>

      <ProductGrid 
        products={products} 
        emptyMessage="No trending products listed right now." 
      />
    </div>
  );
}

