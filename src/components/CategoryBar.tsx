import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  return (
    <div className="py-8 bg-white border-b border-surface-border/60">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-bold font-display text-copy-primary">
              Popular Categories
            </h2>
            <p className="text-xs text-copy-secondary">
              Browse top deals curated by department
            </p>
          </div>
          <Link
            href="/categories"
            className="text-xs font-semibold text-brand-600 hover:text-brand-700 hover:underline"
          >
            View All Categories →
          </Link>
        </div>

        {/* Scrollable / Responsive grid */}
        <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-9 gap-3">
          {categories.map((cat) => (
            <Link
              key={cat.id}
              href={`/categories/${cat.slug}`}
              className="group flex flex-col items-center text-center p-2.5 rounded-2xl hover:bg-brand-50/70 border border-transparent hover:border-brand-200 transition-all duration-200"
            >
              <div className="relative w-14 h-14 sm:w-16 sm:h-16 rounded-full overflow-hidden mb-2 bg-[#F3F5F3] border border-surface-border group-hover:scale-105 transition-transform shadow-soft-sm">
                <Image
                  src={cat.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=200'}
                  alt={cat.name}
                  fill
                  sizes="64px"
                  className="object-cover"
                />
              </div>
              <span className="text-xs font-medium text-copy-primary group-hover:text-brand-700 line-clamp-1">
                {cat.name}
              </span>
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
}

