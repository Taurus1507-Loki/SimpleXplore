import React from 'react';
import Link from 'next/link';
import { PackageSearch } from 'lucide-react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
  /** Mark the first N images as LCP candidates. */
  priorityCount?: number;
}

export default function ProductGrid({
  products,
  emptyMessage = 'No products found matching your criteria.',
  priorityCount = 0,
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="rounded-2xl border border-dashed border-surface-border bg-white px-6 py-16 text-center">
        <PackageSearch className="mx-auto h-8 w-8 text-brand-600" aria-hidden="true" />
        <p className="mt-3 font-display text-lg font-semibold text-ink">Nothing here yet</p>
        <p className="mx-auto mt-1 max-w-md text-sm text-copy-secondary">{emptyMessage}</p>
        <Link
          href="/products"
          className="mt-5 inline-flex min-h-[44px] items-center rounded-xl bg-ink px-5 text-sm font-semibold text-white hover:bg-brand-700"
        >
          Browse all products
        </Link>
      </div>
    );
  }

  return (
    <ul className="grid grid-cols-2 gap-3 sm:gap-5 md:grid-cols-3 lg:grid-cols-4">
      {products.map((product, idx) => (
        <li key={product.id}>
          <ProductCard product={product} priority={idx < priorityCount} />
        </li>
      ))}
    </ul>
  );
}
