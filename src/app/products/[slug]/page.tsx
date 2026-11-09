import React from 'react';
import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { Star, Check, Eye, Info } from 'lucide-react';
import { db } from '@/lib/db';
import { getAdminSession } from '@/lib/auth';
import { formatPrice } from '@/lib/utils/formatters';
import { productJsonLd, truncate } from '@/lib/seo';
import ProductGrid from '@/components/ProductGrid';
import ProductImageGallery from '@/components/ProductImageGallery';
import Breadcrumbs from '@/components/Breadcrumbs';
import JsonLd from '@/components/JsonLd';
import SectionHeader from '@/components/SectionHeader';
import { Reveal } from '@/components/motion/Reveal';
import ProductActions from './ProductActions';
import { Product } from '@/types';

export const dynamic = 'force-dynamic';

interface ProductDetailPageProps {
  params: { slug: string };
}

/** Published products for everyone; drafts only for the signed-in admin (preview). */
async function loadProduct(slug: string): Promise<{ product: Product; preview: boolean } | null> {
  const published = await db.getPublishedProductBySlug(slug);
  if (published) return { product: published, preview: false };
  if (await getAdminSession()) {
    const draft = await db.getProductBySlug(slug);
    if (draft) return { product: draft, preview: true };
  }
  return null;
}

export async function generateMetadata({ params }: ProductDetailPageProps): Promise<Metadata> {
  const result = await loadProduct(params.slug);
  if (!result) return { title: 'Product not found', robots: { index: false, follow: true } };
  const { product, preview } = result;

  const priceText = product.current_price > 0 ? ` at ${formatPrice(product.current_price, product.currency)}` : '';
  // The layout template appends "| SimpleXplore", so drop a brand suffix admins may have typed.
  const seoTitle = product.seo_title?.replace(/\s*[-|–—]\s*SimpleXplore\s*$/i, '').trim();
  const title = seoTitle || `${product.title}${priceText} on ${product.retailer}`;
  const description = truncate(
    product.seo_description ||
      product.description ||
      `${product.title} — see the latest price on ${product.retailer}${priceText}. Compare and buy via SimpleXplore.`
  );
  const path = `/products/${product.slug}`;

  return {
    title,
    description,
    alternates: { canonical: path },
    robots: preview ? { index: false, follow: false } : undefined,
    openGraph: {
      type: 'website',
      url: path,
      title: product.title,
      description,
      images: product.image_url ? [{ url: product.image_url, alt: product.title }] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: product.title,
      description,
      images: product.image_url ? [product.image_url] : undefined,
    },
  };
}

