import React from 'react';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductForm from '@/components/admin/ProductForm';
import { ArrowLeft, PlusCircle } from 'lucide-react';

export const revalidate = 0;

export default async function NewProductPage() {
  const categories = await db.getCategories();

  return (
    <div className="space-y-6 max-w-6xl">
      <div className="flex items-center gap-3">
        <Link
          href="/admin/products"
          className="p-2 rounded-xl bg-white border border-surface-border text-copy-secondary hover:text-copy-primary hover:bg-surface-bg transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
        </Link>
        <div>
          <h1 className="text-2xl font-black font-display text-copy-primary flex items-center gap-2">
            <PlusCircle className="w-6 h-6 text-brand-600" />
            Add New Affiliate Product
          </h1>
          <p className="text-xs text-copy-secondary">
            Manually enter a product, configure prices, discount, and affiliate URL
          </p>
        </div>
      </div>

      <ProductForm categories={categories} />
    </div>
  );
}

