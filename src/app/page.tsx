import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import Hero from '@/components/Hero';
import CategoryBar from '@/components/CategoryBar';
import ProductGrid from '@/components/ProductGrid';
import { Flame, Percent, Sparkles, Clock, ArrowRight } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const categories = await db.getCategories();

  // Fetch sections in parallel
  const [featuredData, trendingData, dealsData, recentData] = await Promise.all([
    db.getProducts({ status: 'published', isFeatured: true, limit: 4 }),
    db.getProducts({ status: 'published', isTrending: true, limit: 4 }),
    db.getProducts({ status: 'published', isDeals: true, sort: 'discount', limit: 4 }),
    db.getProducts({ status: 'published', sort: 'newest', limit: 8 }),
  ]);

  return (
    <div className="space-y-12 pb-16">
      {/* 1. Hero Section */}
      <Hero />

      {/* 2. Visual Categories Bar */}
      <CategoryBar categories={categories} />

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-16">
        {/* 3. Latest Deals Section */}
        {dealsData.products.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-surface-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-amber-500/10 text-amber-600 flex items-center justify-center">
                  <Percent className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-copy-primary">
                    Latest Verified Deals
                  </h2>
                  <p className="text-xs text-copy-secondary">
                    Hand-screened bargains with major price drops today
                  </p>
                </div>
              </div>
              <Link
                href="/deals"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
              >
                <span>View All Deals</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <ProductGrid products={dealsData.products} />
          </section>
        )}

        {/* 4. Trending Products Section */}
        {trendingData.products.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-surface-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-rose-500/10 text-rose-600 flex items-center justify-center">
                  <Flame className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-copy-primary">
                    Trending Right Now
                  </h2>
                  <p className="text-xs text-copy-secondary">
                    Top trending electronics, fashion and lifestyle picks
                  </p>
                </div>
              </div>
              <Link
                href="/trending"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
              >
                <span>See What&apos;s Hot</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <ProductGrid products={trendingData.products} />
          </section>
        )}

        {/* 5. Featured Products */}
        {featuredData.products.length > 0 && (
          <section className="space-y-6">
            <div className="flex items-end justify-between border-b border-surface-border/80 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-purple-500/10 text-purple-600 flex items-center justify-center">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold font-display text-copy-primary">
                    Editor&apos;s Featured Picks
                  </h2>
                  <p className="text-xs text-copy-secondary">
                    Curated standout products known for exceptional quality and value
                  </p>
                </div>
              </div>
              <Link
                href="/products?featured=true"
                className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
              >
                <span>View More Featured</span>
                <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
              </Link>
            </div>
            <ProductGrid products={featuredData.products} />
          </section>
        )}

        {/* 6. Recently Added Products */}
        <section className="space-y-6">
          <div className="flex items-end justify-between border-b border-surface-border/80 pb-3">
            <div className="flex items-center gap-2.5">
              <div className="w-9 h-9 rounded-xl bg-brand-500/10 text-brand-600 flex items-center justify-center">
                <Clock className="w-5 h-5" />
              </div>
              <div>
                <h2 className="text-2xl font-bold font-display text-copy-primary">
                  Recently Discovered
                </h2>
                <p className="text-xs text-copy-secondary">
                  Fresh arrivals added to our shopping catalog
                </p>
              </div>
            </div>
            <Link
              href="/products"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700 flex items-center gap-1 group"
            >
              <span>Explore All Products</span>
              <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-0.5 transition-transform" />
            </Link>
          </div>
          <ProductGrid products={recentData.products} />
        </section>
      </div>
    </div>
  );
}

