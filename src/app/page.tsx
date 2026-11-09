import React from 'react';
import type { Metadata } from 'next';
import Link from 'next/link';
import { db } from '@/lib/db';
import Hero from '@/components/Hero';
import CategoryBar from '@/components/CategoryBar';
import ProductGrid from '@/components/ProductGrid';
import SectionHeader from '@/components/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import { Product } from '@/types';
import { SITE_DESCRIPTION, SITE_NAME, SITE_TAGLINE } from '@/lib/seo';

export const dynamic = 'force-dynamic';

export async function generateMetadata(): Promise<Metadata> {
  const s = await db.getSettings();
  return {
    title: { absolute: `${s.site_name || SITE_NAME} — ${s.tagline || SITE_TAGLINE} | Deals & Trending Products in India` },
    description: SITE_DESCRIPTION,
    alternates: { canonical: '/' },
  };
}

function ProductSection({
  id,
  eyebrow,
  title,
  description,
  href,
  linkLabel,
  products,
  tinted = false,
}: {
  id: string;
  eyebrow: string;
  title: string;
  description: string;
  href: string;
  linkLabel: string;
  products: Product[];
  tinted?: boolean;
}) {
  if (products.length === 0) return null;
  return (
    <section aria-labelledby={id} className={tinted ? 'border-y border-surface-border bg-white py-14 sm:py-20' : ''}>
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal>
          <SectionHeader id={id} eyebrow={eyebrow} title={title} description={description} href={href} linkLabel={linkLabel} />
        </Reveal>
        <div className="mt-7">
          <ProductGrid products={products} />
        </div>
      </div>
    </section>
  );
}

export default async function HomePage() {
  const [settings, categories, featuredData, trendingData, dealsData, recentData] = await Promise.all([
    db.getSettings(),
    db.getCategories(),
    db.getProducts({ status: 'published', isFeatured: true, limit: 4 }),
    db.getProducts({ status: 'published', isTrending: true, limit: 4 }),
    db.getProducts({ status: 'published', isDeals: true, sort: 'discount', limit: 4 }),
    db.getProducts({ status: 'published', sort: 'newest', limit: 8 }),
  ]);
  const cfg = settings.homepage_config;

  const showcase = featuredData.products.length >= 3 ? featuredData.products : recentData.products;

  return (
    <div className="space-y-14 pb-20 sm:space-y-20">
      {cfg.show_hero !== false && <Hero showcase={showcase} />}

      {cfg.show_categories !== false && <CategoryBar categories={categories} />}

      <ProductSection
        id="featured-title"
        eyebrow="Editor's picks"
        title="Featured products"
        description="Standout finds our team keeps coming back to."
        href="/products?featured=true"
        linkLabel="More featured"
        products={featuredData.products}
      />

      {cfg.show_trending !== false && (
        <ProductSection
          id="trending-title"
          eyebrow="Popular this week"
          title="Trending right now"
          description="What shoppers across India are checking out."
          href="/trending"
          linkLabel="All trending"
          products={trendingData.products}
          tinted
        />
      )}

      {cfg.show_deals !== false && (
        <ProductSection
          id="deals-title"
          eyebrow="Price drops"
          title="Latest deals"
          description="The biggest discounts currently listed, sorted by savings."
          href="/deals"
          linkLabel="All deals"
          products={dealsData.products}
        />
      )}

      <ProductSection
        id="recent-title"
        eyebrow="Just added"
        title="Recently added"
        description="Fresh finds, newest first."
        href="/products"
        linkLabel="Browse everything"
        products={recentData.products}
      />

      {/* Trust strip: describes how the site works, makes no performance claims. */}
      <section aria-labelledby="how-title" className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <Reveal className="grid gap-8 rounded-3xl bg-ink px-6 py-10 text-white sm:px-10 sm:py-12 lg:grid-cols-12 lg:gap-12">
          <div className="lg:col-span-5">
            <h2 id="how-title" className="font-display text-2xl font-bold tracking-tight sm:text-3xl">
              How SimpleXplore works
            </h2>
            <p className="mt-3 text-sm leading-relaxed text-white/70">
              We&apos;re a discovery site, not a store. Prices, stock and delivery are handled by the retailer — we
              simply help you find the right product faster.
            </p>
          </div>
          <ol className="grid gap-6 sm:grid-cols-3 lg:col-span-7">
            {[
              ['Discover', 'Browse handpicked products across fashion, electronics, beauty and home.'],
              ['Compare', 'See the current price, original price and retailer at a glance.'],
              ['Buy at the retailer', 'Checkout happens securely on Amazon, Flipkart, Myntra and others.'],
            ].map(([title, body], i) => (
              <li key={title} className="border-t border-white/15 pt-4">
                <span className="tabular font-display text-sm font-bold text-accent-400">0{i + 1}</span>
                <p className="mt-1 font-semibold">{title}</p>
                <p className="mt-1 text-sm leading-relaxed text-white/65">{body}</p>
              </li>
            ))}
          </ol>
          <p className="text-xs text-white/50 lg:col-span-12">
            We may earn a commission when you buy through links on this site, at no extra cost to you.{' '}
            <Link href="/affiliate-disclosure" className="underline underline-offset-4 hover:text-white">
              Read our affiliate disclosure
            </Link>
            .
          </p>
        </Reveal>
      </section>
    </div>
  );
}
