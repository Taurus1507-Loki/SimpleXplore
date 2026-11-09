import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductCatalogClient from '@/components/ProductCatalogClient';

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

export default async function ProductsPage({ searchParams }: ProductsPageProps) {
  const categories = await db.getCategories();
  const categorySlug = searchParams.category;
  const retailer = searchParams.retailer;
  const search = searchParams.search;

  // Retrieve published products
  const { products } = await db.getProducts({
    status: 'published',
  });

  const activeCategory = categorySlug ? categories.find(c => c.slug === categorySlug) : null;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
      {/* Breadcrumbs */}
      <div className="text-xs text-copy-muted flex items-center gap-1.5">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <span className="text-copy-primary font-medium">
          {activeCategory ? activeCategory.name : search ? `Search: "${search}"` : 'All Products'}
        </span>
      </div>

      {/* Page Title */}
      <div>
        <h1 className="text-3xl font-extrabold font-display text-copy-primary">
          {activeCategory ? activeCategory.name : search ? `Search Results for "${search}"` : 'Explore Products & Verified Deals'}
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Hand-screened discounts and top deals across India&apos;s leading online stores
        </p>
      </div>

      {/* Interactive Catalog Client with dynamic filters & price slider */}
      <ProductCatalogClient
        initialProducts={products}
        categories={categories}
        initialCategorySlug={categorySlug}
        initialRetailer={retailer}
        initialSearch={search}
      />
    </div>
  );
}
