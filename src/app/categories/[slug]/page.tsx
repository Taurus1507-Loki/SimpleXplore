import React from 'react';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { db } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import { ArrowLeft } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface CategoryDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: CategoryDetailPageProps) {
  const category = await db.getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category Not Found' };
  return {
    title: `${category.name} Deals & Products | SimpleXplore`,
    description: category.description || `Browse the best affiliate deals in ${category.name} on SimpleXplore.`,
  };
}

export default async function CategoryDetailPage({ params }: CategoryDetailPageProps) {
  const category = await db.getCategoryBySlug(params.slug);

  if (!category) {
    notFound();
  }

  const { products, total } = await db.getProducts({
    status: 'published',
    categoryId: category.id,
    sort: 'newest',
  });

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      {/* Back button and Header */}
      <div className="space-y-4">
        <Link
          href="/categories"
          className="inline-flex items-center gap-1.5 text-xs font-semibold text-brand-600 hover:text-brand-700"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>All Categories</span>
        </Link>

        <div>
          <h1 className="text-3xl sm:text-4xl font-extrabold font-display text-copy-primary">
            {category.name}
          </h1>
          <p className="text-sm text-copy-secondary mt-1">
            {category.description || `Explore ${total} top-rated products in ${category.name}`}
          </p>
        </div>
      </div>

      <ProductGrid 
        products={products} 
        emptyMessage={`No products currently available in ${category.name}. Check back soon!`}
      />
    </div>
  );
}

