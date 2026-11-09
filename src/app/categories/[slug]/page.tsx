import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { db } from '@/lib/db';
import ProductGrid from '@/components/ProductGrid';
import PageHeader from '@/components/PageHeader';
import JsonLd from '@/components/JsonLd';
import { categoryDescription, itemListJsonLd } from '@/lib/seo';

export const dynamic = 'force-dynamic';

interface CategoryDetailPageProps {
  params: Promise<{ slug: string }>;
}

export async function generateMetadata(props: CategoryDetailPageProps): Promise<Metadata> {
  const params = await props.params;
  const category = await db.getCategoryBySlug(params.slug);
  if (!category) return { title: 'Category not found', robots: { index: false, follow: true } };
  const description = categoryDescription(category);
  return {
    title: `${category.name} — best deals & products`,
    description,
    alternates: { canonical: `/categories/${category.slug}` },
    openGraph: {
      title: `${category.name} deals on SimpleXplore`,
      description,
      url: `/categories/${category.slug}`,
      images: category.image ? [{ url: category.image, alt: category.name }] : undefined,
    },
  };
}

export default async function CategoryDetailPage(props: CategoryDetailPageProps) {
  const params = await props.params;
  const category = await db.getCategoryBySlug(params.slug);
  if (!category) notFound();

  const { products, total } = await db.getProducts({
    status: 'published',
    categoryId: category.id,
    sort: 'newest',
  });

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      {products.length > 0 && <JsonLd data={itemListJsonLd(category.name, products)} />}
      <PageHeader
        crumbs={[
          { name: 'Categories', path: '/categories' },
          { name: category.name, path: `/categories/${category.slug}` },
        ]}
        eyebrow="Category"
        title={category.name}
        description={categoryDescription(category)}
        meta={total > 0 ? `${total} ${total === 1 ? 'product' : 'products'}` : undefined}
      />
      <ProductGrid
        products={products}
        priorityCount={4}
        emptyMessage={`No products in ${category.name} yet. Check back soon.`}
      />
    </div>
  );
}
