import React from 'react';
import { db } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import { Percent, Sparkles } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function DealsPage() {
  const { products } = await db.getProducts({
    status: 'published',
    isDeals: true,
    sort: 'discount',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div className="bg-gradient-to-r from-amber-500/10 via-brand-50 to-emerald-50/50 p-6 sm:p-8 rounded-3xl border border-amber-200/60">
        <div className="max-w-2xl space-y-2">
          <div className="inline-flex items-center gap-1.5 bg-amber-500 text-white text-xs font-bold px-3 py-1 rounded-full shadow-sm">
            <Percent className="w-3.5 h-3.5" />
            <span>Highest Verified Discounts</span>
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-copy-primary">
            Today&apos;s Hottest Deals & Price Drops
          </h1>
          <p className="text-sm text-copy-secondary">
            Products with at least 15% to 50%+ verified discounts across Amazon India, Flipkart, Myntra and Tata CLiQ.
          </p>
        </div>
      </div>

      <ProductGrid 
        products={products} 
        emptyMessage="No deals currently live above 15% off. Check back shortly as Telegram imports are reviewed!" 
      />
    </div>
  );
}

