import React from 'react';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Link from 'next/link';
import { db } from '@/lib/db';
import { formatPrice } from '@/lib/utils/formatters';
import { 
  Star, 
  ExternalLink, 
  CheckCircle2, 
  ShieldCheck, 
  Sparkles, 
  TrendingUp, 
  ArrowLeft,
  Share2
} from 'lucide-react';
import ProductGrid from '@/components/ProductGrid';
import ProductActions from './ProductActions';

interface ProductDetailPageProps {
  params: {
    slug: string;
  };
}

export async function generateMetadata({ params }: ProductDetailPageProps) {
  const product = await db.getProductBySlug(params.slug);
  if (!product) return { title: 'Product Not Found' };

  return {
    title: product.seo_title || `${product.title} - Best Deal at ${formatPrice(product.current_price, product.currency)}`,
    description: product.seo_description || product.description?.slice(0, 160) || `Buy ${product.title} on ${product.retailer} with verified discount.`,
    openGraph: {
      title: product.title,
      description: product.description || `Check out ${product.title} on SimpleXplore.`,
      images: [
        {
          url: product.image_url,
          width: 800,
          height: 800,
          alt: product.title,
        },
      ],
    },
  };
}

export default async function ProductDetailPage({ params }: ProductDetailPageProps) {
  const product = await db.getProductBySlug(params.slug);

  if (!product) {
    notFound();
  }

  // Related products from same category or retailer
  const { products: relatedProducts } = await db.getProducts({
    status: 'published',
    categoryId: product.category_id || undefined,
    limit: 4,
  });

  const filteredRelated = relatedProducts.filter(p => p.id !== product.id).slice(0, 4);

  // JSON-LD structured schema for search engines
  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    image: [product.image_url],
    description: product.description,
    brand: {
      '@type': 'Brand',
      name: product.retailer,
    },
    offers: {
      '@type': 'Offer',
      priceCurrency: product.currency,
      price: product.current_price,
      availability: 'https://schema.org/InStock',
      url: `${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/r/${product.id}`,
    },
    ...(product.rating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count || 10,
          },
        }
      : {}),
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
      {/* Inject JSON-LD */}
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(jsonLd) }}
      />

      {/* Breadcrumbs */}
      <div className="flex items-center gap-2 text-xs text-copy-muted">
        <Link href="/" className="hover:text-brand-600">Home</Link>
        <span>/</span>
        <Link href="/products" className="hover:text-brand-600">Products</Link>
        <span>/</span>
        {product.category && (
          <>
            <Link href={`/categories/${product.category.slug}`} className="hover:text-brand-600">
              {product.category.name}
            </Link>
            <span>/</span>
          </>
        )}
        <span className="text-copy-primary font-medium truncate max-w-xs">{product.title}</span>
      </div>

      {/* Main Product Showcase Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12 bg-white rounded-3xl p-6 sm:p-8 border border-surface-border shadow-soft-sm">
        {/* Left: Product Image Showcase (5 cols) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="relative aspect-square w-full rounded-2xl bg-[#F8FAF8] border border-surface-border overflow-hidden p-6 flex items-center justify-center">
            <Image
              src={product.image_url}
              alt={product.title}
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 40vw"
              className="object-contain p-4 hover:scale-105 transition-transform duration-300"
            />
          </div>

          <div className="flex items-center justify-center gap-2 text-xs text-copy-secondary">
            <ShieldCheck className="w-4 h-4 text-brand-600" />
            <span>Genuine retailer product preview</span>
          </div>
        </div>

        {/* Right: Product Info & Affiliate Actions (7 cols) */}
        <div className="lg:col-span-7 flex flex-col justify-between space-y-6">
          <div className="space-y-4">
            {/* Badges & Retailer */}
            <div className="flex flex-wrap items-center gap-2">
              <span className="bg-brand-50 text-brand-800 border border-brand-200/80 text-xs font-semibold px-3 py-1 rounded-full">
                Available on {product.retailer}
              </span>

              {product.discount && product.discount > 0 ? (
                <span className="bg-rose-50 text-rose-700 border border-rose-200 text-xs font-bold px-2.5 py-0.5 rounded-full">
                  {product.discount}% Discount
                </span>
              ) : null}

              {product.trending && (
                <span className="bg-amber-50 text-amber-800 border border-amber-200 text-xs font-semibold px-2.5 py-0.5 rounded-full flex items-center gap-1">
                  <TrendingUp className="w-3.5 h-3.5 text-amber-600" />
                  Trending Pick
                </span>
              )}
            </div>

            {/* Title */}
            <h1 className="text-2xl sm:text-3xl font-extrabold font-display text-copy-primary leading-tight">
              {product.title}
            </h1>

            {/* Ratings & Verification */}
            {product.rating ? (
              <div className="flex items-center gap-3 pt-1">
                <div className="flex items-center gap-1 bg-amber-50 text-amber-800 px-2.5 py-1 rounded-lg text-sm font-bold border border-amber-200">
                  <Star className="w-4 h-4 fill-amber-400 text-amber-400" />
                  <span>{product.rating.toFixed(1)}</span>
                </div>
                {product.review_count ? (
                  <span className="text-xs text-copy-secondary">
                    Based on {product.review_count.toLocaleString('en-IN')} verified reviews on {product.retailer}
                  </span>
                ) : null}
              </div>
            ) : null}

            {/* Pricing Box */}
            <div className="p-4 rounded-2xl bg-surface-bg border border-surface-border/80 flex items-baseline gap-3">
              <div className="text-3xl font-black text-copy-primary font-display">
                {formatPrice(product.current_price, product.currency)}
              </div>
              {product.original_price && product.original_price > product.current_price && (
                <div className="text-sm text-copy-muted line-through font-medium">
                  {formatPrice(product.original_price, product.currency)}
                </div>
              )}
              {product.discount && product.discount > 0 ? (
                <div className="text-xs font-bold text-brand-600 bg-brand-50 px-2 py-0.5 rounded-md">
                  You save {formatPrice(product.original_price! - product.current_price, product.currency)} ({product.discount}%)
                </div>
              ) : null}
            </div>

            {/* Product Highlights */}
            {product.highlights && product.highlights.length > 0 && (
              <div className="space-y-2 pt-2">
                <h4 className="text-xs font-bold uppercase tracking-wider text-copy-secondary">
                  Key Highlights:
                </h4>
                <ul className="space-y-1.5">
                  {product.highlights.map((item, idx) => (
                    <li key={idx} className="flex items-start gap-2 text-xs sm:text-sm text-copy-primary leading-relaxed">
                      <CheckCircle2 className="w-4 h-4 text-brand-600 flex-shrink-0 mt-0.5" />
                      <span>{item}</span>
                    </li>
                  ))}
                </ul>
              </div>
            )}

            {/* Description */}
            {product.description && (
              <div className="pt-2 text-xs sm:text-sm text-copy-secondary leading-relaxed border-t border-surface-border/60">
                <p>{product.description}</p>
              </div>
            )}
          </div>

          {/* Interactive Actions (Wishlist & Affiliate Purchase Button) */}
          <div className="space-y-3 pt-4 border-t border-surface-border">
            <ProductActions product={product} />

            {/* Affiliate Disclosure Notice */}
            <div className="text-[11px] text-copy-muted bg-[#F5F8F5] p-3 rounded-xl border border-surface-border/60">
              <span className="font-semibold text-copy-secondary">Affiliate Disclosure:</span> When you click &quot;Buy on {product.retailer}&quot; and complete a purchase, SimpleXplore may earn an affiliate commission at no extra cost to you. We do not sell items directly.
            </div>
          </div>
        </div>
      </div>

      {/* Related Products Section */}
      {filteredRelated.length > 0 && (
        <section className="space-y-6 pt-6">
          <div className="flex items-center justify-between">
            <h3 className="text-xl font-bold font-display text-copy-primary">
              Related Products You Might Like
            </h3>
            <Link
              href="/products"
              className="text-xs font-semibold text-brand-600 hover:text-brand-700"
            >
              Browse More Deals →
            </Link>
          </div>
          <ProductGrid products={filteredRelated} />
        </section>
      )}
    </div>
  );
}

