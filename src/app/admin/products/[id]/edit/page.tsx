import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductForm from '@/components/admin/ProductForm';
import { ArrowLeft, Edit } from 'lucide-react';

interface EditProductPageProps {
  params: Promise<{
    id: string;
  }>;
}

export const revalidate = 0;

export default async function EditProductPage(props: EditProductPageProps) {
  const params = await props.params;
  const [product, categories] = await Promise.all([
    db.getProductById(params.id),
    db.getCategories(),
  ]);

  if (!product) {
    notFound();
  }

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
            <Edit className="w-6 h-6 text-brand-600" />
            Edit Product: {product.title}
          </h1>
          <p className="text-xs text-copy-secondary">
            Update pricing, affiliate tracking link, or publication status
          </p>
        </div>
      </div>

      <ProductForm initialProduct={product} categories={categories} />
    </div>
  );
}

