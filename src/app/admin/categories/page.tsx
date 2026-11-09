import React from 'react';
import { db } from '@/lib/db';
import { Layers } from 'lucide-react';
import CategoriesClient from './CategoriesClient';

export const revalidate = 0;

export default async function AdminCategoriesPage() {
  const [categories, counts] = await Promise.all([db.getAllCategories(), db.countProductsByCategory()]);

  return (
    <div className="space-y-6 max-w-6xl">
      <div>
        <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2.5">
          <Layers className="w-7 h-7 text-brand-600" />
          Categories
        </h1>
        <p className="text-xs text-copy-secondary mt-1">
          Add, rename, reorder, hide or delete the departments shown on SimpleXplore.
        </p>
      </div>

      <CategoriesClient initialCategories={categories} productCounts={counts} />
    </div>
  );
}
