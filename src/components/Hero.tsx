'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import Image from '@/components/SafeImage';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, ArrowUpRight } from 'lucide-react';
import { Product } from '@/types';
import { formatPrice } from '@/lib/utils/formatters';
import { StaggerGroup, StaggerItem, EASE_OUT_EXPO } from './motion/Reveal';

interface HeroProps {
  showcase: Product[];
}

const POPULAR = [
  { label: "Women's fashion", href: '/categories/womens-fashion' },
  { label: 'Sneakers', href: '/products?search=sneakers' },
  { label: 'Earbuds', href: '/products?search=earbuds' },
  { label: 'Skincare', href: '/categories/beauty-personal-care' },
];

export default function Hero({ showcase }: HeroProps) {
  const router = useRouter();
  const [query, setQuery] = useState('');
  const tiles = showcase.slice(0, 3);
  // Bento (one tall + two small) needs three products; otherwise use equal tiles.
  const tall = tiles.length === 3;

  return (
    <section aria-labelledby="hero-title" className="relative overflow-hidden border-b border-surface-border bg-white">
      {/* Quiet brand field — no glows, just a soft tinted plane behind the showcase. */}
      <div aria-hidden="true" className="absolute inset-y-0 right-0 hidden w-[44%] bg-brand-50 lg:block" />

      <div className="relative mx-auto grid max-w-7xl items-center gap-10 px-4 py-12 sm:px-6 sm:py-16 lg:grid-cols-12 lg:gap-8 lg:px-8 lg:py-20">
        <StaggerGroup className="lg:col-span-6">
          <StaggerItem>
            <p className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.16em] text-brand-700">
              <span className="h-1.5 w-1.5 rounded-full bg-accent-400" aria-hidden="true" />
              India&apos;s smart shopping finds
            </p>
          </StaggerItem>

          <StaggerItem fade={false}>
            <h1
              id="hero-title"
              className="mt-4 font-display text-[2.6rem] font-extrabold leading-[1.02] tracking-tightest text-ink sm:text-6xl lg:text-[4.25rem]"
            >
              Discover products <span className="text-brand-600">you&apos;ll love.</span>
            </h1>
          </StaggerItem>

          <StaggerItem fade={false}>
            <p className="mt-5 max-w-lg text-base leading-relaxed text-copy-secondary sm:text-lg">
              Explore smart shopping finds, trending products and exciting deals — handpicked from Amazon, Flipkart,
              Myntra and more.
            </p>
          </StaggerItem>

          <StaggerItem>
            <form
              role="search"
              onSubmit={(e) => {
                e.preventDefault();
                const q = query.trim();
                router.push(q ? `/products?search=${encodeURIComponent(q)}` : '/products');
              }}
              className="mt-8 flex max-w-lg flex-col gap-2 sm:flex-row"
            >
              <label htmlFor="hero-search" className="sr-only">
                Search products
              </label>
              <div className="relative flex-1">
                <Search className="pointer-events-none absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-copy-muted" aria-hidden="true" />
                <input
                  id="hero-search"
                  type="search"
                  enterKeyHint="search"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="What are you shopping for?"
                  className="h-14 w-full rounded-2xl border border-surface-border bg-white pl-12 pr-4 text-base text-copy-primary shadow-soft-sm placeholder:text-copy-muted focus:border-brand-500 focus:outline-none focus:ring-4 focus:ring-brand-500/10"
                />
              </div>
              <motion.button
                type="submit"
                whileTap={{ scale: 0.97 }}
                className="h-14 rounded-2xl bg-brand-600 px-7 text-sm font-semibold text-white shadow-soft-md transition-colors hover:bg-brand-700"
              >
                Search products
              </motion.button>
            </form>
          </StaggerItem>

          <StaggerItem>
            <div className="mt-5 flex flex-wrap items-center gap-2 text-sm">
              <span className="text-copy-muted">Popular:</span>
              {POPULAR.map((p) => (
                <Link
                  key={p.href}
                  href={p.href}
                  className="inline-flex min-h-[36px] items-center rounded-lg border border-surface-border px-3 text-copy-secondary transition-colors hover:border-brand-300 hover:text-brand-800"
                >
                  {p.label}
                </Link>
              ))}
            </div>
          </StaggerItem>
        </StaggerGroup>

        {/* Showcase: real published products, not stock illustrations. */}
        {tiles.length > 0 && (
          <div className="relative lg:col-span-6 lg:pl-8">
            <div className="grid grid-cols-2 gap-3 sm:gap-4">
              {tiles.map((p, i) => (
                <motion.div
                  key={p.id}
                  initial={{ opacity: 0, y: 24 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.7, delay: 0.25 + i * 0.1, ease: EASE_OUT_EXPO }}
                  className={tall && i === 0 ? 'row-span-2' : ''}
                >
                  <Link
                    href={`/products/${p.slug}`}
                    className="group relative flex h-full flex-col overflow-hidden rounded-3xl border border-surface-border bg-white shadow-soft-md transition-shadow hover:shadow-soft-lg"
                  >
                    <div className={`relative ${tall && i === 0 ? 'min-h-[18rem] flex-1 sm:min-h-[24rem]' : tall ? 'aspect-[4/3]' : 'aspect-[4/5]'}`}>
                      <Image
                        src={p.image_url}
                        alt={p.title}
                        fill
                        priority={i === 0}
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover transition-transform duration-700 ease-out-expo group-hover:scale-[1.03]"
                      />
                    </div>
                    <div className="flex items-center justify-between gap-2 border-t border-surface-border px-3 py-2.5 sm:px-4">
                      <span className="line-clamp-1 text-xs font-medium text-copy-secondary sm:text-sm">{p.title}</span>
                      {p.current_price > 0 ? (
                        <span className="tabular shrink-0 font-display text-sm font-bold text-ink">
                          {formatPrice(p.current_price, p.currency)}
                        </span>
                      ) : (
                        <ArrowUpRight className="h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                      )}
                    </div>
                    {p.discount && p.discount > 0 ? (
                      <span className="tabular absolute left-3 top-3 rounded-md bg-accent-400 px-2 py-0.5 text-xs font-bold text-ink">
                        {p.discount}% off
                      </span>
                    ) : null}
                  </Link>
                </motion.div>
              ))}
            </div>
          </div>
        )}
      </div>
    </section>
  );
}
