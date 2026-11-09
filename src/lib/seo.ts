import type { Product, Category } from '@/types';

export const SITE_NAME = 'SimpleXplore';
export const SITE_TAGLINE = 'Shop Smart • Explore More';
export const SITE_DESCRIPTION =
  'Discover handpicked products, trending finds and the latest price drops from Amazon, Flipkart, Myntra and other top Indian retailers — all in one place.';

export function getSiteUrl(): string {
  return (process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000').replace(/\/+$/, '');
}

export function absoluteUrl(path = '/'): string {
  return `${getSiteUrl()}${path.startsWith('/') ? path : `/${path}`}`;
}

/**
 * Serialize JSON-LD safely. Product titles/descriptions can come from
 * Telegram posts and scraped metadata (untrusted), so `<` is escaped to
 * prevent breaking out of the <script> tag.
 */
export function serializeJsonLd(data: unknown): string {
  return JSON.stringify(data)
    .replace(/</g, '\\u003c')
    .replace(/>/g, '\\u003e')
    .replace(/&/g, '\\u0026')
    .replace(/\u2028/g, '\\u2028')
    .replace(/\u2029/g, '\\u2029');
}

export function truncate(text: string, max = 158): string {
  const clean = text.replace(/\s+/g, ' ').trim();
  if (clean.length <= max) return clean;
  return clean.slice(0, max - 1).replace(/\s+\S*$/, '') + '…';
}

export function organizationJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'Organization',
    '@id': `${getSiteUrl()}/#organization`,
    name: SITE_NAME,
    url: getSiteUrl(),
    logo: absoluteUrl('/icon.svg'),
    slogan: SITE_TAGLINE,
  };
}

export function websiteJsonLd() {
  return {
    '@context': 'https://schema.org',
    '@type': 'WebSite',
    '@id': `${getSiteUrl()}/#website`,
    name: SITE_NAME,
    url: getSiteUrl(),
    inLanguage: 'en-IN',
    publisher: { '@id': `${getSiteUrl()}/#organization` },
    potentialAction: {
      '@type': 'SearchAction',
      target: {
        '@type': 'EntryPoint',
        urlTemplate: `${getSiteUrl()}/products?search={search_term_string}`,
      },
      'query-input': 'required name=search_term_string',
    },
  };
}

export function breadcrumbJsonLd(items: Array<{ name: string; path: string }>) {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: items.map((item, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      name: item.name,
      item: absoluteUrl(item.path),
    })),
  };
}

/**
 * Product structured data, limited to facts we actually store. No invented
 * availability, review counts or brand: the retailer is the seller, not the brand.
 */
export function productJsonLd(product: Product) {
  const images = [product.image_url, ...(product.images?.map((i) => i.image_url) ?? [])].filter(Boolean);
  const hasVerifiedRating =
    typeof product.rating === 'number' &&
    product.rating > 0 &&
    typeof product.review_count === 'number' &&
    product.review_count > 0;

  return {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: product.title,
    url: absoluteUrl(`/products/${product.slug}`),
    image: images,
    ...(product.description ? { description: truncate(product.description, 5000) } : {}),
    ...(product.category ? { category: product.category.name } : {}),
    ...(product.current_price > 0
      ? {
          offers: {
            '@type': 'Offer',
            url: absoluteUrl(`/products/${product.slug}`),
            priceCurrency: product.currency,
            price: product.current_price,
            seller: { '@type': 'Organization', name: product.retailer },
          },
        }
      : {}),
    ...(hasVerifiedRating
      ? {
          aggregateRating: {
            '@type': 'AggregateRating',
            ratingValue: product.rating,
            reviewCount: product.review_count,
            bestRating: 5,
          },
        }
      : {}),
  };
}

export function itemListJsonLd(name: string, products: Product[]) {
  return {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name,
    numberOfItems: products.length,
    itemListElement: products.slice(0, 30).map((p, i) => ({
      '@type': 'ListItem',
      position: i + 1,
      url: absoluteUrl(`/products/${p.slug}`),
      name: p.title,
    })),
  };
}

export function categoryDescription(category: Category): string {
  return (
    category.description ||
    `Browse handpicked ${category.name.toLowerCase()} products and the latest price drops from top Indian retailers on ${SITE_NAME}.`
  );
}
