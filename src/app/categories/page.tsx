import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { db } from '@/lib/db';
import { ArrowRight, Layers } from 'lucide-react';

export const dynamic = 'force-dynamic';

export default async function CategoriesPage() {
  const categories = await db.getCategories();

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 space-y-8">
      <div>
        <h1 className="text-3xl font-extrabold font-display text-copy-primary flex items-center gap-2">
          <Layers className="w-7 h-7 text-brand-600" />
          Shop By Category
        </h1>
        <p className="text-sm text-copy-secondary mt-1">
          Explore curated products and verified deals categorized by department
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {categories.map((cat) => (
          <Link
            key={cat.id}
            href={`/categories/${cat.slug}`}
            className="group relative rounded-2xl overflow-hidden bg-white border border-surface-border hover:shadow-card-hover hover:border-brand-400 transition-all duration-300 flex flex-col justify-between"
          >
            <div className="relative h-48 w-full bg-[#F3F5F3] overflow-hidden">
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=600'}
                alt={cat.name}
                fill
                sizes="(max-width: 768px) 100vw, 33vw"
                className="object-cover group-hover:scale-105 transition-transform duration-500 ease-out"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent" />
              <div className="absolute bottom-3 left-4 right-4">
                <h3 className="text-xl font-bold text-white font-display">
                  {cat.name}
                </h3>
              </div>
            </div>

            <div className="p-4 flex items-center justify-between">
              <p className="text-xs text-copy-secondary line-clamp-1 pr-2">
                {cat.description || 'Browse curated products in this department'}
              </p>
              <span className="text-xs font-semibold text-brand-600 group-hover:translate-x-1 transition-transform flex items-center gap-1 flex-shrink-0">
                <span>Explore</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </span>
            </div>
          </Link>
        ))}
      </div>
    </div>
  );
}

