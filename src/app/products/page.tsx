import React from 'react';
import type { Metadata } from 'next';
import { db } from '@/lib/db';
import ProductCatalogClient from '@/components/ProductCatalogClient';
import PageHeader from '@/components/PageHeader';

interface ProductsPageProps {
  searchParams: {
    category?: string;
    retailer?: string;
    search?: string;
    sort?: 'newest' | 'price_low' | 'price_high' | 'discount' | 'rating';
    featured?: string;
  };
}

export const dynamic = 'force-dynamic';

export async function generateMetadata({ searchParams }: ProductsPageProps): Promise<Metadata> {
  const filtered = Boolean(
    searchParams.search || searchParams.category || searchParams.retailer || searchParams.sort || searchParams.featured
  );
  const title = searchParams.search ? `Search results for “${searchParams.search}”` : 'All products & deals';
  return {
    title,
    description:
      'Browse every product on SimpleXplore — filter by category, retailer, price and discount to find the best deal from top Indian stores.',
    // Filtered/search URLs consolidate to the main catalog and stay out of the index.
    alternates: { canonical: '/products' },
    robots: filtered ? { index: false, follow: true } : undefined,
  };
}

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const [categories, { products }] = await Promise.all([
    db.getCategories(),
    db.getProducts({ status: 'published' }),
  ]);

  const { category: categorySlug, retailer, search } = searchParams;
  const activeCategory = categorySlug ? categories.find((c) => c.slug === categorySlug) : null;
  const title = activeCategory ? activeCategory.name : search ? `Results for “${search}”` : 'All products';

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader
        crumbs={[{ name: 'Products', path: '/products' }]}
        eyebrow="Catalog"
        title={title}
        description="Handpicked products from India's leading online stores. Filter by category, retailer, price or discount."
      />

      {/* Keyed so a new header search or category link resets the client-side filters. */}
      <ProductCatalogClient
        key={`${search ?? ''}|${categorySlug ?? ''}|${retailer ?? ''}`}
        initialProducts={products}
        categories={categories}
        initialCategorySlug={categorySlug}
        initialRetailer={retailer}
        initialSearch={search}
      />
    </div>
  );
}