function formatUpdated(date: string | undefined) {
  if (!date) return null;
  const d = new Date(date);
  if (Number.isNaN(d.getTime())) return null;
  return d.toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const result = await loadProduct(params.slug);
  if (!result) notFound();
  const { product, preview } = result;

  const { products: relatedProducts } = await db.getProducts({
    status: 'published',
    categoryId: product.category_id || undefined,
    limit: 5,
  });
  const related = relatedProducts.filter((p) => p.id !== product.id).slice(0, 4);

  const hasPrice = product.current_price > 0;
  const showOriginal = hasPrice && !!product.original_price && product.original_price > product.current_price;
  const savings = showOriginal ? product.original_price! - product.current_price : 0;
  const updated = formatUpdated(product.updated_at || product.created_at);

  const crumbs = [
    { name: 'Products', path: '/products' },
    ...(product.category ? [{ name: product.category.name, path: `/categories/${product.category.slug}` }] : []),
    { name: product.title, path: `/products/${product.slug}` },
  ];

  return (
    <div className="mx-auto max-w-7xl space-y-14 px-4 py-6 sm:px-6 sm:py-8 lg:px-8">
      {!preview && <JsonLd data={productJsonLd(product)} />}

      {preview && (
        <div role="status" className="flex items-center gap-2 rounded-xl border border-accent-400/60 bg-accent-50 px-4 py-3 text-sm text-accent-700">
          <Eye className="h-4 w-4 shrink-0" aria-hidden="true" />
          <span>
            <strong>Admin preview.</strong> This product is a <em>{product.status}</em> and is not visible to the public.
          </span>
        </div>
      )}

      <Breadcrumbs items={crumbs} />

      <article className="grid grid-cols-1 gap-8 lg:grid-cols-12 lg:gap-14">
        <div className="lg:col-span-6">
          <div className="lg:sticky lg:top-32">
            <ProductImageGallery primaryImage={product.image_url} title={product.title} images={product.images} />
          </div>
        </div>

        <div className="flex flex-col gap-6 lg:col-span-6">
          <div>
            <p className="text-xs font-semibold uppercase tracking-[0.14em] text-brand-700">
              {product.retailer}
              {product.category && <span className="text-copy-muted"> · {product.category.name}</span>}
            </p>
            <h1 className="mt-2 font-display text-[1.75rem] font-bold leading-tight tracking-tight text-ink sm:text-4xl">
              {product.title}
            </h1>

            {product.rating ? (
              <div className="mt-3 flex items-center gap-2 text-sm">
                <span className="inline-flex items-center gap-1 rounded-md bg-accent-50 px-2 py-0.5 font-semibold text-accent-700">
                  <Star className="h-4 w-4 fill-accent-400 text-accent-400" aria-hidden="true" />
                  <span className="tabular">{product.rating.toFixed(1)}</span>
                  <span className="sr-only">out of 5</span>
                </span>
                {product.review_count ? (
                  <span className="tabular text-copy-secondary">
                    {product.review_count.toLocaleString('en-IN')} ratings on {product.retailer}
                  </span>
                ) : null}
              </div>
            ) : null}
          </div>

          {/* Price */}
          <div className="rounded-2xl border border-surface-border bg-white p-5">
            {hasPrice ? (
              <>
                <div className="flex flex-wrap items-baseline gap-x-3 gap-y-1">
                  <span className="tabular font-display text-4xl font-bold tracking-tight text-ink">
                    {formatPrice(product.current_price, product.currency)}
                  </span>
                  {showOriginal && (
                    <span className="tabular text-base text-copy-muted line-through">
                      <span className="sr-only">Original price </span>
                      {formatPrice(product.original_price!, product.currency)}
                    </span>
                  )}
                  {product.discount && product.discount > 0 ? (
                    <span className="tabular rounded-md bg-accent-400 px-2 py-0.5 text-sm font-bold text-ink">
                      {product.discount}% off
                    </span>
                  ) : null}
                </div>
                {savings > 0 && (
                  <p className="tabular mt-1.5 text-sm font-medium text-brand-700">
                    You save {formatPrice(savings, product.currency)}
                  </p>
                )}
              </>
            ) : (
              <p className="text-base font-medium text-copy-primary">See today&apos;s price on {product.retailer}</p>
            )}
            {product.availability && (
              <p
                className={`mt-3 inline-flex items-center gap-1.5 rounded-md px-2 py-0.5 text-xs font-semibold ${
                  product.availability === 'in_stock'
                    ? 'bg-brand-50 text-brand-800'
                    : product.availability === 'limited'
                      ? 'bg-accent-50 text-accent-700'
                      : 'bg-red-50 text-red-700'
                }`}
              >
                {product.availability === 'in_stock' ? 'In stock' : product.availability === 'limited' ? 'Limited stock' : 'Out of stock'}
                <span className="font-normal opacity-80">at {product.retailer} when last checked</span>
              </p>
            )}
            <p className="mt-3 flex items-start gap-1.5 text-xs text-copy-muted">
              <Info className="mt-px h-3.5 w-3.5 shrink-0" aria-hidden="true" />
              <span>
                {updated ? `Price last checked ${updated}. ` : ''}Prices and availability can change; the price on{' '}
                {product.retailer} at checkout applies.
              </span>
            </p>
          </div>

          <div className="space-y-3">
            <ProductActions product={product} />
            <p className="text-xs leading-relaxed text-copy-muted">
              <strong className="font-semibold text-copy-secondary">Affiliate link:</strong> if you buy through this
              link, SimpleXplore may earn a commission at no extra cost to you.{' '}
              <Link href="/affiliate-disclosure" className="underline underline-offset-4 hover:text-brand-700">
                Learn more
              </Link>
            </p>
          </div>

          {product.highlights && product.highlights.length > 0 && (
            <section aria-labelledby="highlights-title" className="border-t border-surface-border pt-6">
              <h2 id="highlights-title" className="font-display text-lg font-semibold text-ink">
                Highlights
              </h2>
              <ul className="mt-3 space-y-2.5">
                {product.highlights.map((item, idx) => (
                  <li key={idx} className="flex items-start gap-2.5 text-sm leading-relaxed text-copy-primary">
                    <Check className="mt-0.5 h-4 w-4 shrink-0 text-brand-600" aria-hidden="true" />
                    <span>{item}</span>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {product.description && (
            <section aria-labelledby="description-title" className="border-t border-surface-border pt-6">
              <h2 id="description-title" className="font-display text-lg font-semibold text-ink">
                About this product
              </h2>
              <p className="mt-3 whitespace-pre-line text-sm leading-relaxed text-copy-secondary sm:text-[0.9375rem]">
                {product.description}
              </p>
            </section>
          )}
        </div>
      </article>

      {related.length > 0 && (
        <section aria-labelledby="related-title" className="border-t border-surface-border pt-12">
          <Reveal>
            <SectionHeader
              id="related-title"
              eyebrow="Keep exploring"
              title="Related products"
              href={product.category ? `/categories/${product.category.slug}` : '/products'}
              linkLabel={product.category ? `More in ${product.category.name}` : 'Browse more'}
            />
          </Reveal>
          <div className="mt-7">
            <ProductGrid products={related} />
          </div>
        </section>
      )}
    </div>
  );
}
