import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { ArrowUpRight } from 'lucide-react';
import { db } from '@/lib/db';
import PageHeader from '@/components/PageHeader';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Shop by category',
  description:
    "Browse fashion, women's and men's fashion, footwear, beauty, electronics, home & kitchen, accessories and lifestyle products from top Indian retailers.",
  alternates: { canonical: '/categories' },
};

export default async function CategoriesPage() {
  const categories = await db.getCategories();

  return (
    <div className="mx-auto max-w-7xl space-y-8 px-4 py-8 sm:px-6 sm:py-10 lg:px-8">
      <PageHeader
        crumbs={[{ name: 'Categories', path: '/categories' }]}
        eyebrow="Departments"
        title="Shop by category"
        description="Every department on SimpleXplore, from everyday essentials to standout finds."
      />

      <ul className="grid grid-cols-1 gap-4 sm:grid-cols-2 sm:gap-5 lg:grid-cols-3">
        {categories.map((cat, i) => (
          <li key={cat.id}>
            <Link
              href={`/categories/${cat.slug}`}
              className="group relative flex aspect-[4/3] overflow-hidden rounded-3xl bg-ink sm:aspect-[5/4]"
            >
              <Image
                src={cat.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=800'}
                alt=""
                fill
                priority={i < 3}
                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                className="object-cover opacity-90 transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-ink/20 to-transparent" aria-hidden="true" />
              <div className="relative mt-auto flex w-full items-end justify-between gap-4 p-5 sm:p-6">
                <div>
                  <h2 className="font-display text-2xl font-bold tracking-tight text-white">{cat.name}</h2>
                  {cat.description && <p className="mt-1 line-clamp-2 text-sm text-white/75">{cat.description}</p>}
                </div>
                <span
                  className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-ink transition-transform duration-300 ease-out-expo group-hover:-translate-y-0.5 group-hover:translate-x-0.5"
                  aria-hidden="true"
                >
                  <ArrowUpRight className="h-5 w-5" />
                </span>
              </div>
            </Link>
          </li>
        ))}
      </ul>
    </div>
  );
}
