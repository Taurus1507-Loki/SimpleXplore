import React from 'react';
import Link from 'next/link';
import Image from 'next/image';
import { Category } from '@/types';
import SectionHeader from './SectionHeader';
import { Reveal } from './motion/Reveal';

interface CategoryBarProps {
  categories: Category[];
}

export default function CategoryBar({ categories }: CategoryBarProps) {
  if (categories.length === 0) return null;

  return (
    <section aria-labelledby="categories-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
      <Reveal>
        <SectionHeader
          id="categories-title"
          eyebrow="Shop by category"
          title="Find your next favourite"
          href="/categories"
          linkLabel="All categories"
        />
        {/* Scroll-snap row on phones, full grid on larger screens. */}
        <ul className="no-scrollbar -mx-4 mt-6 flex snap-x snap-mandatory gap-3 overflow-x-auto px-4 pb-2 sm:mx-0 sm:grid sm:grid-cols-5 sm:overflow-visible sm:px-0 lg:grid-cols-9">
          {categories.map((cat) => (
            <li key={cat.id} className="w-[6.5rem] shrink-0 snap-start sm:w-auto">
              <Link
                href={`/categories/${cat.slug}`}
                className="group flex flex-col items-center gap-2.5 rounded-2xl p-2 text-center transition-colors hover:bg-white"
              >
                <span className="relative block aspect-square w-full overflow-hidden rounded-2xl bg-surface-muted ring-1 ring-surface-border transition-shadow group-hover:shadow-soft-md">
                  <Image
                    src={cat.image || 'https://images.unsplash.com/photo-1445205170230-053b83016050?w=300'}
                    alt=""
                    fill
                    sizes="(max-width: 640px) 104px, 140px"
                    className="object-cover transition-transform duration-500 ease-out-expo group-hover:scale-[1.04]"
                  />
                </span>
                <span className="line-clamp-2 text-xs font-medium leading-tight text-copy-primary group-hover:text-brand-800 sm:text-[0.8125rem]">
                  {cat.name}
                </span>
              </Link>
            </li>
          ))}
        </ul>
      </Reveal>
    </section>
  );
}
