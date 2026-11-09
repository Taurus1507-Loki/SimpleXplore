import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import { itemListJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: "Today's best deals & price drops in India",
  description:
    'The biggest discounts currently listed on SimpleXplore — products at 15% off or more from Amazon, Flipkart, Myntra and other Indian retailers, sorted by savings.',
  alternates: { canonical: '/deals' },
};

export default async function DealsPage() {
  const { products } = await db.getProducts({ status: 'published', isDeals: true, sort: 'discount' });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {products.length > 0 && <JsonLd data={itemListJsonLd('Latest deals', products)} />}
      <PageHeader
        crumbs={[{ name: 'Latest deals', path: '/deals' }]}
        eyebrow="Price drops"
        title="Latest deals"
        description="Products listed at 15% off or more, biggest savings first. Discounts are as listed by the retailer at the time we last checked."
        meta={products.length > 0 ? `${products.length} deals` : undefined}
      />
      <ProductGrid
        products={products}
        priorityCount={4}
        emptyMessage="No deals at 15% off or more right now. New finds are added regularly — check back soon."
      />
    </div>
  );
}
