import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import { itemListJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Trending products in India right now',
  description:
    'Popular products shoppers are checking out this week — fashion, electronics, beauty and home finds, handpicked by the SimpleXplore team.',
  alternates: { canonical: '/trending' },
};

export default async function TrendingPage() {
  const { products } = await db.getProducts({ status: 'published', isTrending: true, sort: 'newest' });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {products.length > 0 && <JsonLd data={itemListJsonLd('Trending products', products)} />}
      <PageHeader
        crumbs={[{ name: 'Trending', path: '/trending' }]}
        eyebrow="Popular this week"
        title="Trending right now"
        description="Products our team has flagged as popular with shoppers across India."
        meta={products.length > 0 ? `${products.length} products` : undefined}
      />
      <ProductGrid products={products} priorityCount={4} emptyMessage="No trending products listed right now." />
    </div>
  );
}
