import React from 'react';
import { Product } from '@/types';
import ProductCard from './ProductCard';

interface ProductGridProps {
  products: Product[];
  emptyMessage?: string;
}

export default function ProductGrid({
  products,
  emptyMessage = 'No products found matching your criteria.',
}: ProductGridProps) {
  if (!products || products.length === 0) {
    return (
      <div className="py-16 text-center border-2 border-dashed border-surface-border rounded-2xl bg-white p-8">
        <div className="w-12 h-12 rounded-full bg-brand-50 text-brand-600 mx-auto flex items-center justify-center font-bold text-lg mb-3">
          🔍
        </div>
        <h4 className="text-base font-semibold text-copy-primary">No products available</h4>
        <p className="text-sm text-copy-secondary max-w-md mx-auto mt-1">
          {emptyMessage}
        </p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
      {products.map((product, idx) => (
        <ProductCard key={product.id} product={product} priority={idx < 4} />
      ))}
    </div>
  );
}

